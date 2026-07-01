import { parseCsv } from './_lib/csv.js'
import { methodNotAllowed } from './_lib/http.js'
import { readRepoFile } from './_lib/repo.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET'])
  try {
    const [newsFile, eventsFile, awardsFile] = await Promise.all([
      readRepoFile('data/news.csv'),
      readRepoFile('data/events.csv'),
      readRepoFile('data/awards.csv'),
    ])
    const published = (rows) => rows.filter((item) => item.status === 'published')
    const body = {
      news: published(parseCsv(newsFile.content)).sort((left, right) =>
        right.created_at.localeCompare(left.created_at),
      ),
      events: published(parseCsv(eventsFile.content)).sort((left, right) =>
        left.event_date.localeCompare(right.event_date),
      ),
      awards: published(parseCsv(awardsFile.content)).sort((left, right) =>
        right.award_date.localeCompare(left.award_date),
      ),
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
