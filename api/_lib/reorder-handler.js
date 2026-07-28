import { requireActiveUser } from './access.js'
import { parseCsv, stringifyCsv } from './csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './http.js'
import {
  readRepoFile,
  RepositoryConfigError,
  writeRepoFile,
} from './repo.js'

const resources = {
  news: {
    path: 'data/news.csv',
    groupFields: ['publish_date'],
    direction: 'desc',
    label: 'ข่าวสาร',
  },
  awards: {
    path: 'data/awards.csv',
    groupFields: ['award_date'],
    direction: 'desc',
    label: 'ผลงานและรางวัล',
  },
  newsletters: {
    path: 'data/newsletters.csv',
    groupFields: ['publish_date'],
    direction: 'desc',
    label: 'จดหมายข่าว',
  },
  quality: {
    path: 'data/quality-evidence.csv',
    groupFields: ['education_level', 'indicator_code'],
    direction: 'desc',
    label: 'เอกสารหลักฐาน สมศ.',
  },
  sar: {
    path: 'data/sar.csv',
    groupFields: [],
    direction: 'desc',
    label: 'รายงาน SAR',
  },
  documents: {
    path: 'data/school-documents.csv',
    groupFields: ['publish_date'],
    direction: 'desc',
    label: 'เอกสารและแบบคำร้อง',
  },
  slides: {
    path: 'data/site-slides.csv',
    groupFields: ['placement'],
    direction: 'asc',
    label: 'ภาพหน้าเว็บไซต์',
  },
  staff: {
    path: 'data/staff.csv',
    groupFields: ['staff_type'],
    direction: 'asc',
    label: 'ข้อมูลบุคลากร',
  },
}

function groupKey(item, fields) {
  return fields.length
    ? fields.map((field) => String(item[field] || '').trim()).join('\u001f')
    : '__all__'
}

function csvHeaders(content) {
  return String(content || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/, 1)[0]
    .split(',')
    .map((header) => header.trim())
    .filter(Boolean)
}

export default async function reorderHandler(request, response) {
  try {
    if (request.method !== 'POST') return methodNotAllowed(response, ['POST'])

    const session = await requireActiveUser(request, response, { adminOnly: true })
    if (!session) return undefined

    const body = await readJsonBody(request, 100_000)
    const resourceId = String(body.resource || '').trim()
    const resource = resources[resourceId]
    if (!resource) return sendJson(response, 400, { error: 'ส่วนข้อมูลสำหรับจัดลำดับไม่ถูกต้อง' })

    const orderedIds = Array.isArray(body.orderedIds)
      ? body.orderedIds.map((id) => String(id || '').trim()).filter(Boolean)
      : []
    if (!orderedIds.length || new Set(orderedIds).size !== orderedIds.length) {
      return sendJson(response, 400, { error: 'ลำดับรายการไม่ถูกต้อง' })
    }

    const current = await readRepoFile(resource.path)
    const rows = parseCsv(current.content)
    const currentIds = new Set(rows.map((item) => item.id))
    if (
      orderedIds.length !== rows.length
      || orderedIds.some((id) => !currentIds.has(id))
    ) {
      return sendJson(response, 409, {
        error: 'ข้อมูลมีการเปลี่ยนแปลงระหว่างจัดลำดับ กรุณารีเฟรชหน้าแล้วลองใหม่',
      })
    }

    const rowById = new Map(rows.map((item) => [item.id, item]))
    const groupedRows = new Map()
    orderedIds.forEach((id) => {
      const row = rowById.get(id)
      const key = groupKey(row, resource.groupFields)
      const group = groupedRows.get(key) || []
      group.push(row)
      groupedRows.set(key, group)
    })

    groupedRows.forEach((group) => {
      group.forEach((item, index) => {
        item.display_order = String(
          resource.direction === 'asc' ? index + 1 : group.length - index,
        )
      })
    })

    await writeRepoFile(
      resource.path,
      stringifyCsv(rows, csvHeaders(current.content)),
      `จัดลำดับการแสดง${resource.label}`,
      current.sha,
    )

    return sendJson(response, 200, {
      success: true,
      orders: Object.fromEntries(rows.map((item) => [item.id, item.display_order])),
    })
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    console.error('Reorder API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถบันทึกลำดับการแสดงได้ในขณะนี้' })
  }
}
