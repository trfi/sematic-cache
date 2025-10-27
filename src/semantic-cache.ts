import { connect, Connection, Table } from '@lancedb/lancedb'
import { VoyageAIClient } from 'voyageai'

// LanceDB expects Record<string, unknown> for data
interface CacheRecord extends Record<string, unknown> {
  id: string
  text: string
  value: string
  vector: number[]
}

/**
 * Search result returned by the search() method
 * Contains detailed information about cache matches including similarity scores
 */
export interface SearchResult {
  /**
   * Unique identifier of the cached record
   */
  id: string

  /**
   * Original text that was used as the cache key
   */
  text: string

  /**
   * The cached value associated with the key
   */
  value: string

  /**
   * Cosine similarity score between the query and this record (0-1)
   * Higher values indicate better matches
   */
  similarity: number
}

export type StorageOptions = {
  /**
   * AWS Access Key ID
   * Can be set via AWS_ACCESS_KEY_ID environment variable
   */
  awsAccessKeyId?: string

  /**
   * AWS Secret Access Key
   * Can be set via AWS_SECRET_ACCESS_KEY environment variable
   */
  awsSecretAccessKey?: string

  /**
   * AWS Session Token (optional)
   * Can be set via AWS_SESSION_TOKEN environment variable
   */
  awsSessionToken?: string

  /**
   * AWS Region (required for S3-compatible stores)
   * Can be set via AWS_REGION environment variable
   * For Cloudflare R2, use "auto"
   */
  region?: string

  /**
   * Custom endpoint URL for S3-compatible storage
   * Can be set via S3_ENDPOINT environment variable
   * For Cloudflare R2: https://<account_id>.r2.cloudflarestorage.com
   */
  endpoint?: string

  /**
   * Allow HTTP connections (for local development)
   * Can be set via ALLOW_HTTP environment variable
   * @default false
   */
  allowHttp?: boolean

  /**
   * Request timeout
   * @default "30s"
   */
  timeout?: string

  /**
   * Connection timeout
   * @default "5s"
   */
  connectTimeout?: string
}

export type SemanticCacheConfig = {
  /**
   * A value between 0 and 1. If you set it to 1.0 then it acts like a hash map which means only exact lexical matches will be returned.
   * If you set it to 0.0 then it acts like a full text search query which means a value with the best proximity score (closest value) will be returned.
   * @default 0.9
   */
  minProximity?: number

  /**
   * VoyageAI API key for embeddings
   * Can be set via VOYAGE_API_KEY environment variable
   */
  voyageApiKey?: string

  /**
   * VoyageAI model to use for embeddings
   * Can be set via VOYAGE_MODEL environment variable
   * @default "voyage-2"
   */
  voyageModel?: string

  /**
   * LanceDB connection URI
   * Can be set via LANCEDB_URI environment variable
   * Supports local paths (./lancedb) and S3 URIs (s3://bucket/path)
   * @default "./lancedb"
   */
  dbUri?: string

  /**
   * Table name for the cache
   * Can be set via CACHE_TABLE_NAME environment variable
   * @default "semantic_cache"
   */
  tableName?: string

  /**
   * Optional namespace for the cache
   * Can be set via CACHE_NAMESPACE environment variable
   */
  namespace?: string

  /**
   * Storage options for S3 or S3-compatible storage
   * Required when using s3:// URIs
   */
  storageOptions?: StorageOptions
}

export class SemanticCache {
  private minProximity: number
  private voyageAI: VoyageAIClient
  private connection: Connection | null = null
  private table: Table | null = null
  private dbUri: string
  private tableName: string
  private namespace?: string
  private voyageModel: string
  private storageOptions?: StorageOptions

  constructor(config: SemanticCacheConfig = {}) {
    // Get configuration from config object or environment variables
    const apiKey = config.voyageApiKey || process.env.VOYAGE_API_KEY
    if (!apiKey) {
      throw new Error('VoyageAI API key is required. Set it via config.voyageApiKey or VOYAGE_API_KEY environment variable.')
    }

    this.minProximity = config.minProximity ?? (Number(process.env.CACHE_MIN_PROXIMITY) || 0.9)
    this.voyageAI = new VoyageAIClient({
      apiKey: apiKey
    })
    this.voyageModel = config.voyageModel || process.env.VOYAGE_MODEL || 'voyage-3.5-lite'
    this.dbUri = config.dbUri || process.env.LANCEDB_URI || './lancedb'

    const namespace = config.namespace || process.env.CACHE_NAMESPACE
    const tableName = config.tableName || process.env.CACHE_TABLE_NAME || 'semantic_cache'

    this.tableName = namespace
      ? `${tableName}_${namespace}`
      : tableName
    this.namespace = namespace

    // Configure storage options for S3/S3-compatible storage
    this.storageOptions = this.buildStorageOptions(config.storageOptions)
  }

  private buildStorageOptions(configOptions?: StorageOptions): StorageOptions | undefined {
    const options: StorageOptions = {
      awsAccessKeyId: configOptions?.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: configOptions?.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      awsSessionToken: configOptions?.awsSessionToken || process.env.AWS_SESSION_TOKEN,
      region: configOptions?.region || process.env.AWS_REGION,
      endpoint: configOptions?.endpoint || process.env.S3_ENDPOINT,
      allowHttp: configOptions?.allowHttp ?? (process.env.ALLOW_HTTP === 'true'),
      timeout: configOptions?.timeout,
      connectTimeout: configOptions?.connectTimeout
    }

    // Remove undefined values
    const cleanedOptions = Object.fromEntries(
      Object.entries(options).filter(([_, v]) => v !== undefined)
    ) as StorageOptions

    // Return undefined if no options are set (for local storage)
    return Object.keys(cleanedOptions).length > 0 ? cleanedOptions : undefined
  }

  private async initializeConnection(): Promise<void> {
    if (!this.connection) {
      if (this.storageOptions) {
        // Convert storage options to LanceDB format (all values as strings)
        const lancedbOptions: Record<string, string> = {}

        if (this.storageOptions.awsAccessKeyId) lancedbOptions.awsAccessKeyId = this.storageOptions.awsAccessKeyId
        if (this.storageOptions.awsSecretAccessKey) lancedbOptions.awsSecretAccessKey = this.storageOptions.awsSecretAccessKey
        if (this.storageOptions.awsSessionToken) lancedbOptions.awsSessionToken = this.storageOptions.awsSessionToken
        if (this.storageOptions.region) lancedbOptions.region = this.storageOptions.region
        if (this.storageOptions.endpoint) lancedbOptions.endpoint = this.storageOptions.endpoint
        if (this.storageOptions.timeout) lancedbOptions.timeout = this.storageOptions.timeout
        if (this.storageOptions.connectTimeout) lancedbOptions.connectTimeout = this.storageOptions.connectTimeout
        if (this.storageOptions.allowHttp !== undefined) lancedbOptions.allowHttp = String(this.storageOptions.allowHttp)

        this.connection = await connect(this.dbUri, { storageOptions: lancedbOptions })
      } else {
        this.connection = await connect(this.dbUri)
      }
    }
  }

  private async initializeTable(): Promise<void> {
    await this.initializeConnection()

    if (!this.table) {
      try {
        this.table = await this.connection!.openTable(this.tableName)
      } catch (error) {
        // Table doesn't exist, will be created on first write
        // LanceDB requires at least one record to create a table
      }
    }
  }

  private async ensureTableExists(firstRecord: CacheRecord): Promise<void> {
    if (!this.table) {
      // Create table with the first record
      this.table = await this.connection!.createTable(this.tableName, [firstRecord])
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.voyageAI.embed({
        input: text,
        model: this.voyageModel
      })

      if (response.data && response.data.length > 0 && response.data[0]?.embedding) {
        return response.data[0].embedding
      }
      throw new Error('No embedding returned from VoyageAI')
    } catch (error) {
      throw new Error(
        `Failed to get embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      const aVal = a[i]!
      const bVal = b[i]!
      dotProduct += aVal * bVal
      normA += aVal * aVal
      normB += bVal * bVal
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  async get(key: string): Promise<string | undefined>
  async get(keys: string[]): Promise<(string | undefined)[]>

  async get(keyOrKeys: string | string[]): Promise<string | undefined | (string | undefined)[]> {
    if (typeof keyOrKeys === 'string') {
      const result = await this.queryKey(keyOrKeys)
      return result
    }

    if (Array.isArray(keyOrKeys)) {
      // Multiple keys fetch
      const results = await Promise.all(keyOrKeys.map((key) => this.queryKey(key)))
      return results
    }
  }

  private async queryKey(key: string): Promise<string | undefined> {
    await this.initializeTable()

    if (!this.table) {
      return undefined
    }

    try {
      const queryEmbedding = await this.getEmbedding(key)

      // Get all records from the table using vectorSearch
      const allRecords = await this.table.vectorSearch(queryEmbedding).limit(1).toArray()

      if (allRecords.length > 0) {
        const record = allRecords[0] as CacheRecord

        // Convert record.vector to array if it's not already (handles Arrow Vector objects from LanceDB)
        const recordVector = Array.isArray(record.vector) ? record.vector : Array.from(record.vector) as number[]

        const similarity = this.cosineSimilarity(queryEmbedding, recordVector)

        if (similarity >= this.minProximity) {
          return record.value
        }
      }

      return undefined
    } catch (error) {
      console.error('Error querying key:', error)
      return undefined
    }
  }

  async set(key: string, value: string): Promise<void>
  async set(keys: string[], values: string[]): Promise<void>

  async set(keyOrKeys: string | string[], valueOrValues?: string | string[]): Promise<void> {
    await this.initializeTable()

    if (typeof keyOrKeys === 'string' && typeof valueOrValues === 'string') {
      const embedding = await this.getEmbedding(keyOrKeys)
      const record: CacheRecord = {
        id: keyOrKeys,
        text: keyOrKeys,
        value: valueOrValues,
        vector: embedding
      }

      await this.ensureTableExists(record)
      await this.table!.add([record])
    }

    if (Array.isArray(keyOrKeys) && Array.isArray(valueOrValues)) {
      const records: CacheRecord[] = []

      for (let i = 0; i < keyOrKeys.length; i++) {
        const key = keyOrKeys[i]!
        const value = valueOrValues[i]!
        const embedding = await this.getEmbedding(key)
        records.push({
          id: key,
          text: key,
          value: value,
          vector: embedding
        })
      }

      if (records.length > 0) {
        await this.ensureTableExists(records[0]!)
        await this.table!.add(records)
      }
    }
  }

  async delete(key: string): Promise<number> {
    await this.initializeTable()

    try {
      await this.table!.delete(`id = '${key}'`)
      return 1 // Assume successful deletion
    } catch (error) {
      console.error('Error deleting key:', error)
      return 0
    }
  }

  async bulkDelete(keys: string[]): Promise<number> {
    await this.initializeTable()

    try {
      let deletedCount = 0
      for (const key of keys) {
        await this.table!.delete(`id = '${key}'`)
        deletedCount++
      }
      return deletedCount
    } catch (error) {
      console.error('Error bulk deleting keys:', error)
      return 0
    }
  }

  async flush(): Promise<void> {
    await this.initializeTable()

    try {
      // Drop and recreate the table
      await this.connection!.dropTable(this.tableName)
      this.table = null
      await this.initializeTable()
    } catch (error) {
      console.error('Error flushing cache:', error)
    }
  }

  /**
   * Search for similar cache entries and return detailed results with similarity scores
   * This method does NOT filter by minProximity and is useful for debugging
   *
   * @param key - The query text to search for
   * @param limit - Maximum number of results to return (default: 5)
   * @returns Array of SearchResult objects sorted by similarity (highest first)
   *
   * @example
   * ```typescript
   * const results = await cache.search('What is the capital of France?', 3)
   * results.forEach(result => {
   *   console.log(`Text: ${result.text}`)
   *   console.log(`Value: ${result.value}`)
   *   console.log(`Similarity: ${result.similarity}`)
   * })
   * ```
   */
  async search(key: string, limit: number = 5): Promise<SearchResult[]> {
    await this.initializeTable()

    if (!this.table) {
      return []
    }

    try {
      const queryEmbedding = await this.getEmbedding(key)

      // Get top N records from the table using vectorSearch
      const allRecords = await this.table.vectorSearch(queryEmbedding).limit(limit).toArray()

      if (allRecords.length === 0) {
        return []
      }

      // Convert records to SearchResult with similarity scores
      const results: SearchResult[] = allRecords.map((record) => {
        const cacheRecord = record as CacheRecord

        // Convert record.vector to array if it's not already (handles Arrow Vector objects from LanceDB)
        const recordVector = Array.isArray(cacheRecord.vector)
          ? cacheRecord.vector
          : Array.from(cacheRecord.vector) as number[]

        const similarity = this.cosineSimilarity(queryEmbedding, recordVector)

        return {
          id: cacheRecord.id,
          text: cacheRecord.text,
          value: cacheRecord.value,
          similarity: similarity
        }
      })

      // Sort by similarity descending (highest first)
      results.sort((a, b) => b.similarity - a.similarity)

      return results
    } catch (error) {
      console.error('Error searching cache:', error)
      return []
    }
  }

  async close(): Promise<void> {
    // LanceDB connections are automatically managed
    this.connection = null
    this.table = null
  }
}
