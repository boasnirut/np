import { randomUUID } from 'node:crypto'
import { requireActiveUser } from './_lib/access.js'
import {
  cleanExternalUrl,
  nextDisplayOrder,
  sortByDisplayOrder,
} from './_lib/content.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import {
  rawGithubUrl,
  readRepoFile,
  RepositoryConfigError,
  writeBinaryRepoFile,
  writeRepoFile,
} from './_lib/repo.js'
import { qualityIndicator, qualityLevelMap } from '../src/qualityStandards.js'

const headers = [
  'id',
  'education_level',
  'indicator_code',
  'title',
  'description',
  'document_url',
  'display_order',
  'status',
  'author',
  'created_at',
  'updated_at',
]

function fields(body, existing = {}, isAdmin = false) {
  return {
    education_level: String(body.education_level ?? existing.education_level ?? 'early').trim(),
    indicator_code: String(body.indicator_code ?? existing.indicator_code ?? '1.1').trim(),
    title: String(body.title ?? existing.title ?? '').trim(),
    description: String(body.description ?? existing.description ?? '').trim(),
    document_url: cleanExternalUrl(body.document_url ?? existing.document_url ?? ''),
    display_order: isAdmin
      ? String(body.display_order ?? existing.display_order ?? '').trim()
      : String(existing.display_order ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

function validate(item, response, hasUploadedFile = false) {
  if (!qualityLevelMap[item.education_level] || !qualityIndicator(item.education_level, item.indicator_code)) {
    sendJson(response, 400, { error: 'ระดับการศึกษาหรือตัวชี้วัดไม่ถูกต้อง' })
    return false
  }
  if (item.title.length < 3 || item.title.length > 180) {
    sendJson(response, 400, { error: 'ชื่อเอกสารต้องมีความยาว 3–180 ตัวอักษร' })
    return false
  }
  if (item.description.length > 500) {
    sendJson(response, 400, { error: 'คำอธิบายเอกสารต้องไม่เกิน 500 ตัวอักษร' })
    return false
  }
  if (item.document_url === null) {
    sendJson(response, 400, { error: 'ลิงก์เอกสารต้องเป็นลิงก์ https ที่ถูกต้อง' })
    return false
  }
  if (!item.document_url && !hasUploadedFile) {
    sendJson(response, 400, { error: 'กรุณาอัปโหลดไฟล์ PDF หรือกรอกลิงก์เอกสาร' })
    return false
  }
  if (item.display_order && !Number.isFinite(Number(item.display_order))) {
    sendJson(response, 400, { error: 'ลำดับการแสดงผลต้องเป็นตัวเลข' })
    return false
  }
  return true
}

async function uploadPdf(file, id, title) {
  if (!file?.data) return ''
  if (file.type !== 'application/pdf') throw new Error('INVALID_PDF')
  const bytes = Buffer.from(String(file.data).replace(/^data:[^;]+;base64,/, ''), 'base64')
  if (!bytes.length || bytes.length > 3_000_000) throw new Error('INVALID_PDF')
  const path = `public/uploads/quality/${id}-${Date.now()}.pdf`
  await writeBinaryRepoFile(path, bytes, `เพิ่มหลักฐาน สมศ.: ${title}`)
  return rawGithubUrl(path)
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'quality' })
    if (!session) return undefined

    const current = await readRepoFile('data/quality-evidence.csv')
    const evidence = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, { evidence: sortByDisplayOrder(evidence) })
    }

    const body = await readJsonBody(request, 4_500_000)

    if (request.method === 'POST') {
      const itemFields = fields(body, {}, session.role === 'admin')
      if (!validate(itemFields, response, Boolean(body.file?.data))) return undefined
      const id = randomUUID()
      const uploadedUrl = await uploadPdf(body.file, id, itemFields.title)
      const now = new Date().toISOString()
      const item = {
        id,
        ...itemFields,
        document_url: uploadedUrl || itemFields.document_url,
        display_order: itemFields.display_order || String(nextDisplayOrder(evidence)),
        author: session.sub,
        created_at: now,
        updated_at: now,
      }
      evidence.push(item)
      await writeRepoFile(
        'data/quality-evidence.csv',
        stringifyCsv(evidence, headers),
        `เพิ่มหลักฐาน สมศ. ${item.indicator_code}: ${item.title}`,
        current.sha,
      )
      return sendJson(response, 201, { evidence: item })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหรือลบหลักฐานได้' })
      }
      const index = evidence.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบเอกสารหลักฐานที่ต้องการ' })

      if (request.method === 'DELETE') {
        const [removed] = evidence.splice(index, 1)
        await writeRepoFile(
          'data/quality-evidence.csv',
          stringifyCsv(evidence, headers),
          `ลบหลักฐาน สมศ. ${removed.indicator_code}: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }

      const itemFields = fields(body, evidence[index], true)
      if (!validate(itemFields, response, Boolean(body.file?.data))) return undefined
      const uploadedUrl = await uploadPdf(body.file, evidence[index].id, itemFields.title)
      evidence[index] = {
        ...evidence[index],
        ...itemFields,
        document_url: uploadedUrl || itemFields.document_url || evidence[index].document_url,
        updated_at: new Date().toISOString(),
      }
      await writeRepoFile(
        'data/quality-evidence.csv',
        stringifyCsv(evidence, headers),
        `แก้ไขหลักฐาน สมศ. ${itemFields.indicator_code}: ${itemFields.title}`,
        current.sha,
      )
      return sendJson(response, 200, { evidence: evidence[index] })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    if (error.message === 'INVALID_PDF') {
      return sendJson(response, 400, { error: 'รองรับไฟล์ PDF ขนาดไม่เกิน 3 MB' })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ไฟล์เอกสารมีขนาดใหญ่เกินไป' })
    }
    console.error('Quality evidence API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับเอกสารหลักฐานได้ในขณะนี้' })
  }
}
