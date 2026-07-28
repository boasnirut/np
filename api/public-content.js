import { parseCsv } from './_lib/csv.js'
import {
  contentAttachmentUrls,
  evidenceDocumentNames,
  evidenceDocumentTypes,
  evidenceDocumentUrls,
  sortByDateAndDisplayOrder,
  sortByDisplayOrder,
} from './_lib/content.js'
import { methodNotAllowed } from './_lib/http.js'
import { resolveEvidenceMimeTypes } from './_lib/external-file.js'
import { readRepoFile } from './_lib/repo.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET'])
  try {
    const [
      newsFile,
      eventsFile,
      awardsFile,
      newslettersFile,
      qualityFile,
      documentsFile,
      questionsFile,
      siteSlidesFile,
      staffFile,
      sarFile,
    ] = await Promise.all([
      readRepoFile('data/news.csv'),
      readRepoFile('data/events.csv'),
      readRepoFile('data/awards.csv'),
      readRepoFile('data/newsletters.csv'),
      readRepoFile('data/quality-evidence.csv'),
      readRepoFile('data/school-documents.csv'),
      readRepoFile('data/questions.csv'),
      readRepoFile('data/site-slides.csv'),
      readRepoFile('data/staff.csv'),
      readRepoFile('data/sar.csv'),
    ])
    const published = (rows) => rows.filter((item) => item.status === 'published')
    const siteSlides = parseCsv(siteSlidesFile.content)
    const sortSiteSlides = (rows) => [...rows].sort((left, right) => {
      const placementDifference = String(left.placement).localeCompare(String(right.placement))
      if (placementDifference) return placementDifference
      const orderDifference = Number(left.display_order || 0) - Number(right.display_order || 0)
      if (orderDifference) return orderDifference
      return String(left.created_at || '').localeCompare(String(right.created_at || ''))
    })
    const staffTypeOrder = { director: 0, teacher: 1, support: 2 }
    const sortStaff = (rows) => [...rows].sort((left, right) => {
      const typeDifference = (staffTypeOrder[left.staff_type] ?? 99)
        - (staffTypeOrder[right.staff_type] ?? 99)
      if (typeDifference) return typeDifference
      const orderDifference = Number(left.display_order || 0) - Number(right.display_order || 0)
      if (orderDifference) return orderDifference
      return String(left.created_at || '').localeCompare(String(right.created_at || ''))
    })
    const qualityEvidence = await Promise.all(
      sortByDisplayOrder(published(parseCsv(qualityFile.content))).map(async (item) => {
        const documentUrls = evidenceDocumentUrls(item)
        const documentTypes = evidenceDocumentTypes(item)
        return {
          ...item,
          document_urls: documentUrls,
          document_types: await resolveEvidenceMimeTypes(documentUrls, documentTypes),
          document_names: evidenceDocumentNames(item),
        }
      }),
    )
    const body = {
      news: sortByDateAndDisplayOrder(published(parseCsv(newsFile.content)), 'publish_date')
        .map((item) => ({ ...item, document_urls: contentAttachmentUrls(item) })),
      events: published(parseCsv(eventsFile.content))
        .sort((left, right) => right.event_date.localeCompare(left.event_date))
        .map((item) => ({ ...item, document_urls: contentAttachmentUrls(item) })),
      awards: sortByDateAndDisplayOrder(published(parseCsv(awardsFile.content)), 'award_date')
        .map((item) => ({ ...item, document_urls: contentAttachmentUrls(item) })),
      newsletters: sortByDateAndDisplayOrder(
        published(parseCsv(newslettersFile.content)),
        'publish_date',
      ).map((item) => ({ ...item, document_urls: contentAttachmentUrls(item) })),
      qualityEvidence,
      documents: sortByDateAndDisplayOrder(
        published(parseCsv(documentsFile.content)),
        'publish_date',
      ).map((item) => ({ ...item, document_urls: contentAttachmentUrls(item) })),
      questions: parseCsv(questionsFile.content)
        .filter((item) => item.status === 'answered' && item.is_published === 'true')
        .sort((left, right) => String(right.answered_at).localeCompare(String(left.answered_at)))
        .map((item) => ({
          id: item.id,
          name: item.name,
          question: item.question,
          answer: item.answer,
          answered_at: item.answered_at,
        })),
      siteSlides: sortSiteSlides(published(siteSlides)).map((item) => ({
        id: item.id,
        placement: item.placement,
        title: item.title,
        alt_text: item.alt_text,
        image_url: item.image_url,
        display_order: item.display_order,
      })),
      siteSlidePlacements: ['welcome', 'billboard'],
      staff: sortStaff(published(parseCsv(staffFile.content))).map((item) => ({
        id: item.id,
        staff_type: item.staff_type,
        name: item.name,
        position: item.position,
        image_url: item.image_url,
        website_url: item.website_url,
        display_order: item.display_order,
      })),
      staffConfigured: true,
      sarDocuments: sortByDisplayOrder(published(parseCsv(sarFile.content))),
    }
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=180')
    response.end(JSON.stringify(body))
  } catch (error) {
    console.error('Public content API error', error)
    response.statusCode = 500
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'ไม่สามารถโหลดข้อมูลเว็บไซต์ได้' }))
  }
}
