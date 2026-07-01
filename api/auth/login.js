import { createSessionToken, setSessionCookie, verifyPassword } from '../_lib/auth.js'
import { parseCsv } from '../_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from '../_lib/http.js'
import { githubConfigured, readRepoFile } from '../_lib/repo.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST'])

  try {
    const body = await readJsonBody(request, 20_000)
    const username = String(body.username || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!username || !password) {
      return sendJson(response, 400, { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
    }

    const { content } = await readRepoFile('data/users.csv')
    const user = parseCsv(content).find((item) => item.username.toLowerCase() === username)
    if (!user || !verifyPassword(password, user.salt, user.password_hash)) {
      return sendJson(response, 401, { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    }
    if (user.active === 'pending') {
      return sendJson(response, 403, { error: 'บัญชีนี้กำลังรอผู้ดูแลระบบอนุมัติ' })
    }
    if (user.active !== 'true') {
      return sendJson(response, 403, { error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' })
    }

    setSessionCookie(response, createSessionToken(user))
    return sendJson(response, 200, {
      user: {
        username: user.username,
        displayName: user.display_name,
        role: user.role,
      },
      githubConfigured: githubConfigured(),
    })
  } catch (error) {
    console.error('Login error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถเข้าสู่ระบบได้ในขณะนี้' })
  }
}
