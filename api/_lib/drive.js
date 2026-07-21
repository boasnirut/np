import { createSign } from 'node:crypto'

const tokenUrl = 'https://oauth2.googleapis.com/token'
const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id%2CwebViewLink%2CwebContentLink'
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

function safeName(name, fallbackExtension = '') {
  const clean = String(name || '')
    .normalize('NFC')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return clean || `bannamporn-upload-${Date.now()}${fallbackExtension}`
}

function driveImageUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`
}

function driveViewUrl(fileId) {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view?usp=sharing`
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
  const parentId = oauthConfigured()
    ? await oauthFolderId(token)
    : process.env.GOOGLE_DRIVE_FOLDER_ID
  const boundary = `codex_drive_${Date.now()}_${Math.random().toString(16).slice(2)}`
  const fileName = safeName(name)
  const metadata = {
    name: `${category}-${fileName}`,
    parents: [parentId],
  }
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

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(multipartBody.length),
    },
    body: multipartBody,
  })

  const file = await uploadResponse.json().catch(() => ({}))
  if (!uploadResponse.ok || !file.id) {
    throw new GoogleDriveUploadError('อัปโหลดไฟล์ไป Google Drive ไม่สำเร็จ', JSON.stringify(file))
  }

  if (publicFile) {
    const permissionResponse = await fetch(`${permissionsUrl}/${encodeURIComponent(file.id)}/permissions?supportsAllDrives=true`, {
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

  return {
    id: file.id,
    viewUrl: driveViewUrl(file.id),
    imageUrl: image ? driveImageUrl(file.id) : driveViewUrl(file.id),
    webViewLink: file.webViewLink || driveViewUrl(file.id),
    webContentLink: file.webContentLink || '',
  }
}
