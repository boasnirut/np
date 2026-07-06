import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'

const prefix = 'enc:v1'

export class SecretBoxConfigError extends Error {}

function encryptionKey() {
  const secret = String(process.env.COMPLAINTS_ENCRYPTION_KEY || '').trim()
  if (!secret) {
    throw new SecretBoxConfigError('COMPLAINTS_ENCRYPTION_KEY is not configured')
  }
  return createHash('sha256').update(secret, 'utf8').digest()
}

export function encryptSecret(value) {
  const text = String(value || '')
  if (!text) return ''

  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    prefix,
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':')
}

export function decryptSecret(value) {
  const text = String(value || '')
  if (!text) return ''
  if (!text.startsWith(`${prefix}:`)) return text

  const [, , ivText, tagText, encryptedText] = text.split(':')
  if (!ivText || !tagText || !encryptedText) throw new Error('INVALID_ENCRYPTED_VALUE')

  const decipher = createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(ivText, 'base64url'),
  )
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}
