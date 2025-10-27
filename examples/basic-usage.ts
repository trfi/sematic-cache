import { SemanticCache } from '../src/index'

/**
 * Basic Usage Examples for Sematic Cache
 *
 * This file demonstrates common use cases for semantic caching
 * including basic retrieval, synonyms, complex queries, and bulk operations.
 */

async function runExamples() {
  // Initialize the cache
  // You can also use environment variables by calling: new SemanticCache()
  const cache = new SemanticCache({
    minProximity: 0.95,
    voyageApiKey: process.env.VOYAGE_API_KEY || 'your-api-key-here',
    voyageModel: 'voyage-3.5-lite', // Default model
    dbUri: './example-lancedb',
    tableName: 'example_cache'
  })

  console.log('🚀 Starting Sematic Cache examples...\n')

  try {
    // Example 1: Basic usage
    console.log('📝 Example 1: Basic semantic retrieval')
    await cache.set('Capital of France', 'Paris')
    await delay(1000)

    const result1 = await cache.get("What's the capital of France?")
    console.log(`Query: "What's the capital of France?" -> Result: ${result1}\n`)

    // Example 2: Synonyms
    console.log('🔄 Example 2: Handling synonyms')
    await cache.set('largest city in USA by population', 'New York')
    await delay(1000)

    const result2 = await cache.get('which is the most populated city in the USA?')
    console.log(`Query: "which is the most populated city in the USA?" -> Result: ${result2}\n`)

    // Example 3: Complex queries
    console.log('🧠 Example 3: Complex queries')
    await cache.set('year in which the Berlin wall fell', '1989')
    await delay(1000)

    const result3 = await cache.get("what's the year the Berlin wall destroyed?")
    console.log(`Query: "what's the year the Berlin wall destroyed?" -> Result: ${result3}\n`)

    // Example 4: Different contexts
    console.log('🎯 Example 4: Different contexts')
    await cache.set('the chemical formula for water', 'H2O')
    await cache.set('the healthiest drink on a hot day', 'water')
    await delay(1000)

    const result4a = await cache.get("what should i drink when it's hot outside?")
    const result4b = await cache.get("tell me water's chemical formula")
    console.log(`Query: "what should i drink when it's hot outside?" -> Result: ${result4a}`)
    console.log(`Query: "tell me water's chemical formula" -> Result: ${result4b}\n`)

    // Example 5: Bulk operations
    console.log('📦 Example 5: Bulk operations')
    await cache.set(['capital of Germany', 'capital of Italy'], ['Berlin', 'Rome'])
    await delay(1000)

    const results5 = await cache.get(["Germany's capital", "Italy's capital"])
    console.log(`Bulk query results: ${JSON.stringify(results5)}\n`)

    console.log('✅ All examples completed successfully!')
  } catch (error) {
    console.error('❌ Error running examples:', error)
  } finally {
    // Clean up
    await cache.close()
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error)
}

export { runExamples }
