import { createSign } from 'node:crypto'

const tokenUrl = 'https://oauth2.googleapis.com/token'
const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id%2CwebViewLink%2CwebContentLink'
const resumableUploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id%2Cname%2CmimeType%2CwebViewLink%2CwebContentLink%2CappProperties'
const permissionsUrl = 'https://www.googleapis.com/drive/v3/files'
const scope = 'https://www.googleapis.com/auth/drive.file'
const oauthFolderName = process.env.GOOGLE_DRIVE_FOLDER_NAME || 'Bannamporn Website Uploads'
let cachedOAuthFolderId = ''

export class GoogleDriveConfigError extends Error {
  constructor() {
    super('Google Drive upload is not configured')
    this.code = 'GOOGLE_DRIVE_NOT_CONFIGURED'
  }
}

export class GoogleDriveUploadError extends Error {
  constructor(message, details = '') {
    super(message)
    this.code = 'GOOGLE_DRIVE_UPLOAD_FAILED'
    this.details = details
  }
}

export function googleDriveErrorSummary(details) {
  const source = String(details || '').trim()
  if (!source) return ''
  try {
    const body = JSON.parse(source)
    return String(body.error?.message || body.error_description || body.message || '').trim()
  } catch {
    return source.length <= 220 ? source : ''
  }
}

export function dataUrlBytes(data) {
  return Buffer.from(String(data || '').replace(/^data:[^;]+;base64,/, ''), 'base64')
}

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function privateKey() {
  return String(process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
}

function oauthConfigured() {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID
    && process.env.GOOGLE_OAUTH_CLIENT_SECRET
    && process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  )
}

function serviceAccountConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_FOLDER_ID
    && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    && process.env.GOOGLE_PRIVATE_KEY,
  )
}

export function googleDriveConfigured() {
  return oauthConfigured() || serviceAccountConfigured()
}

async function oauthAccessToken() {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.access_token) {
    throw new GoogleDriveUploadError('ไม่สามารถเชื่อมต่อบัญชี Google Drive ผ่าน OAuth 2.0 ได้', JSON.stringify(body))
  }
  return body.access_token
}

async function serviceAccountAccessToken() {

  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64Url(JSON.stringify({
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope,
    aud: tokenUrl,
    exp: now + 3600,
    iat: now,
  }))
  const unsigned = `${header}.${claim}`
  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(privateKey(), 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new GoogleDriveUploadError('ไม่สามารถขอสิทธิ์อัปโหลด Google Drive ได้', JSON.stringify(body))
  }
  return body.access_token
}

async function accessToken() {
  if (oauthConfigured()) return oauthAccessToken()
  if (serviceAccountConfigured()) return serviceAccountAccessToken()
  throw new GoogleDriveConfigError()
}

async function oauthFolderId(token) {
  if (cachedOAuthFolderId) return cachedOAuthFolderId

  const query = [
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
    "appProperties has { key='bannampornWebsite' and value='uploads' }",
  ].join(' and ')
  const searchParams = new URLSearchParams({
    q: query,
    spaces: 'drive',
    pageSize: '10',
    fields: 'files(id,name)',
  })
  const searchResponse = await fetch(`${permissionsUrl}?${searchParams}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const searchBody = await searchResponse.json().catch(() => ({}))
  if (!searchResponse.ok) {
    throw new GoogleDriveUploadError('ค้นหาโฟลเดอร์อัปโหลดใน Google Drive ไม่สำเร็จ', JSON.stringify(searchBody))
  }

  if (searchBody.files?.[0]?.id) {
    cachedOAuthFolderId = searchBody.files[0].id
    return cachedOAuthFolderId
  }

  const createResponse = await fetch(`${permissionsUrl}?supportsAllDrives=true&fields=id%2Cname`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: oauthFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      appProperties: { bannampornWebsite: 'uploads' },
    }),
  })
  const folder = await createResponse.json().catch(() => ({}))
  if (!createResponse.ok || !folder.id) {
    throw new GoogleDriveUploadError('สร้างโฟลเดอร์อัปโหลดใน Google Drive ไม่สำเร็จ', JSON.stringify(folder))
  }

  cachedOAuthFolderId = folder.id
  return cachedOAuthFolderId
}

async function uploadFolderId(token) {
  const configuredFolderId = String(process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim()
  if (configuredFolderId) return configuredFolderId
  if (oauthConfigured()) {
    try {
      return await oauthFolderId(token)
    } catch (error) {
      if (!(error instanceof GoogleDriveUploadError)) throw error
      console.warn('Google Drive upload folder lookup failed; using My Drive root', error.details || error)
      return ''
    }
  }
  throw new GoogleDriveConfigError()
}

function safeName(name, fallbackExtension = '') {
  const clean = String(name || '')
    .normalize('NFC')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return clean || `bannamporn-upload-${Date.now()}${fallbackExtension}`
}

function driveImageUrl(fileId) {
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w0`
}

function driveViewUrl(fileId) {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view?usp=sharing`
}

function driveFileResult(file, image = false) {
  return {
    id: file.id,
    name: file.name || '',
    mimeType: file.mimeType || '',
    appProperties: file.appProperties || {},
    viewUrl: driveViewUrl(file.id),
    imageUrl: image ? driveImageUrl(file.id) : driveViewUrl(file.id),
    webViewLink: file.webViewLink || driveViewUrl(file.id),
    webContentLink: file.webContentLink || '',
  }
}

function resumableSessionUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    const valid = url.protocol === 'https:'
      && url.hostname === 'www.googleapis.com'
      && url.pathname === '/upload/drive/v3/files'
      && url.searchParams.get('uploadType') === 'resumable'
      && Boolean(url.searchParams.get('upload_id'))
    return valid ? url.toString() : ''
  } catch {
    return ''
  }
}

async function makePublic(token, fileId) {
  const permissionResponse = await fetch(`${permissionsUrl}/${encodeURIComponent(fileId)}/permissions?supportsAllDrives=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  })
  if (!permissionResponse.ok) {
    const details = await permissionResponse.text().catch(() => '')
    throw new GoogleDriveUploadError('ตั้งค่าสิทธิ์อ่านไฟล์บน Google Drive ไม่สำเร็จ', details)
  }
}

async function finalizeDriveFile(token, file, {
  image = false,
  expectedCategory = '',
  expectedUploader = '',
} = {}) {
  if (
    file.appProperties?.bannampornUploadCategory !== expectedCategory
    || file.appProperties?.bannampornUploader !== expectedUploader
  ) {
    const error = new Error('ไม่มีสิทธิ์ยืนยันไฟล์อัปโหลดนี้')
    error.code = 'DRIVE_UPLOAD_FORBIDDEN'
    throw error
  }
  await makePublic(token, file.id)
  return driveFileResult(file, image)
}

export async function createResumableDriveUpload({
  name,
  mimeType,
  size,
  category,
  uploader,
}) {
  const token = await accessToken()
  const parentId = await uploadFolderId(token)
  const startUpload = async (folderId = '') => {
    const metadata = {
      name: `${category}-${safeName(name)}`,
      appProperties: {
        bannampornUploadCategory: String(category || ''),
        bannampornUploader: String(uploader || ''),
      },
    }
    if (folderId) metadata.parents = [folderId]
    return fetch(resumableUploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
        'X-Upload-Content-Length': String(size),
      },
      body: JSON.stringify(metadata),
    })
  }

  let response = await startUpload(parentId)
  if (!response.ok && parentId && oauthConfigured()) {
    const folderError = await response.text().catch(() => '')
    console.warn('Google Drive upload folder rejected; retrying in My Drive root', folderError)
    response = await startUpload()
  }
  const sessionUrl = response.headers.get('location')
  if (!response.ok || !sessionUrl) {
    const details = await response.text().catch(() => '')
    throw new GoogleDriveUploadError('ไม่สามารถเริ่มอัปโหลดไฟล์ไป Google Drive ได้', details)
  }
  return sessionUrl
}

export async function completeResumableDriveUpload(fileId, {
  image = false,
  expectedCategory = '',
  expectedUploader = '',
} = {}) {
  const token = await accessToken()
  const fields = 'id%2Cname%2CmimeType%2CwebViewLink%2CwebContentLink%2CappProperties'
  const response = await fetch(`${permissionsUrl}/${encodeURIComponent(fileId)}?supportsAllDrives=true&fields=${fields}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const file = await response.json().catch(() => ({}))
  if (!response.ok || !file.id) {
    throw new GoogleDriveUploadError('ตรวจสอบไฟล์ที่อัปโหลดไป Google Drive ไม่สำเร็จ', JSON.stringify(file))
  }
  return finalizeDriveFile(token, file, { image, expectedCategory, expectedUploader })
}

export async function recoverResumableDriveUpload(uploadUrl, size, {
  image = false,
  expectedCategory = '',
  expectedUploader = '',
} = {}) {
  const sessionUrl = resumableSessionUrl(uploadUrl)
  const expectedSize = Number(size)
  if (!sessionUrl || !Number.isSafeInteger(expectedSize) || expectedSize <= 0) {
    throw new GoogleDriveUploadError('ข้อมูลสำหรับตรวจสอบไฟล์อัปโหลดไม่ถูกต้อง')
  }

  const token = await accessToken()
  const response = await fetch(sessionUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Length': '0',
      'Content-Range': `bytes */${expectedSize}`,
    },
  })
  const file = await response.json().catch(() => ({}))
  if ((response.status === 200 || response.status === 201) && file.id) {
    return finalizeDriveFile(token, file, { image, expectedCategory, expectedUploader })
  }
  if (response.status === 308) {
    throw new GoogleDriveUploadError(
      'ไฟล์ใน Google Drive ยังอัปโหลดไม่สมบูรณ์ กรุณาลองอัปโหลดอีกครั้ง',
      response.headers.get('range') || '',
    )
  }
  throw new GoogleDriveUploadError(
    'ไม่สามารถยืนยันผลการอัปโหลดไฟล์ใน Google Drive ได้',
    JSON.stringify(file),
  )
}

export async function uploadToDrive({
  bytes,
  mimeType,
  name,
  category = 'uploads',
  publicFile = true,
  image = false,
}) {
  if (!Buffer.isBuffer(bytes) || !bytes.length) {
    throw new GoogleDriveUploadError('ไฟล์ที่อัปโหลดไม่ถูกต้อง')
  }

  const token = await accessToken()
  const parentId = await uploadFolderId(token)
  const boundary = `codex_drive_${Date.now()}_${Math.random().toString(16).slice(2)}`
  const fileName = safeName(name)
  const sendUpload = async (folderId = '') => {
    const metadata = { name: `${category}-${fileName}` }
    if (folderId) metadata.parents = [folderId]
    const delimiter = `--${boundary}\r\n`
    const closeDelimiter = `\r\n--${boundary}--`
    const multipartBody = Buffer.concat([
      Buffer.from(
        `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      ),
      Buffer.from(`${delimiter}Content-Type: ${mimeType || 'application/octet-stream'}\r\n\r\n`),
      bytes,
      Buffer.from(closeDelimiter),
    ])
    return fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': String(multipartBody.length),
      },
      body: multipartBody,
    })
  }

  let uploadResponse = await sendUpload(parentId)
  if (!uploadResponse.ok && parentId && oauthConfigured()) {
    const folderError = await uploadResponse.text().catch(() => '')
    console.warn('Google Drive upload folder rejected; retrying in My Drive root', folderError)
    uploadResponse = await sendUpload()
  }

  const file = await uploadResponse.json().catch(() => ({}))
  if (!uploadResponse.ok || !file.id) {
    throw new GoogleDriveUploadError('อัปโหลดไฟล์ไป Google Drive ไม่สำเร็จ', JSON.stringify(file))
  }

  if (publicFile) {
    await makePublic(token, file.id)
  }

  return driveFileResult(file, image)
}
