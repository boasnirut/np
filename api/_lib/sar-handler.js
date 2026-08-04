import { randomUUID } from 'node:crypto'
import { canModifyRecord, requireActiveUser, withUserDisplayNames } from './access.js'
import { cleanExternalUrl, nextDisplayOrder, sortByDisplayOrder } from './content.js'
import { parseCsv, stringifyCsv } from './csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './http.js'
import {
  readRepoFile,
  RepositoryConfigError,
  writeRepoFile,
} from './repo.js'

const headers = [
  'id',
  'title',
  'academic_year',
  'description',
  'document_url',
  'display_order',
  'status',
  'author',
  'created_at',
  'updated_at',
  'updated_by',
]

function isPdfLink(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    const host = url.hostname.toLowerCase()
    return host === 'drive.google.com'
      || host === 'drive.usercontent.google.com'
      || /\.pdf$/i.test(url.pathname)
  } catch {
    return false
  }
}

function fields(body, existing = {}, isAdmin = false) {
  const submittedUrls = Array.isArray(body.document_urls)
    ? body.document_urls
    : [body.document_url ?? existing.document_url ?? '']
  const documentUrl = cleanExternalUrl(submittedUrls.find((url) => String(url || '').trim()) || '')

  return {
    title: String(body.title ?? existing.title ?? '').trim(),
    academic_year: String(body.academic_year ?? existing.academic_year ?? '').trim(),
    description: String(body.description ?? existing.description ?? '').trim(),
    document_url: documentUrl,
    display_order: isAdmin
      ? String(body.display_order ?? existing.display_order ?? '').trim()
      : String(existing.display_order ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

function validate(item, response) {
  if (item.title.length < 3 || item.title.length > 180) {
    sendJson(response, 400, { error: 'ชื่อรายงาน SAR ต้องมีความยาว 3–180 ตัวอักษร' })
    return false
  }
  if (!item.academic_year || item.academic_year.length > 30) {
    sendJson(response, 400, { error: 'กรุณาระบุปีการศึกษา' })
    return false
  }
  if (item.description.length > 1500) {
    sendJson(response, 400, { error: 'รายละเอียดต้องไม่เกิน 1,500 ตัวอักษร' })
    return false
  }
  if (!item.document_url || !isPdfLink(item.document_url)) {
    sendJson(response, 400, {
      error: 'กรุณาแนบไฟล์ PDF หรือใช้ลิงก์ PDF จาก Google Drive/เว็บไซต์ที่ปลอดภัย',
    })
    return false
  }
  if (item.display_order && !Number.isFinite(Number(item.display_order))) {
    sendJson(response, 400, { error: 'ลำดับการแสดงผลต้องเป็นตัวเลข' })
    return false
  }
  return true
}

export default async function sarHandler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'sar' })
    if (!session) return undefined

    const current = await readRepoFile('data/sar.csv')
    const documents = parseCsv(current.content)

    if (request.method === 'GET') {
      const namedDocuments = await withUserDisplayNames(
        sortByDisplayOrder(documents),
        session.userNames,
      )
      return sendJson(response, 200, { sarDocuments: namedDocuments })
    }

    const body = await readJsonBody(request, 50_000)
    if (request.method === 'POST') {
      const itemFields = fields(body, {}, session.role === 'admin')
      if (!validate(itemFields, response)) return undefined
      const now = new Date().toISOString()
      const item = {
        id: randomUUID(),
        ...itemFields,
        display_order: itemFields.display_order || String(nextDisplayOrder(documents)),
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }
      documents.push(item)
      await writeRepoFile(
        'data/sar.csv',
        stringifyCsv(documents, headers),
        `เพิ่มรายงาน SAR: ${item.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([item], session.userNames)
      return sendJson(response, 201, { sarDocument: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      const index = documents.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบรายงาน SAR ที่ต้องการ' })
      if (!canModifyRecord(session, documents[index])) {
        return sendJson(response, 403, { error: 'สมาชิกแก้ไขหรือลบได้เฉพาะรายงาน SAR ที่ตนเองสร้าง' })
      }

      if (request.method === 'DELETE') {
        const [removed] = documents.splice(index, 1)
        await writeRepoFile(
          'data/sar.csv',
          stringifyCsv(documents, headers),
          `ลบรายงาน SAR: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }

      const itemFields = fields(body, documents[index], session.role === 'admin')
      if (!validate(itemFields, response)) return undefined
      documents[index] = {
        ...documents[index],
        ...itemFields,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }
      await writeRepoFile(
        'data/sar.csv',
        stringifyCsv(documents, headers),
        `แก้ไขรายงาน SAR: ${itemFields.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([documents[index]], session.userNames)
      return sendJson(response, 200, { sarDocument: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    console.error('SAR API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับรายงาน SAR ได้ในขณะนี้' })
  }
}
