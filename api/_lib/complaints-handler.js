import { randomUUID } from 'node:crypto'
import { requireActiveUser } from './access.js'
import { updateCsvFile } from './csv-repo.js'
import { parseCsv } from './csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './http.js'
import { readRepoFile, RepositoryConfigError } from './repo.js'
import {
  decryptSecret,
  encryptSecret,
  SecretBoxConfigError,
} from './secret-box.js'

const headers = [
  'id',
  'complainant_name',
  'contact',
  'subject',
  'details',
  'evidence_url_1',
  'evidence_url_2',
  'evidence_url_3',
  'evidence_url_4',
  'evidence_url_5',
  'status',
  'internal_note',
  'created_at',
  'updated_at',
  'handled_by',
]
const allowedStatuses = new Set(['new', 'reviewing', 'resolved'])

function cleanHttpsUrl(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  try {
    const url = new URL(text)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function evidenceUrls(item) {
  return [
    decryptSecret(item.evidence_url_1),
    decryptSecret(item.evidence_url_2),
    decryptSecret(item.evidence_url_3),
    decryptSecret(item.evidence_url_4),
    decryptSecret(item.evidence_url_5),
  ].filter(Boolean)
}

function decorate(items, userNames) {
  return items.map((item) => ({
    ...item,
    complainant_name: decryptSecret(item.complainant_name),
    contact: decryptSecret(item.contact),
    subject: decryptSecret(item.subject),
    details: decryptSecret(item.details),
    internal_note: decryptSecret(item.internal_note),
    evidence_urls: evidenceUrls(item),
    handled_by_name: userNames[item.handled_by] || item.handled_by || '',
  }))
}

export default async function handler(request, response) {
  try {
    if (request.method === 'POST') {
      const body = await readJsonBody(request, 50_000)
      if (String(body.website || '').trim()) {
        return sendJson(response, 201, { success: true })
      }
      const urls = (Array.isArray(body.evidence_urls) ? body.evidence_urls : [])
        .map(cleanHttpsUrl)
        .filter((url) => url !== '')
      const itemFields = {
        complainant_name: String(body.complainant_name || '').trim(),
        contact: String(body.contact || '').trim(),
        subject: String(body.subject || '').trim(),
        details: String(body.details || '').trim(),
      }
      if (itemFields.complainant_name.length < 2 || itemFields.complainant_name.length > 80) {
        return sendJson(response, 400, { error: 'กรุณาระบุชื่อผู้แจ้ง 2–80 ตัวอักษร' })
      }
      if (itemFields.contact.length < 3 || itemFields.contact.length > 150) {
        return sendJson(response, 400, { error: 'กรุณาระบุช่องทางติดต่อกลับ' })
      }
      if (itemFields.subject.length < 3 || itemFields.subject.length > 180) {
        return sendJson(response, 400, { error: 'หัวข้อเรื่องต้องมีความยาว 3–180 ตัวอักษร' })
      }
      if (itemFields.details.length < 10 || itemFields.details.length > 5000) {
        return sendJson(response, 400, { error: 'รายละเอียดต้องมีความยาว 10–5,000 ตัวอักษร' })
      }
      if (urls.length > 5 || urls.some((url) => url === null)) {
        return sendJson(response, 400, { error: 'แนบลิงก์ https ที่ถูกต้องได้ไม่เกิน 5 ลิงก์' })
      }
      const now = new Date().toISOString()
      const item = {
        id: randomUUID(),
        complainant_name: encryptSecret(itemFields.complainant_name),
        contact: encryptSecret(itemFields.contact),
        subject: encryptSecret(itemFields.subject),
        details: encryptSecret(itemFields.details),
        evidence_url_1: encryptSecret(urls[0]),
        evidence_url_2: encryptSecret(urls[1]),
        evidence_url_3: encryptSecret(urls[2]),
        evidence_url_4: encryptSecret(urls[3]),
        evidence_url_5: encryptSecret(urls[4]),
        status: 'new',
        internal_note: '',
        created_at: now,
        updated_at: now,
        handled_by: '',
      }
      await updateCsvFile(
        'data/complaints.csv',
        headers,
        'เพิ่มเรื่องร้องเรียนจากหน้าเว็บไซต์',
        (rows) => {
          rows.push(item)
          return item
        },
      )
      return sendJson(response, 201, {
        success: true,
        reference: item.id.slice(0, 8).toUpperCase(),
        message: 'ส่งเรื่องเรียบร้อยแล้ว โรงเรียนจะเก็บข้อมูลเป็นความลับและประสานผู้รับผิดชอบ',
      })
    }

    const session = await requireActiveUser(request, response, { permission: 'complaints' })
    if (!session) return undefined

    if (request.method === 'GET') {
      const current = await readRepoFile('data/complaints.csv')
      const complaints = parseCsv(current.content).sort((left, right) =>
        String(right.created_at).localeCompare(String(left.created_at)),
      )
      return sendJson(response, 200, {
        complaints: decorate(complaints, session.userNames),
      })
    }

    const body = await readJsonBody(request, 30_000)
    if (request.method === 'PUT') {
      const status = String(body.status || '')
      const internalNote = String(body.internal_note || '').trim()
      if (!allowedStatuses.has(status)) {
        return sendJson(response, 400, { error: 'สถานะเรื่องร้องเรียนไม่ถูกต้อง' })
      }
      if (internalNote.length > 5000) {
        return sendJson(response, 400, { error: 'บันทึกภายในต้องไม่เกิน 5,000 ตัวอักษร' })
      }
      const updated = await updateCsvFile(
        'data/complaints.csv',
        headers,
        'อัปเดตสถานะเรื่องร้องเรียน',
        (rows) => {
          const index = rows.findIndex((item) => item.id === String(body.id || ''))
          if (index < 0) throw new Error('NOT_FOUND')
          rows[index] = {
            ...rows[index],
            status,
            internal_note: encryptSecret(internalNote),
            updated_at: new Date().toISOString(),
            handled_by: session.sub,
          }
          return rows[index]
        },
      )
      return sendJson(response, 200, {
        complaint: decorate([updated], session.userNames)[0],
      })
    }

    if (request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่ลบเรื่องร้องเรียนได้' })
      }
      await updateCsvFile(
        'data/complaints.csv',
        headers,
        'ลบเรื่องร้องเรียน',
        (rows) => {
          const index = rows.findIndex((item) => item.id === String(body.id || ''))
          if (index < 0) throw new Error('NOT_FOUND')
          rows.splice(index, 1)
          return true
        },
      )
      return sendJson(response, 200, { success: true })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return sendJson(response, 404, { error: 'ไม่พบเรื่องร้องเรียนที่ต้องการ' })
    }
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    if (error instanceof SecretBoxConfigError) {
      return sendJson(response, 503, { error: 'ระบบรับเรื่องร้องเรียนยังตั้งค่าความปลอดภัยไม่สมบูรณ์' })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ข้อมูลมีขนาดใหญ่เกินไป' })
    }
    console.error('Complaints API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถส่งหรือจัดการเรื่องร้องเรียนได้ในขณะนี้' })
  }
}
