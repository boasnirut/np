import { requireActiveUser } from './access.js'
import {
  completeResumableDriveUpload,
  createResumableDriveUpload,
  GoogleDriveConfigError,
  GoogleDriveUploadError,
  googleDriveErrorSummary,
  recoverResumableDriveUpload,
} from './drive.js'
import { methodNotAllowed, readJsonBody, sendJson } from './http.js'

const maxUploadBytes = 100 * 1024 * 1024
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const categories = {
  'news-image': { permission: 'news', image: true, types: imageTypes },
  'news-document': { permission: 'news', types: new Set(['application/pdf']) },
  'news-attachment': { permission: 'news', anyType: true },
  'event-attachment': { permission: 'events', anyType: true },
  'award-image': { permission: 'awards', image: true, types: imageTypes },
  'award-document': { permission: 'awards', types: new Set(['application/pdf']) },
  'award-attachment': { permission: 'awards', anyType: true },
  'newsletter-image': { permission: 'newsletters', image: true, types: imageTypes },
  'newsletter-attachment': { permission: 'newsletters', anyType: true },
  'school-document': { permission: 'documents', types: new Set(['application/pdf']) },
  'school-attachment': { permission: 'documents', anyType: true },
  'quality-evidence': { permission: 'quality', anyType: true },
}

function normalizedFile(body) {
  const name = String(body.name || '').trim()
  const size = Number(body.size)
  let mimeType = String(body.mimeType || '').trim().toLowerCase()
  if ((!mimeType || mimeType === 'application/octet-stream') && name.toLowerCase().endsWith('.pdf')) {
    mimeType = 'application/pdf'
  }
  return { name, size, mimeType: mimeType || 'application/octet-stream' }
}

function validateFile(file, category, response) {
  if (!file.name || !Number.isFinite(file.size) || file.size <= 0) {
    sendJson(response, 400, { error: 'ข้อมูลไฟล์อัปโหลดไม่ถูกต้อง' })
    return false
  }
  if (file.size > maxUploadBytes) {
    sendJson(response, 413, { error: 'ไฟล์ต้องมีขนาดไม่เกิน 100 MB' })
    return false
  }
  if (!category.anyType && !category.types.has(file.mimeType)) {
    sendJson(response, 400, {
      error: category.image
        ? 'รูปภาพต้องเป็น JPG, PNG หรือ WebP'
        : 'ไฟล์เอกสารต้องเป็น PDF',
    })
    return false
  }
  return true
}

export default async function driveUploadHandler(request, response) {
  try {
    if (request.method !== 'POST') return methodNotAllowed(response, ['POST'])
    const body = await readJsonBody(request, 50_000)
    const categoryId = String(body.category || '').trim()
    const category = categories[categoryId]
    if (!category) return sendJson(response, 400, { error: 'ประเภทการอัปโหลดไม่ถูกต้อง' })

    const session = await requireActiveUser(request, response, { permission: category.permission })
    if (!session) return undefined

    if (body.action === 'start') {
      const file = normalizedFile(body)
      if (!validateFile(file, category, response)) return undefined
      const uploadUrl = await createResumableDriveUpload({
        ...file,
        category: categoryId,
        uploader: session.sub,
      })
      return sendJson(response, 200, { uploadUrl, maxBytes: maxUploadBytes })
    }

    if (body.action === 'complete') {
      const fileId = String(body.fileId || '').trim()
      if (!/^[A-Za-z0-9_-]{10,200}$/.test(fileId)) {
        return sendJson(response, 400, { error: 'รหัสไฟล์ Google Drive ไม่ถูกต้อง' })
      }
      const file = await completeResumableDriveUpload(fileId, {
        image: category.image,
        expectedCategory: categoryId,
        expectedUploader: session.sub,
      })
      return sendJson(response, 200, { file })
    }

    if (body.action === 'recover') {
      const size = Number(body.size)
      if (!Number.isSafeInteger(size) || size <= 0 || size > maxUploadBytes) {
        return sendJson(response, 400, { error: 'ขนาดไฟล์สำหรับตรวจสอบไม่ถูกต้อง' })
      }
      const file = await recoverResumableDriveUpload(body.uploadUrl, size, {
        image: category.image,
        expectedCategory: categoryId,
        expectedUploader: session.sub,
      })
      return sendJson(response, 200, { file })
    }

    return sendJson(response, 400, { error: 'คำสั่งอัปโหลดไม่ถูกต้อง' })
  } catch (error) {
    if (error.code === 'DRIVE_UPLOAD_FORBIDDEN') {
      return sendJson(response, 403, { error: error.message })
    }
    if (error instanceof GoogleDriveConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้ตั้งค่า Google Drive OAuth 2.0 ใน Vercel' })
    }
    if (error instanceof GoogleDriveUploadError) {
      console.error('Google Drive resumable upload error', error.details || error)
      const summary = googleDriveErrorSummary(error.details)
      return sendJson(response, 502, {
        error: summary ? `${error.message}: ${summary}` : error.message,
      })
    }
    console.error('Drive upload API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการอัปโหลดไฟล์ได้ในขณะนี้' })
  }
}
