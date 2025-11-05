import { SemanticCache } from '../src'

// Example using Google Gemini as the embedding provider

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runGeminiExample() {
  console.log('🚀 Google Gemini Embedding Provider Example\n')

  // Create a semantic cache instance with Gemini
  const cache = new SemanticCache({
    provider: 'gemini',
    geminiApiKey: process.env.GEMINI_API_KEY!,
    geminiModel: 'gemini-embedding-001',
    minProximity: 0.85
  })

  console.log('✅ Cache initialized with Gemini embeddings')

  // Example 1: Basic semantic retrieval
  console.log('\n📝 Example 1: Basic Semantic Retrieval')
  await cache.set('Speed of light', '299,792,458 meters per second')
  await delay(1000)

  const result1 = await cache.get('How fast does light travel?')
  console.log(`Query: "How fast does light travel?"`)
  console.log(`Result: ${result1}\n`)

  // Example 2: Scientific concepts
  console.log('📝 Example 2: Scientific Concepts')
  await cache.set('Chemical formula for water', 'H2O')
  await cache.set('Boiling point of water', '100°C at sea level')
  await delay(1000)

  const result2 = await cache.get("What's the formula for water?")
  console.log(`Query: "What's the formula for water?"`)
  console.log(`Result: ${result2}`)

  const result3 = await cache.get('At what temperature does water boil?')
  console.log(`Query: "At what temperature does water boil?"`)
  console.log(`Result: ${result3}\n`)

  // Example 3: Complex queries
  console.log('📝 Example 3: Complex Queries')
  await cache.set(
    'programming language created by Guido van Rossum',
    'Python'
  )
  await delay(1000)

  const result4 = await cache.get('Which language did Guido van Rossum create?')
  console.log(`Query: "Which language did Guido van Rossum create?"`)
  console.log(`Result: ${result4}\n`)

  // Example 4: Search API
  console.log('📝 Example 4: Search API with Similarity Scores')
  const searchResults = await cache.search('water properties', 5)
  console.log('Searching for: "water properties"')
  searchResults.forEach(result => {
    console.log(`Similarity: ${result.similarity.toFixed(4)}`)
    console.log(`Text: "${result.text}"`)
    console.log(`Value: "${result.value}"`)
    console.log('---')
  })

  // Clean up
  await cache.close()
  console.log('✅ Cache closed')
}

runGeminiExample().catch(console.error)
