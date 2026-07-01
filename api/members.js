import { requireActiveUser } from './_lib/access.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import { readRepoFile, writeRepoFile } from './_lib/repo.js'

const headers = [
  'id',
  'username',
  'password_hash',
  'salt',
  'role',
  'display_name',
  'created_at',
  'active',
]
const allowedStatuses = new Set(['true', 'pending', 'suspended'])

export default async function handler(request, response) {
  const admin = await requireActiveUser(request, response, { adminOnly: true })
  if (!admin) return undefined

  try {
    const current = await readRepoFile('data/users.csv')
    const users = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        members: users.map((user) => ({
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.display_name,
          createdAt: user.created_at,
          status: user.active,
        })),
      })
    }

    if (request.method === 'PATCH') {
      const body = await readJsonBody(request, 20_000)
      const username = String(body.username || '').trim().toLowerCase()
      const status = String(body.status || '')
      if (!allowedStatuses.has(status)) {
        return sendJson(response, 400, { error: 'สถานะสมาชิกไม่ถูกต้อง' })
      }
      const member = users.find((user) => user.username === username)
      if (!member) return sendJson(response, 404, { error: 'ไม่พบสมาชิก' })
      if (member.role === 'admin' && member.username === admin.sub && status !== 'true') {
        return sendJson(response, 400, { error: 'ไม่สามารถระงับบัญชีผู้ดูแลที่กำลังใช้งานได้' })
      }
      member.active = status
      await writeRepoFile(
        'data/users.csv',
        stringifyCsv(users, headers),
        `ปรับสถานะสมาชิก ${username}: ${status}`,
        current.sha,
      )
      return sendJson(response, 200, {
        member: {
          username: member.username,
          displayName: member.display_name,
          role: member.role,
          status: member.active,
        },
      })
    }

    return methodNotAllowed(response, ['GET', 'PATCH'])
  } catch (error) {
    console.error('Members API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถจัดการสมาชิกได้ในขณะนี้' })
  }
}
