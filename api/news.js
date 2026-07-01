import { randomUUID } from 'node:crypto'
import { getSession } from './_lib/auth.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import {
  rawGithubUrl,
  readRepoFile,
  RepositoryConfigError,
  writeBinaryRepoFile,
  writeRepoFile,
} from './_lib/repo.js'

const headers = [
  'id',
  'title',
  'category',
  'summary',
  'content',
  'image_url',
  'status',
  'author',
  'created_at',
  'updated_at',
]
const allowedImageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function requireSession(request, response) {
  const session = getSession(request)
  if (!session) {
    sendJson(response, 401, { error: 'กรุณาเข้าสู่ระบบอีกครั้ง' })
    return null
  }
  return session
}

async function listNews(response) {
  const { content } = await readRepoFile('data/news.csv')
  const news = parseCsv(content).sort((left, right) =>
    right.created_at.localeCompare(left.created_at),
  )
  return sendJson(response, 200, { news })
}

async function createNews(request, response, session) {
  const body = await readJsonBody(request, 5_000_000)
  const title = String(body.title || '').trim()
  const category = String(body.category || 'ประชาสัมพันธ์').trim()
  const summary = String(body.summary || '').trim()
  const content = String(body.content || '').trim()
  const status = body.status === 'draft' ? 'draft' : 'published'

  if (title.length < 3 || title.length > 180) {
    return sendJson(response, 400, { error: 'หัวข้อต้องมีความยาว 3–180 ตัวอักษร' })
  }
  if (!content || content.length > 20_000) {
    return sendJson(response, 400, { error: 'กรุณากรอกรายละเอียดข่าวไม่เกิน 20,000 ตัวอักษร' })
  }

  const id = randomUUID()
  let imageUrl = ''
  if (body.image?.data && body.image?.type) {
    const extension = allowedImageTypes[body.image.type]
    if (!extension) {
      return sendJson(response, 400, { error: 'รองรับรูปภาพ JPG, PNG และ WebP เท่านั้น' })
    }
    const encoded = String(body.image.data).replace(/^data:[^;]+;base64,/, '')
    const imageBytes = Buffer.from(encoded, 'base64')
    if (!imageBytes.length || imageBytes.length > 3_000_000) {
      return sendJson(response, 400, { error: 'รูปภาพต้องมีขนาดไม่เกิน 3 MB' })
    }
    const imagePath = `public/uploads/news/${id}.${extension}`
    await writeBinaryRepoFile(imagePath, imageBytes, `เพิ่มรูปข่าว: ${title}`)
    imageUrl = rawGithubUrl(imagePath)
  }

  const current = await readRepoFile('data/news.csv')
  const news = parseCsv(current.content)
  const now = new Date().toISOString()
  const item = {
    id,
    title,
    category,
    summary,
    content,
    image_url: imageUrl,
    status,
    author: session.sub,
    created_at: now,
    updated_at: now,
  }
  news.push(item)
  await writeRepoFile(
    'data/news.csv',
    stringifyCsv(news, headers),
    `เพิ่มข่าวสาร: ${title}`,
    current.sha,
  )

  return sendJson(response, 201, { news: item })
}

export default async function handler(request, response) {
  const session = requireSession(request, response)
  if (!session) return undefined

  try {
    if (request.method === 'GET') return await listNews(response)
    if (request.method === 'POST') return await createNews(request, response, session)
    return methodNotAllowed(response, ['GET', 'POST'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, {
        error: 'ระบบบันทึกข้อมูลยังไม่ได้เชื่อมต่อ GitHub',
        code: error.code,
      })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ข้อมูลหรือรูปภาพมีขนาดใหญ่เกินไป' })
    }
    console.error('News API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับข่าวสารได้ในขณะนี้' })
  }
}
