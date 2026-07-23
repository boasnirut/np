function driveFileId(value) {
  const source = String(value || '').trim()
  if (!source) return { source: '', fileId: '' }

  try {
    const url = new URL(source)
    let fileId = ''
    if (url.hostname === 'drive.google.com') {
      fileId = url.searchParams.get('id') || url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || ''
    } else if (url.hostname === 'drive.usercontent.google.com') {
      fileId = url.searchParams.get('id') || ''
    }
    return { source, fileId }
  } catch {
    return { source, fileId: '' }
  }
}

export function displayImageUrl(value) {
  const { source, fileId } = driveFileId(value)
  return fileId
    ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w0`
    : source
}

export function displayPdfUrl(value) {
  const { source, fileId } = driveFileId(value)
  return fileId
    ? `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`
    : source
}
