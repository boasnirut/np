import { randomUUID } from 'node:crypto'
import { canModifyRecord, requireActiveUser, withUserDisplayNames } from './access.js'
import { parseCsv, stringifyCsv } from './csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './http.js'
import {
  readRepoFile,
  RepositoryConfigError,
  writeRepoFile,
} from './repo.js'

const filePath = 'data/staff.csv'
const headers = [
  'id',
  'staff_type',
  'name',
  'position',
  'image_url',
  'website_url',
  'display_order',
  'status',
  'author',
  'created_at',
  'updated_at',
  'updated_by',
]
const staffTypes = new Set(['director', 'teacher', 'support'])
const statuses = new Set(['published', 'draft'])
const typeOrder = { director: 0, teacher: 1, support: 2 }

function cleanUrl(value, { allowLocal = false } = {}) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (
    allowLocal
    && /^\/[A-Za-z0-9._~!$&'()+,;=:@%/-]+$/.test(text)
    && !text.includes('..')
  ) return text
  try {
    const url = new URL(text)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function staffFields(body, existing = {}) {
  return {
    staff_type: String(body.staff_type ?? existing.staff_type ?? '').trim(),
    name: String(body.name ?? existing.name ?? '').trim(),
    position: String(body.position ?? existing.position ?? '').trim(),
    image_url: cleanUrl(body.image_url ?? existing.image_url ?? '', { allowLocal: true }),
    website_url: cleanUrl(body.website_url ?? existing.website_url ?? ''),
    display_order: String(body.display_order ?? existing.display_order ?? '').trim(),
    status: String(body.status ?? existing.status ?? 'published').trim(),
  }
}

function validate(item, response) {
  if (!staffTypes.has(item.staff_type)) {
    sendJson(response, 400, { error: 'ประเภทบุคลากรไม่ถูกต้อง' })
    return false
  }
  if (item.name.length < 2 || item.name.length > 120) {
    sendJson(response, 400, { error: 'ชื่อบุคลากรต้องมีความยาว 2–120 ตัวอักษร' })
    return false
  }
  if (item.position.length < 2 || item.position.length > 160) {
    sendJson(response, 400, { error: 'ตำแหน่งต้องมีความยาว 2–160 ตัวอักษร' })
    return false
  }
  if (!item.image_url || item.image_url === null) {
    sendJson(response, 400, { error: 'กรุณาเลือกรูปภาพบุคลากร JPG, PNG หรือ WebP' })
    return false
  }
  if (item.website_url === null) {
    sendJson(response, 400, { error: 'เว็บไซต์บุคลากรต้องเป็นลิงก์ https ที่ถูกต้อง' })
    return false
  }
  const order = Number(item.display_order)
  if (!Number.isInteger(order) || order < 1 || order > 999) {
    sendJson(response, 400, { error: 'ลำดับการแสดงต้องเป็นเลขจำนวนเต็มตั้งแต่ 1–999' })
    return false
  }
  if (!statuses.has(item.status)) {
    sendJson(response, 400, { error: 'สถานะบุคลากรไม่ถูกต้อง' })
    return false
  }
  return true
}

function sortStaff(items) {
  return [...items].sort((left, right) => {
    const typeDifference = (typeOrder[left.staff_type] ?? 99) - (typeOrder[right.staff_type] ?? 99)
    if (typeDifference) return typeDifference
    const orderDifference = Number(left.display_order || 0) - Number(right.display_order || 0)
    if (orderDifference) return orderDifference
    return String(left.created_at || '').localeCompare(String(right.created_at || ''))
  })
}

function nextOrder(items, staffType) {
  return items
    .filter((item) => item.staff_type === staffType)
    .reduce((maximum, item) => Math.max(maximum, Number(item.display_order) || 0), 0) + 1
}

export default async function staffHandler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'staff' })
    if (!session) return undefined

    const current = await readRepoFile(filePath)
    const staff = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        staff: await withUserDisplayNames(sortStaff(staff), session.userNames),
      })
    }

    const body = await readJsonBody(request, 50_000)

    if (request.method === 'POST') {
      const fields = staffFields(body)
      if (!fields.display_order && staffTypes.has(fields.staff_type)) {
        fields.display_order = String(nextOrder(staff, fields.staff_type))
      }
      if (!validate(fields, response)) return undefined

      const now = new Date().toISOString()
      const item = {
        id: randomUUID(),
        ...fields,
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }
      staff.push(item)
      await writeRepoFile(
        filePath,
        stringifyCsv(staff, headers),
        `เพิ่มข้อมูลบุคลากร: ${item.name}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([item], session.userNames)
      return sendJson(response, 201, { staffMember: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      const index = staff.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบบุคลากรที่ต้องการจัดการ' })
      if (!canModifyRecord(session, staff[index])) {
        return sendJson(response, 403, { error: 'สมาชิกแก้ไขหรือลบได้เฉพาะข้อมูลบุคลากรที่ตนเองสร้าง' })
      }

      if (request.method === 'DELETE') {
        const [removed] = staff.splice(index, 1)
        await writeRepoFile(
          filePath,
          stringifyCsv(staff, headers),
          `ลบข้อมูลบุคลากร: ${removed.name}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }

      const fields = staffFields(body, staff[index])
      if (session.role !== 'admin') fields.display_order = staff[index].display_order
      if (!validate(fields, response)) return undefined
      staff[index] = {
        ...staff[index],
        ...fields,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }
      await writeRepoFile(
        filePath,
        stringifyCsv(staff, headers),
        `แก้ไขข้อมูลบุคลากร: ${fields.name}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([staff[index]], session.userNames)
      return sendJson(response, 200, { staffMember: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    console.error('Staff API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถจัดการข้อมูลบุคลากรได้ในขณะนี้' })
  }
}
