import { randomUUID } from 'node:crypto'
import { requireActiveUser } from './_lib/access.js'
import { updateCsvFile } from './_lib/csv-repo.js'
import { parseCsv } from './_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import { readRepoFile, RepositoryConfigError } from './_lib/repo.js'

const headers = [
  'id',
  'name',
  'email',
  'question',
  'answer',
  'status',
  'is_published',
  'created_at',
  'answered_at',
  'answered_by',
  'updated_at',
]

function publicFields(body) {
  return {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    question: String(body.question || '').trim(),
  }
}

function validatePublic(item, response) {
  if (item.name.length < 2 || item.name.length > 80) {
    sendJson(response, 400, { error: 'กรุณาระบุชื่อผู้ถาม 2–80 ตัวอักษร' })
    return false
  }
  if (item.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email) || item.email.length > 120)) {
    sendJson(response, 400, { error: 'รูปแบบอีเมลไม่ถูกต้อง' })
    return false
  }
  if (item.question.length < 10 || item.question.length > 2000) {
    sendJson(response, 400, { error: 'คำถามต้องมีความยาว 10–2,000 ตัวอักษร' })
    return false
  }
  return true
}

function decorate(items, userNames) {
  return items.map((item) => ({
    ...item,
    answered_by_name: userNames[item.answered_by] || item.answered_by || '',
  }))
}

export default async function handler(request, response) {
  try {
    if (request.method === 'POST') {
      const body = await readJsonBody(request, 30_000)
      if (String(body.website || '').trim()) {
        return sendJson(response, 201, { success: true })
      }
      const itemFields = publicFields(body)
      if (!validatePublic(itemFields, response)) return undefined
      const now = new Date().toISOString()
      const item = {
        id: randomUUID(),
        ...itemFields,
        answer: '',
        status: 'pending',
        is_published: 'false',
        created_at: now,
        answered_at: '',
        answered_by: '',
        updated_at: now,
      }
      await updateCsvFile(
        'data/questions.csv',
        headers,
        'เพิ่มคำถามจากหน้าเว็บไซต์',
        (rows) => {
          rows.push(item)
          return item
        },
      )
      return sendJson(response, 201, {
        success: true,
        message: 'ส่งคำถามเรียบร้อยแล้ว โรงเรียนจะตรวจสอบและตอบกลับโดยเร็ว',
      })
    }

    const session = await requireActiveUser(request, response, { permission: 'qa' })
    if (!session) return undefined

    if (request.method === 'GET') {
      const current = await readRepoFile('data/questions.csv')
      const questions = parseCsv(current.content).sort((left, right) =>
        String(right.created_at).localeCompare(String(left.created_at)),
      )
      return sendJson(response, 200, {
        questions: decorate(questions, session.userNames),
      })
    }

    const body = await readJsonBody(request, 30_000)
    if (request.method === 'PUT') {
      const answer = String(body.answer || '').trim()
      if (answer.length > 5000) {
        return sendJson(response, 400, { error: 'คำตอบต้องไม่เกิน 5,000 ตัวอักษร' })
      }
      const requestedPublish = body.is_published === true || body.is_published === 'true'
      if (session.role === 'admin' && requestedPublish && !answer) {
        return sendJson(response, 400, { error: 'กรุณาตอบคำถามก่อนเผยแพร่บนเว็บไซต์' })
      }
      const now = new Date().toISOString()
      const updated = await updateCsvFile(
        'data/questions.csv',
        headers,
        'ตอบคำถามจากหน้าเว็บไซต์',
        (rows) => {
          const index = rows.findIndex((item) => item.id === String(body.id || ''))
          if (index < 0) throw new Error('NOT_FOUND')
          rows[index] = {
            ...rows[index],
            answer,
            status: answer ? 'answered' : 'pending',
            is_published: session.role === 'admin'
              ? String(requestedPublish && Boolean(answer))
              : rows[index].is_published,
            answered_at: answer ? now : '',
            answered_by: answer ? session.sub : '',
            updated_at: now,
          }
          return rows[index]
        },
      )
      return sendJson(response, 200, {
        question: decorate([updated], session.userNames)[0],
      })
    }

    if (request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่ลบคำถามได้' })
      }
      await updateCsvFile(
        'data/questions.csv',
        headers,
        'ลบคำถามจากหน้าเว็บไซต์',
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
      return sendJson(response, 404, { error: 'ไม่พบคำถามที่ต้องการ' })
    }
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return sendJson(response, 413, { error: 'ข้อมูลมีขนาดใหญ่เกินไป' })
    }
    console.error('Questions API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับคำถามได้ในขณะนี้' })
  }
}
