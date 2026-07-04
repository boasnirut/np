import { randomUUID } from 'node:crypto'
import { requireActiveUser, withUserDisplayNames } from './_lib/access.js'
import { parseCsv, stringifyCsv } from './_lib/csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './_lib/http.js'
import { readRepoFile, writeRepoFile } from './_lib/repo.js'

const headers = [
  'id',
  'title',
  'event_date',
  'start_time',
  'location',
  'details',
  'status',
  'author',
  'created_at',
  'updated_at',
  'updated_by',
]

function fields(body, existing = {}) {
  return {
    title: String(body.title ?? existing.title ?? '').trim(),
    event_date: String(body.event_date ?? existing.event_date ?? '').trim(),
    start_time: String(body.start_time ?? existing.start_time ?? '').trim(),
    location: String(body.location ?? existing.location ?? '').trim(),
    details: String(body.details ?? existing.details ?? '').trim(),
    status: (body.status ?? existing.status) === 'draft' ? 'draft' : 'published',
  }
}

function validate(item, response) {
  if (item.title.length < 3 || item.title.length > 180 || !/^\d{4}-\d{2}-\d{2}$/.test(item.event_date)) {
    sendJson(response, 400, { error: 'กรุณากรอกชื่อและวันที่กิจกรรมให้ถูกต้อง' })
    return false
  }
  return true
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'events' })
    if (!session) return undefined
    const current = await readRepoFile('data/events.csv')
    const events = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        events: await withUserDisplayNames(
          events.sort((left, right) => right.event_date.localeCompare(left.event_date)),
          session.userNames,
        ),
      })
    }

    const body = await readJsonBody(request, 100_000)
    if (request.method === 'POST') {
      const itemFields = fields(body)
      if (!validate(itemFields, response)) return undefined
      const now = new Date().toISOString()
      const item = {
        id: randomUUID(),
        ...itemFields,
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }
      events.push(item)
      await writeRepoFile(
        'data/events.csv',
        stringifyCsv(events, headers),
        `เพิ่มกิจกรรม: ${item.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([item], session.userNames)
      return sendJson(response, 201, { event: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (session.role !== 'admin') {
        return sendJson(response, 403, { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหรือลบรายการได้' })
      }
      const index = events.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบกิจกรรมที่ต้องการ' })
      if (request.method === 'DELETE') {
        const [removed] = events.splice(index, 1)
        await writeRepoFile(
          'data/events.csv',
          stringifyCsv(events, headers),
          `ลบกิจกรรม: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }
      const itemFields = fields(body, events[index])
      if (!validate(itemFields, response)) return undefined
      events[index] = {
        ...events[index],
        ...itemFields,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }
      await writeRepoFile(
        'data/events.csv',
        stringifyCsv(events, headers),
        `แก้ไขกิจกรรม: ${itemFields.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([events[index]], session.userNames)
      return sendJson(response, 200, { event: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    console.error('Events API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถดำเนินการกับกิจกรรมได้ในขณะนี้' })
  }
}
