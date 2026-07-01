import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'

const cookieName = 'namporn_session'
const sessionDurationSeconds = 60 * 60 * 8

function base64url(value) {
  return Buffer.from(value).toString('base64url')
}

function authSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret && process.env.VERCEL_ENV === 'production') {
    const error = new Error('Authentication is not configured')
    error.code = 'AUTH_NOT_CONFIGURED'
    throw error
  }
  return secret || 'local-development-secret-change-me'
}

function signature(value) {
  return createHmac('sha256', authSecret()).update(value).digest('base64url')
}

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: scryptSync(`${password}\0${authSecret()}`, salt, 64).toString('hex'),
  }
}

export function verifyPassword(password, salt, expectedHash) {
  try {
    if (expectedHash === 'ENV') {
      if (!process.env.ADMIN_PASSWORD) return false
      const actualPassword = createHash('sha256').update(password).digest()
      const expectedPassword = createHash('sha256').update(process.env.ADMIN_PASSWORD).digest()
      return timingSafeEqual(actualPassword, expectedPassword)
    }

    const actual = Buffer.from(
      scryptSync(`${password}\0${authSecret()}`, salt, 64).toString('hex'),
    )
    const expected = Buffer.from(expectedHash)
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

export function createSessionToken(user) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64url(
    JSON.stringify({
      sub: user.username,
      role: user.role,
      name: user.display_name,
      iat: now,
      exp: now + sessionDurationSeconds,
    }),
  )
  const unsigned = `${header}.${payload}`
  return `${unsigned}.${signature(unsigned)}`
}

export function verifySessionToken(token) {
  try {
    const [header, payload, tokenSignature] = token.split('.')
    if (!header || !payload || !tokenSignature) return null
    const unsigned = `${header}.${payload}`
    const actual = Buffer.from(signature(unsigned))
    const expected = Buffer.from(tokenSignature)
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null
    return session
  } catch {
    return null
  }
}

function cookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie || '')
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separator = item.indexOf('=')
        return [
          decodeURIComponent(item.slice(0, separator)),
          decodeURIComponent(item.slice(separator + 1)),
        ]
      }),
  )
}

export function getSession(request) {
  return verifySessionToken(cookies(request)[cookieName])
}

export function setSessionCookie(response, token) {
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionDurationSeconds}; Secure`,
  )
}

export function clearSessionCookie(response) {
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`,
  )
}
