import { randomUUID } from 'node:crypto'
import { requireActiveUser, withUserDisplayNames } from './access.js'
import {
  cleanAttachmentUrls,
  contentAttachmentUrls,
  nextDisplayOrderForDate,
  sortByDateAndDisplayOrder,
  withAttachmentColumns,
} from './content.js'
import { parseCsv, stringifyCsv } from './csv.js'
import {
  dataUrlBytes,
  GoogleDriveConfigError,
  GoogleDriveUploadError,
  uploadToDrive,
} from './drive.js'
import { methodNotAllowed, readJsonBody, sendJson } from './http.js'
import {
  readRepoFile,
  RepositoryConfigError,
  writeRepoFile,
} from './repo.js'

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
  'document_url_2',
  'document_url_3',
  'document_url_4',
  'document_url_5',
]
const categories = new Set(['แบบคำร้อง', 'เอกสารวิชาการ', 'คู่มือ', 'เอกสารทั่วไป'])

function fields(body, existing = {}, isAdmin = false) {
  const sourceUrls = Array.isArray(body.document_urls)
    ? body.document_urls
    : contentAttachmentUrls(existing)
  return {
    title: String(body.title ?? existing.title ?? '').trim(),
    category: String(body.category ?? existing.category ?? 'เอกสารทั่วไป').trim(),
    description: String(body.description ?? existing.description ?? '').trim(),
    document_urls: cleanAttachmentUrls(sourceUrls),
    publish_date: String(body.publish_date ?? existing.publish_date ?? '').trim(),
    display_order: isAdmin
      ? String(body.display_order ?? existing.display_order ?? '').trim()
      : String(existing.display_order ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

function validate(item, response, uploadedFileCount = 0) {
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
  if (item.document_urls.some((url) => url === null)) {
    sendJson(response, 400, { error: 'ลิงก์ไฟล์แนบต้องเป็นลิงก์ https ที่ถูกต้อง' })
    return false
  }
  if (item.document_urls.length + uploadedFileCount > 5) {
    sendJson(response, 400, { error: 'แนบไฟล์หรือลิงก์ได้รวมไม่เกิน 5 รายการ' })
    return false
  }
  if (!item.document_urls.length && !uploadedFileCount) {
    sendJson(response, 400, { error: 'กรุณาแนบไฟล์หรือกรอกลิงก์เอกสารอย่างน้อย 1 รายการ' })
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

async function uploadDocument(file, id, title) {
  if (!file?.data || !file?.type) return ''
  if (file.type !== 'application/pdf') throw new Error('INVALID_PDF')
  const bytes = dataUrlBytes(file.data)
  if (!bytes.length || bytes.length > 3_000_000) throw new Error('INVALID_PDF')
  const uploaded = await uploadToDrive({
    bytes,
    mimeType: file.type,
    name: file.name || `${id}-${Date.now()}-${title}.pdf`,
    category: 'school-document',
  })
  return uploaded.viewUrl
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'documents' })
    if (!session) return undefined

    const current = await readRepoFile('data/school-documents.csv')
    const documents = parseCsv(current.content)

    if (request.method === 'GET') {
      const namedDocuments = await withUserDisplayNames(
        sortByDateAndDisplayOrder(documents, 'publish_date'),
        session.userNames,
      )
      return sendJson(response, 200, {
        documents: namedDocuments.map((item) => ({ ...item, document_urls: contentAttachmentUrls(item) })),
      })
    }

    const body = await readJsonBody(request, 4_500_000)
    if (request.method === 'POST') {
      const itemFields = fields(body, {}, session.role === 'admin')
      if (!validate(itemFields, response, body.document_file?.data ? 1 : 0)) return undefined
      const now = new Date().toISOString()
      const id = randomUUID()
      const uploadedUrl = await uploadDocument(body.document_file, id, itemFields.title)
      const { document_urls: documentUrls, ...savedFields } = itemFields
      const item = withAttachmentColumns({
        id,
        ...savedFields,
        display_order: itemFields.display_order || String(
          nextDisplayOrderForDate(documents, 'publish_date', itemFields.publish_date),
        ),
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }, [uploadedUrl, ...documentUrls].filter(Boolean))
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
      if (!validate(itemFields, response, body.document_file?.data ? 1 : 0)) return undefined
      const uploadedUrl = await uploadDocument(body.document_file, documents[index].id, itemFields.title)
      const { document_urls: documentUrls, ...savedFields } = itemFields
      documents[index] = withAttachmentColumns({
        ...documents[index],
        ...savedFields,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }, [uploadedUrl, ...documentUrls].filter(Boolean))
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
    if (error.message === 'INVALID_PDF') {
      return sendJson(response, 400, { error: 'รองรับไฟล์ PDF ขนาดไม่เกิน 3 MB' })
    }
    if (error instanceof GoogleDriveConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้ตั้งค่า Google Drive OAuth 2.0 ใน Vercel' })
    }
    if (error instanceof GoogleDriveUploadError) {
      console.error('Google Drive upload error', error.details || error)
      return sendJson(response, 502, { error: error.message })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ไฟล์เอกสารมีขนาดใหญ่เกินไป' })
    }
    console.error('School documents API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับเอกสารได้ในขณะนี้' })
  }
}
