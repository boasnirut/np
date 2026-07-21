export function displayImageUrl(value) {
  const source = String(value || '').trim()
  if (!source) return ''

  try {
    const url = new URL(source)
    let fileId = ''
    if (url.hostname === 'drive.google.com') {
      fileId = url.searchParams.get('id') || url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || ''
    } else if (url.hostname === 'drive.usercontent.google.com') {
      fileId = url.searchParams.get('id') || ''
    }
    return fileId
      ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w0`
      : source
  } catch {
    return source
  }
}
