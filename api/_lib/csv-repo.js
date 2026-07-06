import { parseCsv, stringifyCsv } from './csv.js'
import { readRepoFile, writeRepoFile } from './repo.js'

export async function updateCsvFile(path, headers, message, mutate, maxAttempts = 3) {
  let lastError

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const current = await readRepoFile(path)
    const rows = parseCsv(current.content)
    const result = mutate(rows)

    try {
      await writeRepoFile(path, stringifyCsv(rows, headers), message, current.sha)
      return result
    } catch (error) {
      lastError = error
      if (error.status !== 409 || attempt === maxAttempts - 1) throw error
    }
  }

  throw lastError
}
