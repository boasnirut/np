import { readFile } from 'node:fs/promises'

const owner = process.env.GITHUB_OWNER || 'boasnirut'
const repository = process.env.GITHUB_REPO || 'np'
const branch = process.env.GITHUB_BRANCH || 'main'

export class RepositoryConfigError extends Error {
  constructor() {
    super('GitHub write access is not configured')
    this.code = 'GITHUB_NOT_CONFIGURED'
  }
}

async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = new Error(`GitHub API ${response.status}`)
    error.status = response.status
    error.details = await response.text()
    throw error
  }
  return response.json()
}

async function readBundledFile(path) {
  const fileUrl = new URL(`../../${path}`, import.meta.url)
  return readFile(fileUrl, 'utf8')
}

export async function readRepoFile(path) {
  if (!process.env.GITHUB_TOKEN) {
    return { content: await readBundledFile(path), sha: null }
  }

  const data = await githubRequest(`/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`)
  return {
    content: Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8'),
    sha: data.sha,
  }
}

export async function writeRepoFile(path, content, message, sha) {
  if (!process.env.GITHUB_TOKEN) throw new RepositoryConfigError()

  return githubRequest(`/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    }),
  })
}

export async function writeBinaryRepoFile(path, bytes, message) {
  if (!process.env.GITHUB_TOKEN) throw new RepositoryConfigError()

  return githubRequest(`/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(bytes).toString('base64'),
      branch,
    }),
  })
}

export async function deleteRepoFile(path, message) {
  if (!process.env.GITHUB_TOKEN) throw new RepositoryConfigError()
  const current = await githubRequest(
    `/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`,
  )
  return githubRequest(`/contents/${encodeURI(path)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      sha: current.sha,
      branch,
    }),
  })
}

export function rawGithubUrl(path) {
  return `https://raw.githubusercontent.com/${owner}/${repository}/${branch}/${path}`
}

export function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN)
}
