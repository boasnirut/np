import { randomUUID } from 'node:crypto'
import { canModifyRecord, requireActiveUser, withUserDisplayNames } from './_lib/access.js'
import {
  cleanExternalUrl,
  evidenceDocumentNames,
  evidenceDocumentTypes,
  evidenceDocumentUrls,
  nextDisplayOrder,
  sortByDisplayOrder,
} from './_lib/content.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import { resolveEvidenceMimeTypes } from './_lib/external-file.js'
import {
  dataUrlBytes,
  GoogleDriveConfigError,
  GoogleDriveUploadError,
  uploadToDrive,
} from './_lib/drive.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import {
  readRepoFile,
  RepositoryConfigError,
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
  'updated_by',
  'document_url_2',
  'document_url_3',
  'document_url_4',
  'document_url_5',
  'document_type',
  'document_type_2',
  'document_type_3',
  'document_type_4',
  'document_type_5',
  'document_name',
  'document_name_2',
  'document_name_3',
  'document_name_4',
  'document_name_5',
]

function fields(body, existing = {}, isAdmin = false) {
  const sourceUrls = Array.isArray(body.document_urls)
    ? body.document_urls
    : evidenceDocumentUrls(existing)
  const sourceTypes = Array.isArray(body.document_types)
    ? body.document_types
    : evidenceDocumentTypes(existing)
  const sourceNames = Array.isArray(body.document_names)
    ? body.document_names
    : evidenceDocumentNames(existing)
  const sourceEvidence = sourceUrls
    .map((url, index) => ({
      url: cleanExternalUrl(url),
      type: String(sourceTypes[index] || '').trim().toLowerCase(),
      name: String(sourceNames[index] || '').trim(),
    }))
    .filter((item) => item.url)
  return {
    education_level: String(body.education_level ?? existing.education_level ?? 'early').trim(),
    indicator_code: String(body.indicator_code ?? existing.indicator_code ?? '1.1').trim(),
    title: String(body.title ?? existing.title ?? '').trim(),
    description: String(body.description ?? existing.description ?? '').trim(),
    document_urls: sourceEvidence.map((item) => item.url),
    document_types: sourceEvidence.map((item) => item.type),
    document_names: sourceEvidence.map((item) => item.name),
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
  if (item.document_urls.some((url) => url === null)) {
    sendJson(response, 400, { error: 'ลิงก์เอกสารต้องเป็นลิงก์ https ที่ถูกต้อง' })
    return false
  }
  if (item.document_urls.length + (hasUploadedFile ? 1 : 0) > 5) {
    sendJson(response, 400, { error: 'เพิ่มหลักฐานได้ไม่เกิน 5 ลิงก์หรือไฟล์ต่อรายการ' })
    return false
  }
  if (item.document_types.some((type) => type && !/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(type))) {
    sendJson(response, 400, { error: 'ชนิดไฟล์หลักฐานไม่ถูกต้อง' })
    return false
  }
  if (item.document_names.some((name) => name.length > 180)) {
    sendJson(response, 400, { error: 'ชื่อหลักฐานแต่ละรายการต้องไม่เกิน 180 ตัวอักษร' })
    return false
  }
  if (!item.document_urls.length && !hasUploadedFile) {
    sendJson(response, 400, { error: 'กรุณาอัปโหลดไฟล์หลักฐานหรือกรอกลิงก์เอกสาร' })
    return false
  }
  if (item.display_order && !Number.isFinite(Number(item.display_order))) {
    sendJson(response, 400, { error: 'ลำดับการแสดงผลต้องเป็นตัวเลข' })
    return false
  }
  return true
}

async function withResolvedDocumentTypes(item) {
  return {
    ...item,
    document_types: await resolveEvidenceMimeTypes(item.document_urls, item.document_types),
  }
}

function withDocumentColumns(item, urls, types = [], names = []) {
  return {
    ...item,
    document_url: urls[0] || '',
    document_url_2: urls[1] || '',
    document_url_3: urls[2] || '',
    document_url_4: urls[3] || '',
    document_url_5: urls[4] || '',
    document_type: types[0] || '',
    document_type_2: types[1] || '',
    document_type_3: types[2] || '',
    document_type_4: types[3] || '',
    document_type_5: types[4] || '',
    document_name: names[0] || '',
    document_name_2: names[1] || '',
    document_name_3: names[2] || '',
    document_name_4: names[3] || '',
    document_name_5: names[4] || '',
  }
}

async function presentEvidence(items, userNames) {
  const namedItems = await withUserDisplayNames(items, userNames)
  return namedItems.map((item) => ({
    ...item,
    document_urls: evidenceDocumentUrls(item),
    document_types: evidenceDocumentTypes(item),
    document_names: evidenceDocumentNames(item),
  }))
}

async function uploadPdf(file, id, title) {
  if (!file?.data) return ''
  if (file.type !== 'application/pdf') throw new Error('INVALID_PDF')
  const bytes = dataUrlBytes(file.data)
  if (!bytes.length || bytes.length > 3_000_000) throw new Error('INVALID_PDF')
  const uploaded = await uploadToDrive({
    bytes,
    mimeType: file.type,
    name: file.name || `${id}-${Date.now()}-${title}.pdf`,
    category: 'quality-evidence',
  })
  return uploaded.viewUrl
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'quality' })
    if (!session) return undefined

    const current = await readRepoFile('data/quality-evidence.csv')
    const evidence = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        evidence: await presentEvidence(sortByDisplayOrder(evidence), session.userNames),
      })
    }

    const body = await readJsonBody(request, 4_500_000)

    if (request.method === 'POST') {
      const itemFields = await withResolvedDocumentTypes(
        fields(body, {}, session.role === 'admin'),
      )
      if (!validate(itemFields, response, Boolean(body.file?.data))) return undefined
      const id = randomUUID()
      const uploadedUrl = await uploadPdf(body.file, id, itemFields.title)
      const now = new Date().toISOString()
      const {
        document_urls: documentUrls,
        document_types: documentTypes,
        document_names: documentNames,
        ...savedFields
      } = itemFields
      const savedUrls = uploadedUrl ? [uploadedUrl, ...documentUrls] : documentUrls
      const savedTypes = uploadedUrl ? [body.file?.type || '', ...documentTypes] : documentTypes
      const savedNames = uploadedUrl
        ? [String(body.file?.evidence_name || body.file?.name || '').trim(), ...documentNames]
        : documentNames
      const item = withDocumentColumns({
        id,
        ...savedFields,
        display_order: itemFields.display_order || String(nextDisplayOrder(evidence)),
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }, savedUrls, savedTypes, savedNames)
      evidence.push(item)
      await writeRepoFile(
        'data/quality-evidence.csv',
        stringifyCsv(evidence, headers),
        `เพิ่มหลักฐาน สมศ. ${item.indicator_code}: ${item.title}`,
        current.sha,
      )
      const [responseItem] = await presentEvidence([item], session.userNames)
      return sendJson(response, 201, { evidence: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      const index = evidence.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบเอกสารหลักฐานที่ต้องการ' })
      if (!canModifyRecord(session, evidence[index])) {
        return sendJson(response, 403, { error: 'สมาชิกแก้ไขหรือลบได้เฉพาะหลักฐานที่ตนเองสร้าง' })
      }

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

      const itemFields = await withResolvedDocumentTypes(
        fields(body, evidence[index], session.role === 'admin'),
      )
      if (!validate(itemFields, response, Boolean(body.file?.data))) return undefined
      const uploadedUrl = await uploadPdf(body.file, evidence[index].id, itemFields.title)
      const {
        document_urls: documentUrls,
        document_types: documentTypes,
        document_names: documentNames,
        ...savedFields
      } = itemFields
      const savedUrls = uploadedUrl ? [uploadedUrl, ...documentUrls] : documentUrls
      const savedTypes = uploadedUrl ? [body.file?.type || '', ...documentTypes] : documentTypes
      const savedNames = uploadedUrl
        ? [String(body.file?.evidence_name || body.file?.name || '').trim(), ...documentNames]
        : documentNames
      evidence[index] = withDocumentColumns({
        ...evidence[index],
        ...savedFields,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }, savedUrls, savedTypes, savedNames)
      await writeRepoFile(
        'data/quality-evidence.csv',
        stringifyCsv(evidence, headers),
        `แก้ไขหลักฐาน สมศ. ${itemFields.indicator_code}: ${itemFields.title}`,
        current.sha,
      )
      const [responseItem] = await presentEvidence([evidence[index]], session.userNames)
      return sendJson(response, 200, { evidence: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    if (error.message === 'INVALID_PDF') {
      return sendJson(response, 400, { error: 'รองรับไฟล์ PDF ขนาดไม่เกิน 3 MB' })
    }
    if (error instanceof GoogleDriveConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้ตั้งค่า Google Drive OAuth 2.0 ใน Vercel' })
    }
    if (error instanceof GoogleDriveUploadError) {
      console.error('Google Drive upload error', error.details || error)
      return sendJson(response, 502, { error: error.message })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ไฟล์เอกสารมีขนาดใหญ่เกินไป' })
    }
    console.error('Quality evidence API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับเอกสารหลักฐานได้ในขณะนี้' })
  }
}
