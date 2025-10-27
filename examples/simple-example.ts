import { SemanticCache } from '../src/index'

/**
 * Simple Example for Sematic Cache
 *
 * This is a minimal example showing basic setup and usage.
 * For more advanced examples, see basic-usage.ts or cloudflare-r2-example.ts
 */

async function runExample() {
  console.log('🚀 Sematic Cache Simple Example\n')

  // Option 1: Using environment variables (recommended)
  // Just set VOYAGE_API_KEY in your .env file and call: new SemanticCache()

  // Option 2: Explicit configuration
  const cache = new SemanticCache({
    minProximity: 0.9,
    voyageApiKey: process.env.VOYAGE_API_KEY || 'your-voyage-api-key-here',
    voyageModel: 'voyage-3.5-lite', // Fast and cost-effective
    dbUri: './example-cache',
    tableName: 'test_cache'
  })

  try {
    console.log('Setting cache entries...')

    // Set some example data
    await cache.set('Capital of France', 'Paris')
    await cache.set('Largest planet in solar system', 'Jupiter')
    await cache.set('Author of Romeo and Juliet', 'William Shakespeare')

    // Wait a moment for indexing
    console.log('Waiting for indexing...')
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log('Querying cache...')

    // Query with similar but different phrasing
    const result1 = await cache.get('What is the capital of France?')
    console.log(`Q: "What is the capital of France?" A: ${result1}`)

    const result2 = await cache.get('Which is the biggest planet?')
    console.log(`Q: "Which is the biggest planet?" A: ${result2}`)

    const result3 = await cache.get('Who wrote Romeo and Juliet?')
    console.log(`Q: "Who wrote Romeo and Juliet?" A: ${result3}`)

    // Test a query that should not match
    const result4 = await cache.get('What is the weather today?')
    console.log(`Q: "What is the weather today?" A: ${result4 || 'No match found'}`)

    console.log('✅ Example completed successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await cache.close()
  }
}

// Run the example
if (require.main === module) {
  runExample().catch(console.error)
}

export { runExample }
