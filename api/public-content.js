import { parseCsv } from './_lib/csv.js'
import {
  contentAttachmentUrls,
  evidenceDocumentTypes,
  evidenceDocumentUrls,
  sortByDateAndDisplayOrder,
  sortByDisplayOrder,
} from './_lib/content.js'
import { methodNotAllowed } from './_lib/http.js'
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
    ] = await Promise.all([
      readRepoFile('data/news.csv'),
      readRepoFile('data/events.csv'),
      readRepoFile('data/awards.csv'),
      readRepoFile('data/newsletters.csv'),
      readRepoFile('data/quality-evidence.csv'),
      readRepoFile('data/school-documents.csv'),
      readRepoFile('data/questions.csv'),
    ])
    const published = (rows) => rows.filter((item) => item.status === 'published')
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
      qualityEvidence: sortByDisplayOrder(published(parseCsv(qualityFile.content))).map((item) => ({
        ...item,
        document_urls: evidenceDocumentUrls(item),
        document_types: evidenceDocumentTypes(item),
      })),
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
