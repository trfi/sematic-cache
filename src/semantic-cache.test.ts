import { SemanticCache } from './semantic-cache'
import { mock, describe, beforeEach, afterEach, test, expect } from 'bun:test'

/**
 * Unit Tests for SemanticCache
 *
 * Note: These tests use mocked dependencies (VoyageAI and LanceDB).
 * For integration tests with real APIs, set up actual credentials.
 */

// Mock VoyageAI
mock.module('voyageai', () => ({
  VoyageAIClient: class {
    constructor() {}
    async embed() {
      return Promise.resolve({
        data: [
          {
            embedding: new Array(1024).fill(0).map(() => Math.random())
          }
        ]
      })
    }
  }
}))

// Mock LanceDB
// @ts-ignore
mock.module('@lancedb/lancedb', () => ({
  connect: (uri: string, options?: any) =>
    Promise.resolve({
      openTable: () => Promise.reject(new Error('Table does not exist')),
      createTable: () =>
        Promise.resolve({
          add: () => Promise.resolve(undefined),
          vectorSearch: () => ({
            limit: () => ({
              toArray: () => Promise.resolve([])
            })
          }),
          delete: () => Promise.resolve(undefined)
        }),
      dropTable: () => Promise.resolve(undefined)
    })
}))

const PROXIMITY_THRESHOLD = 0.9

describe('SemanticCache', () => {
  let cache: SemanticCache

  beforeEach(() => {
    cache = new SemanticCache({
      minProximity: PROXIMITY_THRESHOLD,
      voyageApiKey: 'test-api-key',
      voyageModel: 'voyage-3.5-lite',
      dbUri: './test-lancedb',
      tableName: 'test_cache'
    })
  })

  afterEach(async () => {
    await cache.flush()
    await cache.close()
  })

  test('should create SemanticCache instance', () => {
    expect(cache).toBeInstanceOf(SemanticCache)
  })

  test('should handle set operation', async () => {
    await cache.set('test key', 'test value')
    // No error means success
    expect(true).toBe(true)
  })

  test('should handle get operation', async () => {
    const result = await cache.get('test key')
    expect(result).toBeUndefined() // Since we're mocking empty search results
  })

  test('should handle bulk operations', async () => {
    const keys = ['key1', 'key2']
    const values = ['value1', 'value2']

    await cache.set(keys, values)

    const results = await cache.get(keys)
    expect(Array.isArray(results)).toBe(true)
    expect(results).toHaveLength(2)
  })

  test('should handle delete operation', async () => {
    const result = await cache.delete('test key')
    expect(typeof result).toBe('number')
  })

  test('should handle bulk delete operation', async () => {
    const keys = ['key1', 'key2']
    const result = await cache.bulkDelete(keys)
    expect(typeof result).toBe('number')
  })

  test('should handle flush operation', async () => {
    await cache.flush()
    // No error means success
    expect(true).toBe(true)
  })

  test('should work with namespaces', () => {
    const namespacedCache = new SemanticCache({
      minProximity: PROXIMITY_THRESHOLD,
      voyageApiKey: 'test-api-key',
      namespace: 'test-namespace'
    })

    expect(namespacedCache).toBeInstanceOf(SemanticCache)
  })

  test('should support S3 storage options', () => {
    const s3Cache = new SemanticCache({
      minProximity: PROXIMITY_THRESHOLD,
      voyageApiKey: 'test-api-key',
      dbUri: 's3://test-bucket/cache-data',
      storageOptions: {
        awsAccessKeyId: 'test-key',
        awsSecretAccessKey: 'test-secret',
        region: 'us-east-1'
      }
    })

    expect(s3Cache).toBeInstanceOf(SemanticCache)
  })

  test('should support Cloudflare R2 storage options', () => {
    const r2Cache = new SemanticCache({
      minProximity: PROXIMITY_THRESHOLD,
      voyageApiKey: 'test-api-key',
      dbUri: 's3://r2-bucket/cache-data',
      storageOptions: {
        awsAccessKeyId: 'r2-key',
        awsSecretAccessKey: 'r2-secret',
        region: 'auto',
        endpoint: 'https://account-id.r2.cloudflarestorage.com'
      }
    })

    expect(r2Cache).toBeInstanceOf(SemanticCache)
  })

  test('should initialize with environment variables', () => {
    // Set environment variables
    process.env.VOYAGE_API_KEY = 'env-test-key'
    process.env.LANCEDB_URI = './env-test-db'
    process.env.CACHE_MIN_PROXIMITY = '0.95'

    const envCache = new SemanticCache()

    expect(envCache).toBeInstanceOf(SemanticCache)

    // Clean up
    delete process.env.VOYAGE_API_KEY
    delete process.env.LANCEDB_URI
    delete process.env.CACHE_MIN_PROXIMITY
  })

  test('should throw error when API key is missing', () => {
    expect(() => {
      new SemanticCache({
        minProximity: PROXIMITY_THRESHOLD
        // No voyageApiKey provided and no env variable
      })
    }).toThrow('VoyageAI API key is required')
  })
})
