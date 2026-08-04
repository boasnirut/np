import { randomUUID } from 'node:crypto'
import { canModifyRecord, requireActiveUser, withUserDisplayNames } from './access.js'
import { parseCsv, stringifyCsv } from './csv.js'
import { methodNotAllowed, readJsonBody, sendJson } from './http.js'
import {
  readRepoFile,
  RepositoryConfigError,
  writeRepoFile,
} from './repo.js'

const filePath = 'data/site-slides.csv'
const headers = [
  'id',
  'placement',
  'title',
  'alt_text',
  'image_url',
  'display_order',
  'status',
  'author',
  'created_at',
  'updated_at',
  'updated_by',
]
const placements = new Set(['welcome', 'billboard'])
const statuses = new Set(['published', 'draft'])

function cleanImageUrl(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (/^\/[A-Za-z0-9._~!$&'()+,;=:@%/-]+$/.test(text) && !text.includes('..')) return text
  try {
    const url = new URL(text)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function slideFields(body, existing = {}) {
  const placement = String(body.placement ?? existing.placement ?? '').trim()
  const title = String(body.title ?? existing.title ?? '').trim()
  return {
    placement,
    title,
    alt_text: String(body.alt_text ?? existing.alt_text ?? title).trim() || title,
    image_url: cleanImageUrl(body.image_url ?? existing.image_url ?? ''),
    display_order: String(body.display_order ?? existing.display_order ?? '').trim(),
    status: String(body.status ?? existing.status ?? 'published').trim(),
  }
}

function validate(item, response) {
  if (!placements.has(item.placement)) {
    sendJson(response, 400, { error: 'ตำแหน่งภาพหน้าเว็บไซต์ไม่ถูกต้อง' })
    return false
  }
  if (item.title.length < 2 || item.title.length > 120) {
    sendJson(response, 400, { error: 'ชื่อภาพต้องมีความยาว 2–120 ตัวอักษร' })
    return false
  }
  if (item.alt_text.length > 220) {
    sendJson(response, 400, { error: 'คำอธิบายภาพต้องมีความยาวไม่เกิน 220 ตัวอักษร' })
    return false
  }
  if (!item.image_url || item.image_url === null) {
    sendJson(response, 400, { error: 'กรุณาเลือกรูปภาพ JPG, PNG หรือ WebP' })
    return false
  }
  const order = Number(item.display_order)
  if (!Number.isInteger(order) || order < 1 || order > 999) {
    sendJson(response, 400, { error: 'ลำดับการแสดงต้องเป็นเลขจำนวนเต็มตั้งแต่ 1–999' })
    return false
  }
  if (!statuses.has(item.status)) {
    sendJson(response, 400, { error: 'สถานะภาพไม่ถูกต้อง' })
    return false
  }
  return true
}

function sortSlides(items) {
  return [...items].sort((left, right) => {
    const placementDifference = String(left.placement).localeCompare(String(right.placement))
    if (placementDifference) return placementDifference
    const orderDifference = Number(left.display_order || 0) - Number(right.display_order || 0)
    if (orderDifference) return orderDifference
    return String(left.created_at || '').localeCompare(String(right.created_at || ''))
  })
}

function nextOrder(items, placement) {
  return items
    .filter((item) => item.placement === placement)
    .reduce((maximum, item) => Math.max(maximum, Number(item.display_order) || 0), 0) + 1
}

export default async function handler(request, response) {
  try {
    const session = await requireActiveUser(request, response, { permission: 'slides' })
    if (!session) return undefined

    const current = await readRepoFile(filePath)
    const slides = parseCsv(current.content)

    if (request.method === 'GET') {
      return sendJson(response, 200, {
        slides: await withUserDisplayNames(sortSlides(slides), session.userNames),
      })
    }

    const body = await readJsonBody(request, 50_000)

    if (request.method === 'POST') {
      const fields = slideFields(body)
      if (!fields.display_order && placements.has(fields.placement)) {
        fields.display_order = String(nextOrder(slides, fields.placement))
      }
      if (!validate(fields, response)) return undefined

      const now = new Date().toISOString()
      const item = {
        id: randomUUID(),
        ...fields,
        author: session.sub,
        created_at: now,
        updated_at: now,
        updated_by: '',
      }
      slides.push(item)
      await writeRepoFile(
        filePath,
        stringifyCsv(slides, headers),
        `เพิ่มภาพหน้าเว็บไซต์: ${item.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([item], session.userNames)
      return sendJson(response, 201, { slide: responseItem })
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      const index = slides.findIndex((item) => item.id === String(body.id || ''))
      if (index < 0) return sendJson(response, 404, { error: 'ไม่พบภาพที่ต้องการจัดการ' })
      if (!canModifyRecord(session, slides[index])) {
        return sendJson(response, 403, { error: 'สมาชิกแก้ไขหรือลบได้เฉพาะภาพที่ตนเองสร้าง' })
      }

      if (request.method === 'DELETE') {
        const [removed] = slides.splice(index, 1)
        await writeRepoFile(
          filePath,
          stringifyCsv(slides, headers),
          `ลบภาพหน้าเว็บไซต์: ${removed.title}`,
          current.sha,
        )
        return sendJson(response, 200, { success: true })
      }

      const fields = slideFields(body, slides[index])
      if (session.role !== 'admin') fields.display_order = slides[index].display_order
      if (!validate(fields, response)) return undefined
      slides[index] = {
        ...slides[index],
        ...fields,
        updated_at: new Date().toISOString(),
        updated_by: session.sub,
      }
      await writeRepoFile(
        filePath,
        stringifyCsv(slides, headers),
        `แก้ไขภาพหน้าเว็บไซต์: ${fields.title}`,
        current.sha,
      )
      const [responseItem] = await withUserDisplayNames([slides[index]], session.userNames)
      return sendJson(response, 200, { slide: responseItem })
    }

    return methodNotAllowed(response, ['GET', 'POST', 'PUT', 'DELETE'])
  } catch (error) {
    if (error instanceof RepositoryConfigError) {
      return sendJson(response, 503, { error: 'ระบบยังไม่ได้เชื่อมต่อ GitHub' })
    }
    console.error('Site slides API error', error)
    return sendJson(response, 500, { error: 'ไม่สามารถจัดการภาพหน้าเว็บไซต์ได้ในขณะนี้' })
  }
}
