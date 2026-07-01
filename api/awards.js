import { randomUUID } from 'node:crypto'
import { requireActiveUser } from './_lib/access.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import { rawGithubUrl, readRepoFile, writeBinaryRepoFile, writeRepoFile } from './_lib/repo.js'

const headers = [
  'id',
  'title',
  'award_date',
  'level',
  'recipient',
  'description',
  'image_url',
  'status',
  'author',
  'created_at',
  'updated_at',
]
const allowedImageTypes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

function fields(body, existing = {}) {
  return {
    title: String(body.title ?? existing.title ?? '').trim(),
    award_date: String(body.award_date ?? existing.award_date ?? '').trim(),
    level: String(body.level ?? existing.level ?? '').trim(),
    recipient: String(body.recipient ?? existing.recipient ?? '').trim(),
    description: String(body.description ?? existing.description ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

async function uploadImage(image, id, title) {
  if (!image?.data || !image?.type) return ''
  const extension = allowedImageTypes[image.type]
  if (!extension) throw new Error('INVALID_IMAGE')
  const bytes = Buffer.from(String(image.data).replace(/^data:[^;]+;base64,/, ''), 'base64')
  if (!bytes.length || bytes.length > 3_000_000) throw new Error('INVALID_IMAGE')
  const path = `public/uploads/awards/${id}-${Date.now()}.${extension}`
  await writeBinaryRepoFile(path, bytes, `เพิ่มรูปผลงาน: ${title}`)
  return rawGithubUrl(path)
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response)
    if (!session) return undefined
    const current = await readRepoFile('data/awards.csv')
    const awards = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        awards: awards.sort((left, right) => right.award_date.localeCompare(left.award_date)),
      })
    }

    const body = await readJsonBody(request, 5_000_000)
    if (request.method === 'POST') {
      const itemFields = fields(body)
      if (itemFields.title.length < 3 || !itemFields.award_date) {
        return sendJson(response, 400, { error: 'กรุณากรอกชื่อผลงานและวันที่ให้ครบถ้วน' })
      }
      const id = randomUUID()
      const now = new Date().toISOString()
      const item = {
        id,
        ...itemFields,
        image_url: await uploadImage(body.image, id, itemFields.title),
        author: session.sub,
        created_at: now,
        updated_at: now,
      }
      awards.push(item)
      await writeRepoFile(
        'data/awards.csv',
        stringifyCsv(awards, headers),
        `เพิ่มผลงานและรางวัล: ${item.title}`,
        current.sha,
      )
      return sendJson(response, 201, { award: item })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหรือลบรายการได้' })
      }
      const index = awards.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบผลงานที่ต้องการ' })
      if (request.method === 'DELETE') {
        const [removed] = awards.splice(index, 1)
        await writeRepoFile(
          'data/awards.csv',
          stringifyCsv(awards, headers),
          `ลบผลงานและรางวัล: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }
      const itemFields = fields(body, awards[index])
      const newImage = await uploadImage(body.image, awards[index].id, itemFields.title)
      awards[index] = {
        ...awards[index],
        ...itemFields,
        image_url: newImage || awards[index].image_url,
        updated_at: new Date().toISOString(),
      }
      await writeRepoFile(
        'data/awards.csv',
        stringifyCsv(awards, headers),
        `แก้ไขผลงานและรางวัล: ${itemFields.title}`,
        current.sha,
      )
      return sendJson(response, 200, { award: awards[index] })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error.message === 'INVALID_IMAGE') {
      return sendJson(response, 400, { error: 'รูปภาพต้องเป็น JPG, PNG หรือ WebP และไม่เกิน 3 MB' })
    }
    console.error('Awards API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับผลงานและรางวัลได้ในขณะนี้' })
  }
}
