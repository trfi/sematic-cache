import { SemanticCache } from '../src'

// Example using OpenAI as the embedding provider

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runOpenAIExample() {
  console.log('🚀 OpenAI Embedding Provider Example\n')

  // Create a semantic cache instance with OpenAI
  const cache = new SemanticCache({
    provider: 'openai',
    openaiApiKey: process.env.OPENAI_API_KEY!,
    openaiModel: 'text-embedding-3-small',
    minProximity: 0.85
  })

  console.log('✅ Cache initialized with OpenAI embeddings')

  // Example 1: Basic semantic retrieval
  console.log('\n📝 Example 1: Basic Semantic Retrieval')
  await cache.set('Capital of France', 'Paris')
  await delay(1000)

  const result1 = await cache.get("What's the capital of France?")
  console.log(`Query: "What's the capital of France?"`)
  console.log(`Result: ${result1}\n`)

  // Example 2: Handling synonyms
  console.log('📝 Example 2: Handling Synonyms')
  await cache.set('largest city in USA by population', 'New York')
  await delay(1000)

  const result2 = await cache.get('which is the most populated city in the USA?')
  console.log(`Query: "which is the most populated city in the USA?"`)
  console.log(`Result: ${result2}\n`)

  // Example 3: Bulk operations
  console.log('📝 Example 3: Bulk Operations')
  await cache.set(
    ['capital of Germany', 'capital of Spain', 'capital of Italy'],
    ['Berlin', 'Madrid', 'Rome']
  )
  await delay(1000)

  const results = await cache.get([
    "Germany's capital",
    "Spain's capital",
    "Italy's capital"
  ])
  console.log('Query: Multiple capitals')
  console.log(`Results: ${JSON.stringify(results)}\n`)

  // Example 4: Using the search API
  console.log('📝 Example 4: Search API with Similarity Scores')
  await cache.set('Best practices for TypeScript', 'Use strict mode, enable type checking, avoid any')
  await delay(1000)

  const searchResults = await cache.search('TypeScript coding tips', 3)
  searchResults.forEach(result => {
    console.log(`Similarity: ${result.similarity.toFixed(4)}`)
    console.log(`Text: "${result.text}"`)
    console.log(`Value: "${result.value}"`)
    console.log(`Match: ${result.similarity >= 0.85 ? '✓' : '✗'}`)
    console.log('---')
  })

  // Clean up
  await cache.close()
  console.log('✅ Cache closed')
}

runOpenAIExample().catch(console.error)
