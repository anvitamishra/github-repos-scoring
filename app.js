import { Octokit } from '@octokit/core'

const USER_TOKEN = process.env.USER_TOKEN
const LANGUAGE = process.env.LANGUAGE
const DATE = process.env.DATE

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: USER_TOKEN
})

const main = async() => {
  const queryString = encodeURIComponent(`input-quantity language:${LANGUAGE} created:=>${DATE}`)

  // https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-repositories
  const response = await octokit.request(`GET /search/repositories?q=${queryString}&per_page=10`, {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  const { data } = response

  console.log(data)
}
