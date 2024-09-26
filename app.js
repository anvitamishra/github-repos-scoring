import { Octokit } from '@octokit/rest'
import { throttling } from '@octokit/plugin-throttling'

import pLimit from 'p-limit'

const USER_TOKEN = process.env.USER_TOKEN || 'user-token'
const LANGUAGE = process.env.LANGUAGE || 'Javascript'
const DATE = process.env.DATE || '2023-01-01'

let MAX_STARS = Number.MIN_SAFE_INTEGER
let MAX_FORKS = Number.MIN_SAFE_INTEGER
let MAX_DAYS_SINCE_UPDATE = 0 // No need for minimum here

const limit = pLimit(10)

const OctokitWithPlugin = Octokit.plugin(throttling)

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new OctokitWithPlugin({
  auth: USER_TOKEN,
  headers: {
    'X-GitHub-Api-Version': '2022-11-28'
  },
  throttle: {
    onRateLimit: (retryAfter, options) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`,
      )

      // Retry twice after hitting a rate limit error, then give up
      if (options.request.retryCount <= 2) {
        console.log(`Retrying after ${retryAfter} seconds!`)
        return true
      }
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `Secondary quota detected for request ${options.method} ${options.url}`,
      )
    },
  },
})

/**
 * Gets all the pages of the repositories from the GitHub API based on
 *   a language and date query.
 */
const getRepositories = async() => {
  const queryString = `language:${LANGUAGE} created:>=${DATE}`

  let allRepositories = []

  for await (const response of octokit.paginate.iterator(octokit.rest.search.repos,
    {
      q: queryString,
      // if we get a higher number, we can avoid bombarding the GitHub API with requests
      per_page: 100
    }
  )) {
    const { data } = response
    const repositories = data.map(item => ({
      id: item.id,
      name: item.name,
      language: item.language,
      created_at: item.created_at,
      stargazers_count: item.stargazers_count,
      forks: item.forks,
      updated_at: item.updated_at,
    }))

    allRepositories = allRepositories.concat(repositories)
  }
  return allRepositories
}

/**
 * Updates the max values for stars, forks, and days since last update
 *   across all repositories.
 * [ ChatGPT suggested that I use these to normalize the data. ]
 */
const getMaxValues = async(repositories) => {

  for (const repo of repositories) {
    const { stargazers_count: stars, forks } = repo

    const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24))

    MAX_STARS = Math.max(MAX_STARS, stars)
    MAX_FORKS = Math.max(MAX_FORKS, forks)
    MAX_DAYS_SINCE_UPDATE = Math.max(MAX_DAYS_SINCE_UPDATE, daysSinceUpdate)
  }

  return { maxStars: MAX_STARS, maxForks: MAX_FORKS, maxDaysSinceUpdate: MAX_DAYS_SINCE_UPDATE }
}

/**
 * Computes the popularity score for a repository based on the max values
 *   for stars, forks, and days since last update.
 * [ Asked ChatGPT to give me a method for score calculation and refactored that ]
 */
const scoringAlgorithm = async(repository, { maxStars, maxForks, maxDaysSinceUpdate }) => {
  const today = Date.now()
  const factors = ['stargazers_count', 'forks', 'updated_at']

  const popularityScore = factors.reduce((score, factor) => {
    const weight = 1 / factors.length
    let value = repository[factor]

    let normalized
    switch (factor) {
      case 'updated_at':
        const daysSinceLastUpdate = Math.floor((today - new Date(value).getTime()) / (1000 * 60 * 60 * 24))
        normalized = 1 - (daysSinceLastUpdate / maxDaysSinceUpdate)
        break
      case 'forks':
        normalized = value / Math.max(maxForks, 1)
        break
      case 'stargazers_count':
        normalized = value / Math.max(maxStars, 1)
        break
    }

    score += normalized * weight
    return score
  }, 0)

  const result = {
    name: repository.name,
    popularityScore: popularityScore.toFixed(3)
  }

  return result
}

// [ Asked ChatGPT to give me a function for batch processing ]
const processInBatches = async (repositories, maxValues, batchSize = 100) => {
  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize)

    const popularityScores = await Promise.all(
      batch.map(repo => limit(() => scoringAlgorithm(repo, maxValues)))
    )

    popularityScores.forEach(score => console.log(score))
  }
}

/**
 * Outputs the popularity scores for all the repositories.
 */
const main = async () => {
  console.log('Fetching repositories...')
  const repositories = await getRepositories()

  console.log('Calculating max values...')
  const maxValues = await getMaxValues(repositories)

  console.log('Processing repositories...')
  await processInBatches(repositories, maxValues, 50)
}

// Rough estimation of how long the whole thing takes
// to make performance improvements
const startTime = performance.now()
await main()
const endTime = performance.now()

console.log('Total time taken:', (endTime - startTime) / 1000, 'seconds')

export {
  getMaxValues,
  scoringAlgorithm,
  getRepositories
}
