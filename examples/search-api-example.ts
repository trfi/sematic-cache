/**
 * Example: Using the search() API for debugging
 *
 * This example demonstrates how to use the search() method to:
 * - View similarity scores for different queries
 * - Understand why certain queries don't match
 * - Debug cache behavior
 * - Find the optimal minProximity threshold
 */

import { SemanticCache } from '../src/index'

async function main() {
  console.log('🔍 Search API Debug Example\n')

  const cache = new SemanticCache({
    minProximity: 0.9,  // Regular cache uses 0.9 threshold
    namespace: `search-example-${Date.now()}`
  })

  try {
    // Populate the cache with some data
    console.log('📝 Populating cache with sample data...')
    await cache.set('What is the capital of France?', 'Paris')
    await cache.set('How do I cook pasta?', 'Boil water, add pasta, cook for 8-10 minutes')
    await cache.set('Best practices for TypeScript', 'Use strict mode, enable type checking, avoid any type')
    await cache.set('What is machine learning?', 'A subset of AI that learns from data')
    console.log('✓ Cache populated\n')

    // Wait a bit for indexing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Example 1: Search with exact match
    console.log('━━━ Example 1: Exact Match ━━━')
    console.log('Query: "What is the capital of France?"')
    let results = await cache.search('What is the capital of France?', 3)
    console.log('Top 3 results:')
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. Similarity: ${result.similarity.toFixed(4)} | Text: "${result.text}"`)
      console.log(`     Value: "${result.value}"`)
    })
    console.log()

    // Example 2: Search with similar phrasing
    console.log('━━━ Example 2: Similar Phrasing ━━━')
    console.log('Query: "What is France\'s capital city?"')
    results = await cache.search('What is France\'s capital city?', 3)
    console.log('Top 3 results:')
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. Similarity: ${result.similarity.toFixed(4)} | Text: "${result.text}"`)
      console.log(`     Value: "${result.value}"`)
    })
    console.log()

    // Example 3: Search with different topic
    console.log('━━━ Example 3: Different Topic ━━━')
    console.log('Query: "How to make spaghetti?"')
    results = await cache.search('How to make spaghetti?', 3)
    console.log('Top 3 results:')
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. Similarity: ${result.similarity.toFixed(4)} | Text: "${result.text}"`)
      console.log(`     Value: "${result.value}"`)
    })
    console.log()

    // Example 4: Understanding why a query doesn't match
    console.log('━━━ Example 4: Debug Low Similarity ━━━')
    console.log('Query: "TypeScript coding recommendations"')
    console.log('Current minProximity threshold: 0.9')
    results = await cache.search('TypeScript coding recommendations', 3)
    console.log('Top 3 results:')
    results.forEach((result, index) => {
      const matchStatus = result.similarity >= 0.9 ? '✓ MATCH' : '✗ NO MATCH'
      console.log(`  ${index + 1}. Similarity: ${result.similarity.toFixed(4)} ${matchStatus}`)
      console.log(`     Text: "${result.text}"`)
      console.log(`     Value: "${result.value}"`)
    })
    console.log()

    // Example 5: Finding all results
    console.log('━━━ Example 5: View All Cache Entries ━━━')
    console.log('Query: "programming"')
    results = await cache.search('programming', 10)
    console.log(`Found ${results.length} results:`)
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. Similarity: ${result.similarity.toFixed(4)}`)
      console.log(`     Text: "${result.text}"`)
    })
    console.log()

    // Demonstrate the difference between get() and search()
    console.log('━━━ Comparison: get() vs search() ━━━')
    const query = 'TypeScript coding recommendations'
    const getResult = await cache.get(query)
    const searchResults = await cache.search(query, 1)

    console.log(`Query: "${query}"`)
    console.log(`get() result: ${getResult}`)
    console.log(`search() best match: ${searchResults[0]?.value || 'none'}`)
    console.log(`search() similarity: ${searchResults[0]?.similarity.toFixed(4) || 'N/A'}`)
    console.log(`\nExplanation: get() returns undefined because similarity (${searchResults[0]?.similarity.toFixed(4)}) < minProximity (0.9)`)
    console.log(`             search() always returns results regardless of threshold\n`)

    console.log('✅ Search API examples completed!')
    console.log('\n💡 Use search() to:')
    console.log('   - Debug why queries don\'t match')
    console.log('   - Find the optimal minProximity threshold')
    console.log('   - Understand semantic similarity scores')
    console.log('   - Explore cache contents')

  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('Stack:', error.stack)
    }
  } finally {
    await cache.close()
  }
}

main().catch(console.error)
