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

test('Should calculate a popularity score', async t => {
    const maxValues = await getMaxValues(repositories)
    const results = await Promise.all(repositories.map(repo => scoringAlgorithm(repo, maxValues)))

    t.true(results.every(repo => repo.popularityScore >= 0 && repo.popularityScore <= 1), 'Final score should be between 0 and 1')
  })
