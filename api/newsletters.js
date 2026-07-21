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
import {
  readRepoFile,
  RepositoryConfigError,
  writeRepoFile,
} from './_lib/repo.js'

const headers = [
  'id',
  'issue_number',
  'image_url',
  'display_order',
  'status',
  'author',
  'created_at',
  'updated_at',
  'updated_by',
  'publish_date',
  'document_url',
  'document_url_2',
  'document_url_3',
  'document_url_4',
  'document_url_5',
]
const allowedImageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function fields(body, existing = {}, isAdmin = false) {
  const sourceUrls = Array.isArray(body.document_urls)
    ? body.document_urls
    : contentAttachmentUrls(existing)
  return {
    issue_number: String(body.issue_number ?? existing.issue_number ?? '').trim(),
    publish_date: String(body.publish_date ?? existing.publish_date ?? '').trim(),
    image_url: cleanExternalUrl(body.image_url ?? existing.image_url ?? ''),
    document_urls: cleanAttachmentUrls(sourceUrls),
    display_order: isAdmin
      ? String(body.display_order ?? existing.display_order ?? '').trim()
      : String(existing.display_order ?? '').trim(),
    status: 'published',
  }
}

function validate(item, response) {
  if (item.issue_number.length < 3 || item.issue_number.length > 80) {
    sendJson(response, 400, { error: 'กรุณากรอกหมายเลขฉบับให้ถูกต้อง เช่น ฉบับที่ 1/2569' })
    return false
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.publish_date)) {
    sendJson(response, 400, { error: 'กรุณาระบุวันที่เผยแพร่จดหมายข่าว' })
    return false
  }
  if (item.display_order && !Number.isFinite(Number(item.display_order))) {
    sendJson(response, 400, { error: 'ลำดับการแสดงผลต้องเป็นตัวเลข' })
    return false
  }
  if (item.image_url === null) {
    sendJson(response, 400, { error: 'ลิงก์รูปภาพต้องเป็นลิงก์ https ที่ถูกต้อง' })
    return false
  }
  if (item.document_urls.some((url) => url === null)) {
    sendJson(response, 400, { error: 'ลิงก์ไฟล์แนบต้องเป็นลิงก์ https ที่ถูกต้อง' })
    return false
  }
  if (item.document_urls.length > 5) {
    sendJson(response, 400, { error: 'แนบไฟล์หรือลิงก์ได้รวมไม่เกิน 5 รายการ' })
    return false
  }
  return true
}

async function uploadImage(image, id, issueNumber) {
  if (!image?.data || !image?.type) return ''
  const extension = allowedImageTypes[image.type]
  if (!extension) throw new Error('INVALID_IMAGE')
  const bytes = dataUrlBytes(image.data)
  if (!bytes.length || bytes.length > 3_000_000) throw new Error('INVALID_IMAGE')
  const uploaded = await uploadToDrive({
    bytes,
    mimeType: image.type,
    name: `${id}-${Date.now()}-${issueNumber}.${extension}`,
    category: 'newsletter-image',
    image: true,
  })
  return uploaded.imageUrl
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'newsletters' })
    if (!session) return undefined

    const current = await readRepoFile('data/newsletters.csv')
    const newsletters = parseCsv(current.content)

    if (request.method === 'GET') {
      const namedNewsletters = await withUserDisplayNames(
        sortByDateAndDisplayOrder(newsletters, 'publish_date'),
        session.userNames,
      )
      return sendJson(response, 200, {
        newsletters: namedNewsletters.map((item) => ({ ...item, document_urls: contentAttachmentUrls(item) })),
      })
    }

    const body = await readJsonBody(request, 5_000_000)

    if (request.method === 'POST') {
      const itemFields = fields(body, {}, session.role === 'admin')
      if (!validate(itemFields, response)) return undefined
      const id = randomUUID()
      const imageUrl = await uploadImage(body.image, id, itemFields.issue_number) || itemFields.image_url
      if (!imageUrl) return sendJson(response, 400, { error: 'กรุณาแนบภาพจดหมายข่าวประชาสัมพันธ์' })

      const now = new Date().toISOString()
      const { document_urls: documentUrls, ...savedFields } = itemFields
      const item = withAttachmentColumns({
        id,
        ...savedFields,
        image_url: imageUrl,
        display_order: itemFields.display_order || String(
          nextDisplayOrderForDate(newsletters, 'publish_date', itemFields.publish_date),
        ),
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }, documentUrls)
      newsletters.push(item)
      await writeRepoFile(
        'data/newsletters.csv',
        stringifyCsv(newsletters, headers),
        `เพิ่มจดหมายข่าวประชาสัมพันธ์: ${item.issue_number}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([item], session.userNames)
      return sendJson(response, 201, { newsletter: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหรือลบรายการได้' })
      }

      const index = newsletters.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบจดหมายข่าวที่ต้องการ' })

      if (request.method === 'DELETE') {
        const [removed] = newsletters.splice(index, 1)
        await writeRepoFile(
          'data/newsletters.csv',
          stringifyCsv(newsletters, headers),
          `ลบจดหมายข่าวประชาสัมพันธ์: ${removed.issue_number}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }

      const itemFields = fields(body, newsletters[index], true)
      if (!validate(itemFields, response)) return undefined
      const imageUrl = await uploadImage(body.image, newsletters[index].id, itemFields.issue_number)
      const { document_urls: documentUrls, ...savedFields } = itemFields
      newsletters[index] = withAttachmentColumns({
        ...newsletters[index],
        ...savedFields,
        image_url: imageUrl || itemFields.image_url || newsletters[index].image_url,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }, documentUrls)
      await writeRepoFile(
        'data/newsletters.csv',
        stringifyCsv(newsletters, headers),
        `แก้ไขจดหมายข่าวประชาสัมพันธ์: ${itemFields.issue_number}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([newsletters[index]], session.userNames)
      return sendJson(response, 200, { newsletter: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    if (error.message === 'INVALID_IMAGE') {
      return sendJson(response, 400, { error: 'รูปภาพต้องเป็น JPG, PNG หรือ WebP และไม่เกิน 3 MB' })
    }
    if (error instanceof GoogleDriveConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้ตั้งค่า Google Drive OAuth 2.0 ใน Vercel' })
    }
    if (error instanceof GoogleDriveUploadError) {
      console.error('Google Drive upload error', error.details || error)
      return sendJson(response, 502, { error: error.message })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ข้อมูลหรือรูปภาพมีขนาดใหญ่เกินไป' })
    }
    console.error('Newsletters API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับจดหมายข่าวได้ในขณะนี้' })
  }
}
