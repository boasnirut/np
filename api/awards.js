import { randomUUID } from 'node:crypto'
import { requireActiveUser, withUserDisplayNames } from './_lib/access.js'
import {
  cleanAttachmentUrls,
  cleanExternalUrl,
  contentAttachmentUrls,
  nextDisplayOrderForDate,
  sortByDateAndDisplayOrder,
  withAttachmentColumns,
} from './_lib/content.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import {
  dataUrlBytes,
  GoogleDriveConfigError,
  GoogleDriveUploadError,
  uploadToDrive,
} from './_lib/drive.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import { readRepoFile, writeRepoFile } from './_lib/repo.js'

const headers = [
  'id',
  'title',
  'award_type',
  'award_date',
  'level',
  'recipient',
  'description',
  'image_url',
  'document_url',
  'photo_url',
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
const allowedImageTypes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const allowedDocumentTypes = new Set(['application/pdf'])
const allowedAwardTypes = new Set(['school', 'personnel', 'student', 'teacher_work'])

function fields(body, existing = {}, isAdmin = false) {
  const sourceUrls = Array.isArray(body.document_urls)
    ? body.document_urls
    : contentAttachmentUrls(existing)
  return {
    title: String(body.title ?? existing.title ?? '').trim(),
    award_type: String(body.award_type ?? existing.award_type ?? 'school').trim(),
    award_date: String(body.award_date ?? existing.award_date ?? '').trim(),
    level: String(body.level ?? existing.level ?? '').trim(),
    recipient: String(body.recipient ?? existing.recipient ?? '').trim(),
    description: String(body.description ?? existing.description ?? '').trim(),
    image_url: cleanExternalUrl(body.image_url ?? existing.image_url ?? ''),
    document_urls: cleanAttachmentUrls(sourceUrls),
    display_order: isAdmin
      ? String(body.display_order ?? existing.display_order ?? '').trim()
      : String(existing.display_order ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

function validate(item, response, extraFiles = 0) {
  if (item.title.length < 3 || !item.award_date) {
    sendJson(response, 400, { error: 'กรุณากรอกชื่อผลงานและวันที่ให้ครบถ้วน' })
    return false
  }
  if (!allowedAwardTypes.has(item.award_type)) {
    sendJson(response, 400, { error: 'ประเภทผลงานและรางวัลไม่ถูกต้อง' })
    return false
  }
  if (item.image_url === null || item.document_urls.some((url) => url === null)) {
    sendJson(response, 400, { error: 'ลิงก์รูปภาพและไฟล์แนบต้องเป็นลิงก์ https ที่ถูกต้อง' })
    return false
  }
  if (item.document_urls.length + extraFiles > 5) {
    sendJson(response, 400, { error: 'แนบไฟล์หรือลิงก์ได้รวมไม่เกิน 5 รายการ' })
    return false
  }
  if (item.display_order && !Number.isFinite(Number(item.display_order))) {
    sendJson(response, 400, { error: 'ลำดับการแสดงผลต้องเป็นตัวเลข' })
    return false
  }
  return true
}

async function uploadImage(image, id, title) {
  if (!image?.data || !image?.type) return ''
  const extension = allowedImageTypes[image.type]
  if (!extension) throw new Error('INVALID_IMAGE')
  const bytes = dataUrlBytes(image.data)
  if (!bytes.length || bytes.length > 3_000_000) throw new Error('INVALID_IMAGE')
  const uploaded = await uploadToDrive({
    bytes,
    mimeType: image.type,
    name: `${id}-${Date.now()}-${title}.${extension}`,
    category: 'award-image',
    image: true,
  })
  return uploaded.imageUrl
}

async function uploadDocument(file, id, title) {
  if (!file?.data || !file?.type) return ''
  if (!allowedDocumentTypes.has(file.type)) throw new Error('INVALID_DOCUMENT')
  const bytes = dataUrlBytes(file.data)
  if (!bytes.length || bytes.length > 3_000_000) throw new Error('INVALID_DOCUMENT')
  const uploaded = await uploadToDrive({
    bytes,
    mimeType: file.type,
    name: file.name || `${id}-${Date.now()}-${title}.pdf`,
    category: 'award-document',
  })
  return uploaded.viewUrl
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'awards' })
    if (!session) return undefined
    const current = await readRepoFile('data/awards.csv')
    const awards = parseCsv(current.content)

    if (request.method === 'GET') {
      const namedAwards = await withUserDisplayNames(
        sortByDateAndDisplayOrder(awards, 'award_date'),
        session.userNames,
      )
      return sendJson(response, 200, {
        awards: namedAwards.map((item) => ({ ...item, document_urls: contentAttachmentUrls(item) })),
      })
    }

    const body = await readJsonBody(request, 5_000_000)
    if (request.method === 'POST') {
      const itemFields = fields(body, {}, session.role === 'admin')
      if (!validate(itemFields, response, body.document_file?.data ? 1 : 0)) return undefined
      const id = randomUUID()
      const now = new Date().toISOString()
      const documentUrl = await uploadDocument(body.document_file, id, itemFields.title)
      const { document_urls: documentUrls, ...savedFields } = itemFields
      const item = withAttachmentColumns({
        id,
        ...savedFields,
        display_order: itemFields.display_order || String(
          nextDisplayOrderForDate(awards, 'award_date', itemFields.award_date),
        ),
        image_url: await uploadImage(body.image, id, itemFields.title) || itemFields.image_url,
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }, [documentUrl, ...documentUrls].filter(Boolean))
      awards.push(item)
      await writeRepoFile(
        'data/awards.csv',
        stringifyCsv(awards, headers),
        `เพิ่มผลงานและรางวัล: ${item.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([item], session.userNames)
      return sendJson(response, 201, { award: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหรือลบรายการได้' })
      }
      const index = awards.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบผลงานที่ต้องการ' })
      if (request.method === 'DELETE') {
        const [removed] = awards.splice(index, 1)
        await writeRepoFile(
          'data/awards.csv',
          stringifyCsv(awards, headers),
          `ลบผลงานและรางวัล: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }
      const itemFields = fields(body, awards[index], session.role === 'admin')
      if (!validate(itemFields, response, body.document_file?.data ? 1 : 0)) return undefined
      const newImage = await uploadImage(body.image, awards[index].id, itemFields.title)
      const newDocumentUrl = await uploadDocument(body.document_file, awards[index].id, itemFields.title)
      const { document_urls: documentUrls, ...savedFields } = itemFields
      awards[index] = withAttachmentColumns({
        ...awards[index],
        ...savedFields,
        image_url: newImage || itemFields.image_url || awards[index].image_url,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }, [newDocumentUrl, ...documentUrls].filter(Boolean))
      await writeRepoFile(
        'data/awards.csv',
        stringifyCsv(awards, headers),
        `แก้ไขผลงานและรางวัล: ${itemFields.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([awards[index]], session.userNames)
      return sendJson(response, 200, { award: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error.message === 'INVALID_IMAGE') {
      return sendJson(response, 400, { error: 'รูปภาพต้องเป็น JPG, PNG หรือ WebP และไม่เกิน 3 MB' })
    }
    if (error.message === 'INVALID_DOCUMENT') {
      return sendJson(response, 400, { error: 'ไฟล์เอกสารต้องเป็น PDF และไม่เกิน 3 MB' })
    }
    if (error instanceof GoogleDriveConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้ตั้งค่า Google Drive OAuth 2.0 ใน Vercel' })
    }
    if (error instanceof GoogleDriveUploadError) {
      console.error('Google Drive upload error', error.details || error)
      return sendJson(response, 502, { error: error.message })
    }
    console.error('Awards API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับผลงานและรางวัลได้ในขณะนี้' })
  }
}
