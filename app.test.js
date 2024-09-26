import test from 'ava'

import { scoringAlgorithm, getMaxValues } from './app.js'

const repositories = [
  {
    id: 787368172,
    name: 'garageflipper',
    language: 'Dart',
    created_at: '2024-04-16T11:48:36Z',
    stargazers_count: 5,
    forks: 7,
    updated_at: '2024-04-16T11:56:50Z'
  },
  {
    id: 811166938,
    name: 'QR-Inventory-Tracke',
    language: 'Dart',
    created_at: '2024-06-06T04:24:27Z',
    stargazers_count: 1000,
    forks: 99,
    updated_at: '2024-06-06T04:31:03Z'
  },
  {
    id: 856009755,
    name: 'fzbill',
    language: 'Dart',
    created_at: '2024-09-11T20:37:13Z',
    stargazers_count: 10,
    forks: 18,
    updated_at: '2024-09-11T20:37:27Z'
  },
  {
    id: 641518970,
    name: 'assessment-prob1',
    language: 'Dart',
    created_at: '2023-05-16T16:30:50Z',
    stargazers_count: 0,
    forks: 0,
    updated_at: '2023-05-16T16:43:13Z'
  },
  {
    id: 652503391,
    name: 'csv_order_analytics',
    language: 'Dart',
    created_at: '2023-06-12T07:53:40Z',
    stargazers_count: 1,
    forks: 1,
    updated_at: '2023-07-12T12:57:22Z'
  }
]

test('getMaxValues() should return the maximum values for stars, forks, and daysSinceUpdate', async (t) => {
  const results = await getMaxValues(repositories)

  const date = repositories[3].updated_at // oldest date
  const expectedDaysSinceUpdate = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))

  t.is(results.maxStars, 1000)
  t.is(results.maxForks, 99)
  t.is(results.maxDaysSinceUpdate, expectedDaysSinceUpdate)
})

test('scoringAlgorithm() should calculate a popularity score', async t => {
  const maxValues = await getMaxValues(repositories)
  const results = await Promise.all(repositories.map(repo => scoringAlgorithm(repo, maxValues)))

  t.true(results.every(repo => repo.popularityScore >= 0 && repo.popularityScore <= 1), 'Final score should be between 0 and 1')

  t.is(results[0].popularityScore, '0.249')
  t.is(results[1].popularityScore, '0.925')
  t.is(results[2].popularityScore, '0.388')
  t.is(results[3].popularityScore, '0.000')
  t.is(results[4].popularityScore, '0.041')
})
