import { randomUUID } from 'node:crypto'
import { requireActiveUser, withUserDisplayNames } from './_lib/access.js'
import {
  cleanExternalUrl,
  nextDisplayOrderForDate,
  sortByDateAndDisplayOrder,
} from './_lib/content.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import {
  dataUrlBytes,
  GoogleDriveConfigError,
  GoogleDriveUploadError,
  uploadToDrive,
} from './_lib/drive.js'
import {
  readRepoFile,
  RepositoryConfigError,
  writeRepoFile,
} from './_lib/repo.js'

const headers = [
  'id',
  'title',
  'category',
  'summary',
  'content',
  'image_url',
  'document_url',
  'photo_url',
  'display_order',
  'status',
  'author',
  'created_at',
  'updated_at',
  'updated_by',
  'publish_date',
]
const allowedImageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const allowedDocumentTypes = new Set(['application/pdf'])

function newsFields(body, existing = {}, isAdmin = false) {
  return {
    title: String(body.title ?? existing.title ?? '').trim(),
    category: String(body.category ?? existing.category ?? 'ประชาสัมพันธ์').trim(),
    publish_date: String(body.publish_date ?? existing.publish_date ?? '').trim(),
    summary: String(body.summary ?? existing.summary ?? '').trim(),
    content: String(body.content ?? existing.content ?? '').trim(),
    document_url: cleanExternalUrl(body.document_url ?? existing.document_url ?? ''),
    photo_url: cleanExternalUrl(body.photo_url ?? existing.photo_url ?? ''),
    display_order: isAdmin
      ? String(body.display_order ?? existing.display_order ?? '').trim()
      : String(existing.display_order ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

function validate(fields, response) {
  if (fields.title.length < 3 || fields.title.length > 180) {
    sendJson(response, 400, { error: 'หัวข้อต้องมีความยาว 3–180 ตัวอักษร' })
    return false
  }
  if (!fields.content || fields.content.length > 20_000) {
    sendJson(response, 400, { error: 'กรุณากรอกรายละเอียดข่าวไม่เกิน 20,000 ตัวอักษร' })
    return false
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.publish_date)) {
    sendJson(response, 400, { error: 'กรุณาระบุวันที่เผยแพร่ข่าวสาร' })
    return false
  }
  if (fields.document_url === null || fields.photo_url === null) {
    sendJson(response, 400, { error: 'ลิงก์เอกสารและ Google Photos ต้องเป็นลิงก์ https ที่ถูกต้อง' })
    return false
  }
  if (fields.display_order && !Number.isFinite(Number(fields.display_order))) {
    sendJson(response, 400, { error: 'ลำดับการแสดงผลต้องเป็นตัวเลข' })
    return false
  }
  return true
}

async function uploadImage(image, id, title) {
  if (!image?.data || !image?.type) return ''
  const extension = allowedImageTypes[image.type]
  if (!extension) {
    const error = new Error('รองรับรูปภาพ JPG, PNG และ WebP เท่านั้น')
    error.code = 'INVALID_IMAGE'
    throw error
  }
  const bytes = dataUrlBytes(image.data)
  if (!bytes.length || bytes.length > 3_000_000) {
    const error = new Error('รูปภาพต้องมีขนาดไม่เกิน 3 MB')
    error.code = 'INVALID_IMAGE'
    throw error
  }
  const uploaded = await uploadToDrive({
    bytes,
    mimeType: image.type,
    name: `${id}-${Date.now()}-${title}.${extension}`,
    category: 'news-image',
    image: true,
  })
  return uploaded.imageUrl
}

async function uploadDocument(file, id, title) {
  if (!file?.data || !file?.type) return ''
  if (!allowedDocumentTypes.has(file.type)) {
    const error = new Error('รองรับไฟล์ PDF เท่านั้น')
    error.code = 'INVALID_DOCUMENT'
    throw error
  }
  const bytes = dataUrlBytes(file.data)
  if (!bytes.length || bytes.length > 3_000_000) {
    const error = new Error('ไฟล์ PDF ต้องมีขนาดไม่เกิน 3 MB')
    error.code = 'INVALID_DOCUMENT'
    throw error
  }
  const uploaded = await uploadToDrive({
    bytes,
    mimeType: file.type,
    name: file.name || `${id}-${Date.now()}-${title}.pdf`,
    category: 'news-document',
  })
  return uploaded.viewUrl
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'news' })
    if (!session) return undefined

    const current = await readRepoFile('data/news.csv')
    const news = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        news: await withUserDisplayNames(
          sortByDateAndDisplayOrder(news, 'publish_date'),
          session.userNames,
        ),
      })
    }

    const body = await readJsonBody(request, 5_000_000)
    if (request.method === 'POST') {
      const fields = newsFields(body, {}, session.role === 'admin')
      if (!validate(fields, response)) return undefined
      const id = randomUUID()
      const now = new Date().toISOString()
      const documentUrl = await uploadDocument(body.document_file, id, fields.title)
      const item = {
        id,
        ...fields,
        document_url: documentUrl || fields.document_url,
        display_order: fields.display_order || String(
          nextDisplayOrderForDate(news, 'publish_date', fields.publish_date),
        ),
        image_url: await uploadImage(body.image, id, fields.title),
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }
      news.push(item)
      await writeRepoFile(
        'data/news.csv',
        stringifyCsv(news, headers),
        `เพิ่มข่าวสาร: ${fields.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([item], session.userNames)
      return sendJson(response, 201, { news: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหรือลบรายการได้' })
      }
      const index = news.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบข่าวที่ต้องการ' })

      if (request.method === 'DELETE') {
        const [removed] = news.splice(index, 1)
        await writeRepoFile(
          'data/news.csv',
          stringifyCsv(news, headers),
          `ลบข่าวสาร: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }

      const fields = newsFields(body, news[index], session.role === 'admin')
      if (!validate(fields, response)) return undefined
      const newImage = await uploadImage(body.image, news[index].id, fields.title)
      const newDocumentUrl = await uploadDocument(body.document_file, news[index].id, fields.title)
      news[index] = {
        ...news[index],
        ...fields,
        image_url: newImage || news[index].image_url,
        document_url: newDocumentUrl || fields.document_url,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }
      await writeRepoFile(
        'data/news.csv',
        stringifyCsv(news, headers),
        `แก้ไขข่าวสาร: ${fields.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([news[index]], session.userNames)
      return sendJson(response, 200, { news: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    if (error.code === 'INVALID_IMAGE' || error.code === 'INVALID_DOCUMENT') {
      return sendJson(response, 400, { error: error.message })
    }
    if (error instanceof GoogleDriveConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้ตั้งค่า Google Drive Service Account ใน Vercel' })
    }
    if (error instanceof GoogleDriveUploadError) {
      console.error('Google Drive upload error', error.details || error)
      return sendJson(response, 502, { error: error.message })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ข้อมูลหรือรูปภาพมีขนาดใหญ่เกินไป' })
    }
    console.error('News API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับข่าวสารได้ในขณะนี้' })
  }
}
