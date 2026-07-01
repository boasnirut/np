export function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

export function readJsonBody(request, maxBytes = 5_000_000) {
  if (request.body && typeof request.body === 'object') return Promise.resolve(request.body)
  if (typeof request.body === 'string') {
    if (Buffer.byteLength(request.body) > maxBytes) throw new Error('PAYLOAD_TOO_LARGE')
    return Promise.resolve(JSON.parse(request.body))
  }

  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
      if (Buffer.byteLength(body) > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'))
        request.destroy()
      }
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('INVALID_JSON'))
      }
    })
    request.on('error', reject)
  })
}

export function methodNotAllowed(response, allowed) {
  response.setHeader('Allow', allowed.join(', '))
  sendJson(response, 405, { error: 'ไม่รองรับคำขอนี้' })
}
