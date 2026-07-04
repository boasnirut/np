import { getSession } from './auth.js'
import { parseCsv } from './csv.js'
import { sendJson } from './http.js'
import { readRepoFile } from './repo.js'

export async function requireActiveUser(request, response, options = {}) {
  const session = getSession(request)
  if (!session) {
    sendJson(response, 401, { error: 'กรุณาเข้าสู่ระบบอีกครั้ง' })
    return null
  }

  const { content } = await readRepoFile('data/users.csv')
  const user = parseCsv(content).find((item) => item.username === session.sub)
  if (!user || user.active !== 'true') {
    sendJson(response, 403, { error: 'บัญชีนี้ยังไม่ได้รับอนุมัติหรือถูกระงับการใช้งาน' })
    return null
  }
  if (options.adminOnly && user.role !== 'admin') {
    sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่ดำเนินการนี้ได้' })
    return null
  }

  const permissions = user.role === 'admin'
    ? ['news', 'events', 'awards', 'newsletters', 'quality']
    : String(user.permissions || '').split(';').filter(Boolean)
  if (options.permission && user.role !== 'admin' && !permissions.includes(options.permission)) {
    sendJson(response, 403, { error: 'บัญชีนี้ไม่ได้รับสิทธิ์จัดการข้อมูลส่วนนี้' })
    return null
  }

  return {
    sub: user.username,
    role: user.role,
    name: user.display_name,
    permissions,
  }
}
