import { requireActiveUser } from './_lib/access.js'
import { hashPassword } from './_lib/auth.js'
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
  'permissions',
]
const allowedStatuses = new Set(['true', 'pending', 'suspended'])
const allowedRoles = new Set(['member', 'admin'])
const allowedPermissions = new Set(['news', 'events', 'awards', 'newsletters', 'quality'])

function memberPermissions(user) {
  if (user.role === 'admin') return [...allowedPermissions]
  return String(user.permissions || '').split(';').filter((permission) => allowedPermissions.has(permission))
}

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
          permissions: memberPermissions(user),
        })),
      })
    }

    if (request.method === 'PATCH') {
      const body = await readJsonBody(request, 30_000)
      const member = users.find((user) =>
        body.id ? user.id === String(body.id) : user.username === String(body.username || '').trim().toLowerCase(),
      )
      if (!member) return sendJson(response, 404, { error: 'ไม่พบสมาชิก' })

      const username = String(body.username ?? member.username).trim().toLowerCase()
      const displayName = String(body.displayName ?? member.display_name).trim()
      const role = String(body.role ?? member.role)
      const status = String(body.status ?? member.active)
      const password = String(body.password || '')
      const requestedPermissions = body.permissions === undefined
        ? memberPermissions(member)
        : body.permissions

      if (!/^[a-z0-9_]{4,32}$/.test(username)) {
        return sendJson(response, 400, {
          error: 'ชื่อผู้ใช้ต้องมี 4–32 ตัว และใช้ตัวอักษรอังกฤษ ตัวเลข หรือ _ เท่านั้น',
        })
      }
      if (displayName.length < 2 || displayName.length > 80) {
        return sendJson(response, 400, { error: 'กรุณากรอกชื่อที่ใช้แสดงให้ถูกต้อง' })
      }
      if (!allowedRoles.has(role)) {
        return sendJson(response, 400, { error: 'ประเภทผู้ใช้งานไม่ถูกต้อง' })
      }
      if (!allowedStatuses.has(status)) {
        return sendJson(response, 400, { error: 'สถานะสมาชิกไม่ถูกต้อง' })
      }
      if (password && password.length < 8) {
        return sendJson(response, 400, { error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' })
      }
      if (!Array.isArray(requestedPermissions) || requestedPermissions.some((permission) => !allowedPermissions.has(permission))) {
        return sendJson(response, 400, { error: 'สิทธิ์การจัดการข้อมูลไม่ถูกต้อง' })
      }

      if (users.some((user) => user.id !== member.id && user.username.toLowerCase() === username)) {
        return sendJson(response, 409, { error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' })
      }

      const isCurrentAdmin = member.username === admin.sub
      if (isCurrentAdmin && username !== member.username) {
        return sendJson(response, 400, { error: 'ไม่สามารถเปลี่ยนชื่อผู้ใช้ของบัญชีที่กำลังใช้งานได้' })
      }
      if (isCurrentAdmin && (role !== 'admin' || status !== 'true')) {
        return sendJson(response, 400, {
          error: 'ไม่สามารถลดสิทธิ์หรือระงับบัญชีผู้ดูแลที่กำลังใช้งานได้',
        })
      }

      const activeAdmins = users.filter(
        (user) => user.role === 'admin' && user.active === 'true',
      )
      if (
        member.role === 'admin'
        && member.active === 'true'
        && (role !== 'admin' || status !== 'true')
        && activeAdmins.length <= 1
      ) {
        return sendJson(response, 400, {
          error: 'ต้องมีผู้ดูแลระบบที่ใช้งานได้อย่างน้อย 1 บัญชี',
        })
      }

      const previousUsername = member.username
      member.username = username
      member.display_name = displayName
      member.role = role
      member.active = status
      member.permissions = role === 'admin'
        ? '*'
        : [...new Set(requestedPermissions)].join(';')
      if (password) {
        const passwordData = hashPassword(password)
        member.password_hash = passwordData.hash
        member.salt = passwordData.salt
      }

      await writeRepoFile(
        'data/users.csv',
        stringifyCsv(users, headers),
        `แก้ไขข้อมูลสมาชิก: ${previousUsername}`,
        current.sha,
      )
      return sendJson(response, 200, {
        member: {
          id: member.id,
          username: member.username,
          displayName: member.display_name,
          role: member.role,
          status: member.active,
          createdAt: member.created_at,
          permissions: memberPermissions(member),
        },
        passwordChanged: Boolean(password),
      })
    }

    return methodNotAllowed(response, ['GET', 'PATCH'])
  } catch (error) {
    console.error('Members API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถจัดการสมาชิกได้ในขณะนี้' })
  }
}
