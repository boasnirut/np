import { randomUUID } from 'node:crypto'
import { requireActiveUser } from './_lib/access.js'
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

function newsFields(body, existing = {}) {
  return {
    title: String(body.title ?? existing.title ?? '').trim(),
    category: String(body.category ?? existing.category ?? 'ประชาสัมพันธ์').trim(),
    summary: String(body.summary ?? existing.summary ?? '').trim(),
    content: String(body.content ?? existing.content ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

function validate(fields, response) {
  if (fields.title.length < 3 || fields.title.length > 180) {
    sendJson(response, 400, { error: 'หัวข้อต้องมีความยาว 3–180 ตัวอักษร' })
    return false
  }
  if (!fields.content || fields.content.length > 20_000) {
    sendJson(response, 400, { error: 'กรุณากรอกรายละเอียดข่าวไม่เกิน 20,000 ตัวอักษร' })
    return false
  }
  return true
}

async function uploadImage(image, id, title) {
  if (!image?.data || !image?.type) return ''
  const extension = allowedImageTypes[image.type]
  if (!extension) {
    const error = new Error('รองรับรูปภาพ JPG, PNG และ WebP เท่านั้น')
    error.code = 'INVALID_IMAGE'
    throw error
  }
  const encoded = String(image.data).replace(/^data:[^;]+;base64,/, '')
  const bytes = Buffer.from(encoded, 'base64')
  if (!bytes.length || bytes.length > 3_000_000) {
    const error = new Error('รูปภาพต้องมีขนาดไม่เกิน 3 MB')
    error.code = 'INVALID_IMAGE'
    throw error
  }
  const path = `public/uploads/news/${id}-${Date.now()}.${extension}`
  await writeBinaryRepoFile(path, bytes, `เพิ่มรูปข่าว: ${title}`)
  return rawGithubUrl(path)
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response)
    if (!session) return undefined

    const current = await readRepoFile('data/news.csv')
    const news = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        news: news.sort((left, right) => right.created_at.localeCompare(left.created_at)),
      })
    }

    const body = await readJsonBody(request, 5_000_000)
    if (request.method === 'POST') {
      const fields = newsFields(body)
      if (!validate(fields, response)) return undefined
      const id = randomUUID()
      const now = new Date().toISOString()
      const item = {
        id,
        ...fields,
        image_url: await uploadImage(body.image, id, fields.title),
        author: session.sub,
        created_at: now,
        updated_at: now,
      }
      news.push(item)
      await writeRepoFile(
        'data/news.csv',
        stringifyCsv(news, headers),
        `เพิ่มข่าวสาร: ${fields.title}`,
        current.sha,
      )
      return sendJson(response, 201, { news: item })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหรือลบรายการได้' })
      }
      const index = news.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบข่าวที่ต้องการ' })

      if (request.method === 'DELETE') {
        const [removed] = news.splice(index, 1)
        await writeRepoFile(
          'data/news.csv',
          stringifyCsv(news, headers),
          `ลบข่าวสาร: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }

      const fields = newsFields(body, news[index])
      if (!validate(fields, response)) return undefined
      const newImage = await uploadImage(body.image, news[index].id, fields.title)
      news[index] = {
        ...news[index],
        ...fields,
        image_url: newImage || news[index].image_url,
        updated_at: new Date().toISOString(),
      }
      await writeRepoFile(
        'data/news.csv',
        stringifyCsv(news, headers),
        `แก้ไขข่าวสาร: ${fields.title}`,
        current.sha,
      )
      return sendJson(response, 200, { news: news[index] })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    if (error.code === 'INVALID_IMAGE') {
      return sendJson(response, 400, { error: error.message })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ข้อมูลหรือรูปภาพมีขนาดใหญ่เกินไป' })
    }
    console.error('News API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับข่าวสารได้ในขณะนี้' })
  }
}
