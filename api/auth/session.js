import { getSession } from '../_lib/auth.js'
import { methodNotAllowed, sendJson } from '../_lib/http.js'
import { githubConfigured } from '../_lib/repo.js'

export default function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET'])
  const session = getSession(request)
  if (!session) return sendJson(response, 401, { authenticated: false })

  return sendJson(response, 200, {
    authenticated: true,
    user: {
      username: session.sub,
      displayName: session.name,
      role: session.role,
    },
    githubConfigured: githubConfigured(),
  })
}
