const driveMimeCache = new Map()

const extensionMimeTypes = {
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
}

function mimeTypeFromFilename(value) {
  const filename = String(value || '').split(/[?#]/)[0].toLowerCase()
  const extension = filename.match(/\.([a-z0-9]+)$/)?.[1] || ''
  return extensionMimeTypes[extension] || ''
}

function driveFileId(value) {
  try {
    const url = new URL(String(value || '').trim())
    const host = url.hostname.toLowerCase()
    if (!['drive.google.com', 'drive.usercontent.google.com'].includes(host)) return ''
    return url.searchParams.get('id') || url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || ''
  } catch {
    return ''
  }
}

function isDriveFolderUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    if (url.hostname.toLowerCase() !== 'drive.google.com') return false
    return /\/folders\//i.test(url.pathname) || /\/folderview\/?$/i.test(url.pathname)
  } catch {
    return false
  }
}

function dispositionFilename(value) {
  const disposition = String(value || '')
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (utf8Name) {
    try {
      return decodeURIComponent(utf8Name)
    } catch {
      return utf8Name
    }
  }
  return disposition.match(/filename="?([^";]+)"?/i)?.[1] || ''
}

async function driveMimeType(fileId) {
  if (driveMimeCache.has(fileId)) return driveMimeCache.get(fileId)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5_000)
  try {
    const params = new URLSearchParams({ id: fileId, export: 'download', confirm: 't' })
    const response = await fetch(`https://drive.usercontent.google.com/download?${params}`, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    })
    if (!response.ok) return ''
    const contentType = String(response.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
      .toLowerCase()
    const filenameType = mimeTypeFromFilename(
      dispositionFilename(response.headers.get('content-disposition')),
    )
    const mimeType = contentType && contentType !== 'application/octet-stream'
      ? contentType
      : filenameType
    if (mimeType) driveMimeCache.set(fileId, mimeType)
    return mimeType
  } catch {
    return ''
  } finally {
    clearTimeout(timeout)
  }
}

export async function inferExternalMimeType(value, existingType = '') {
  if (isDriveFolderUrl(value)) return 'application/vnd.google-apps.folder'

  const savedType = String(existingType || '').trim().toLowerCase()
  if (savedType) return savedType

  const extensionType = mimeTypeFromFilename(value)
  if (extensionType) return extensionType

  const fileId = driveFileId(value)
  return fileId ? driveMimeType(fileId) : ''
}

export async function resolveEvidenceMimeTypes(urls, types = []) {
  return Promise.all(
    urls.map((url, index) => inferExternalMimeType(url, types[index])),
  )
}
