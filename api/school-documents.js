import { randomUUID } from 'node:crypto'
import { requireActiveUser, withUserDisplayNames } from './_lib/access.js'
import {
  nextDisplayOrderForDate,
  sortByDateAndDisplayOrder,
} from './_lib/content.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import {
  readRepoFile,
  RepositoryConfigError,
  writeRepoFile,
} from './_lib/repo.js'

const headers = [
  'id',
  'title',
  'category',
  'description',
  'document_url',
  'publish_date',
  'display_order',
  'status',
  'author',
  'created_at',
  'updated_at',
  'updated_by',
]
const categories = new Set(['แบบคำร้อง', 'เอกสารวิชาการ', 'คู่มือ', 'เอกสารทั่วไป'])

function googleDriveUrl(value) {
  const text = String(value || '').trim()
  try {
    const url = new URL(text)
    if (url.protocol !== 'https:') return null
    if (!['drive.google.com', 'docs.google.com'].includes(url.hostname)) return null
    return url.toString()
  } catch {
    return null
  }
}

function fields(body, existing = {}, isAdmin = false) {
  return {
    title: String(body.title ?? existing.title ?? '').trim(),
    category: String(body.category ?? existing.category ?? 'เอกสารทั่วไป').trim(),
    description: String(body.description ?? existing.description ?? '').trim(),
    document_url: googleDriveUrl(body.document_url ?? existing.document_url ?? ''),
    publish_date: String(body.publish_date ?? existing.publish_date ?? '').trim(),
    display_order: isAdmin
      ? String(body.display_order ?? existing.display_order ?? '').trim()
      : String(existing.display_order ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

function validate(item, response) {
  if (item.title.length < 3 || item.title.length > 180) {
    sendJson(response, 400, { error: 'ชื่อเอกสารต้องมีความยาว 3–180 ตัวอักษร' })
    return false
  }
  if (!categories.has(item.category)) {
    sendJson(response, 400, { error: 'ประเภทเอกสารไม่ถูกต้อง' })
    return false
  }
  if (item.description.length > 1000) {
    sendJson(response, 400, { error: 'รายละเอียดเอกสารต้องไม่เกิน 1,000 ตัวอักษร' })
    return false
  }
  if (!item.document_url) {
    sendJson(response, 400, { error: 'กรุณาใช้ลิงก์เอกสารจาก Google Drive หรือ Google Docs เท่านั้น' })
    return false
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.publish_date)) {
    sendJson(response, 400, { error: 'กรุณาระบุวันที่เผยแพร่เอกสาร' })
    return false
  }
  if (item.display_order && !Number.isFinite(Number(item.display_order))) {
    sendJson(response, 400, { error: 'ลำดับการแสดงผลต้องเป็นตัวเลข' })
    return false
  }
  return true
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'documents' })
    if (!session) return undefined

    const current = await readRepoFile('data/school-documents.csv')
    const documents = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        documents: await withUserDisplayNames(
          sortByDateAndDisplayOrder(documents, 'publish_date'),
          session.userNames,
        ),
      })
    }

    const body = await readJsonBody(request, 100_000)
    if (request.method === 'POST') {
      const itemFields = fields(body, {}, session.role === 'admin')
      if (!validate(itemFields, response)) return undefined
      const now = new Date().toISOString()
      const item = {
        id: randomUUID(),
        ...itemFields,
        display_order: itemFields.display_order || String(
          nextDisplayOrderForDate(documents, 'publish_date', itemFields.publish_date),
        ),
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }
      documents.push(item)
      await writeRepoFile(
        'data/school-documents.csv',
        stringifyCsv(documents, headers),
        `เพิ่มลิงก์เอกสาร: ${item.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([item], session.userNames)
      return sendJson(response, 201, { document: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหรือลบเอกสารได้' })
      }
      const index = documents.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบเอกสารที่ต้องการ' })

      if (request.method === 'DELETE') {
        const [removed] = documents.splice(index, 1)
        await writeRepoFile(
          'data/school-documents.csv',
          stringifyCsv(documents, headers),
          `ลบลิงก์เอกสาร: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }

      const itemFields = fields(body, documents[index], true)
      if (!validate(itemFields, response)) return undefined
      documents[index] = {
        ...documents[index],
        ...itemFields,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }
      await writeRepoFile(
        'data/school-documents.csv',
        stringifyCsv(documents, headers),
        `แก้ไขลิงก์เอกสาร: ${itemFields.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([documents[index]], session.userNames)
      return sendJson(response, 200, { document: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    console.error('School documents API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับเอกสารได้ในขณะนี้' })
  }
}
