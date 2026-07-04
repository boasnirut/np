export function cleanExternalUrl(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''

  try {
    const url = new URL(text)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function displayOrder(item) {
  const value = Number(item.display_order)
  return Number.isFinite(value) ? value : 0
}

export function nextDisplayOrder(items) {
  return items.reduce((maximum, item) => Math.max(maximum, displayOrder(item)), 0) + 1
}

export function contentDate(item, dateField) {
  const date = String(item?.[dateField] || '').trim()
  if (date) return date.slice(0, 10)
  return String(item?.created_at || '').slice(0, 10)
}

export function nextDisplayOrderForDate(items, dateField, dateValue) {
  const targetDate = String(dateValue || '').slice(0, 10)
  return items
    .filter((item) => contentDate(item, dateField) === targetDate)
    .reduce((maximum, item) => Math.max(maximum, displayOrder(item)), 0) + 1
}

export function sortByDateAndDisplayOrder(items, dateField) {
  return [...items].sort((left, right) => {
    const dateDifference = contentDate(right, dateField).localeCompare(contentDate(left, dateField))
    if (dateDifference) return dateDifference
    const orderDifference = displayOrder(right) - displayOrder(left)
    if (orderDifference) return orderDifference
    return String(right.created_at || '').localeCompare(String(left.created_at || ''))
  })
}

export function sortByDisplayOrder(items) {
  return [...items].sort((left, right) => {
    const orderDifference = displayOrder(right) - displayOrder(left)
    if (orderDifference) return orderDifference
    return String(right.created_at || '').localeCompare(String(left.created_at || ''))
  })
}

export function evidenceDocumentUrls(item) {
  return [
    item.document_url,
    item.document_url_2,
    item.document_url_3,
    item.document_url_4,
    item.document_url_5,
  ].map((url) => String(url || '').trim()).filter(Boolean)
}
