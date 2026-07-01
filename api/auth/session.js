import { requireActiveUser } from '../_lib/access.js'
import { methodNotAllowed, sendJson } from '../_lib/http.js'
import { githubConfigured } from '../_lib/repo.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET'])
  const session = await requireActiveUser(request, response)
  if (!session) return undefined

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
