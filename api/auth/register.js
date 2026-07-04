import { randomUUID } from 'node:crypto'
import { hashPassword } from '../_lib/auth.js'
import { parseCsv, stringifyCsv } from '../_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from '../_lib/http.js'
import { readRepoFile, RepositoryConfigError, writeRepoFile } from '../_lib/repo.js'

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

export default async function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST'])

  try {
    const body = await readJsonBody(request, 30_000)
    const username = String(body.username || '').trim().toLowerCase()
    const password = String(body.password || '')
    const displayName = String(body.displayName || '').trim()

    if (!/^[a-z0-9_]{4,32}$/.test(username)) {
      return sendJson(response, 400, {
        error: 'ชื่อผู้ใช้ต้องมี 4–32 ตัว และใช้ตัวอักษรอังกฤษ ตัวเลข หรือ _ เท่านั้น',
      })
    }
    if (password.length < 8) {
      return sendJson(response, 400, { error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    }
    if (displayName.length < 2 || displayName.length > 80) {
      return sendJson(response, 400, { error: 'กรุณากรอกชื่อที่ใช้แสดงให้ถูกต้อง' })
    }
    const current = await readRepoFile('data/users.csv')
    const users = parseCsv(current.content)
    if (users.some((user) => user.username.toLowerCase() === username)) {
      return sendJson(response, 409, { error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' })
    }

    const passwordData = hashPassword(password)
    const user = {
      id: randomUUID(),
      username,
      password_hash: passwordData.hash,
      salt: passwordData.salt,
      role: 'member',
      display_name: displayName,
      created_at: new Date().toISOString(),
      active: 'pending',
      permissions: '',
    }
    users.push(user)
    await writeRepoFile(
      'data/users.csv',
      stringifyCsv(users, headers),
      `สมัครสมาชิกเว็บไซต์: ${username}`,
      current.sha,
    )

    return sendJson(response, 201, {
      pending: true,
      message: 'สมัครสมาชิกเรียบร้อยแล้ว กรุณารอผู้ดูแลระบบอนุมัติ',
      user: { username, displayName, role: 'member', status: 'pending' },
    })
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, {
        error: 'ระบบสมัครสมาชิกยังไม่ได้เชื่อมต่อ GitHub กรุณาติดต่อผู้ดูแลระบบ',
        code: error.code,
      })
    }
    console.error('Register error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถสมัครสมาชิกได้ในขณะนี้' })
  }
}
