import { SemanticCache } from '../src'

// Example using VoyageAI as the embedding provider

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runVoyageExample() {
  console.log('🚀 VoyageAI Embedding Provider Example\n')

  // Create a semantic cache instance with VoyageAI
  const cache = new SemanticCache({
    provider: 'voyage',
    voyageApiKey: process.env.VOYAGE_API_KEY!,
    voyageModel: 'voyage-3.5-lite',
    minProximity: 0.9
  })

  console.log('✅ Cache initialized with VoyageAI embeddings')

  // Example 1: Multilingual support
  console.log('\n📝 Example 1: Multilingual Support')
  await cache.set('German Chancellor', 'Olaf Scholz')
  await delay(1000)

  const result1 = await cache.get('Wer ist der Bundeskanzler von Deutschland?')
  console.log(`Query: "Wer ist der Bundeskanzler von Deutschland?"`)
  console.log(`Result: ${result1}\n`)

  // Example 2: Historical facts
  console.log('📝 Example 2: Historical Facts')
  await cache.set('year in which the Berlin wall fell', '1989')
  await cache.set('year World War II ended', '1945')
  await delay(1000)

  const result2 = await cache.get("what's the year the Berlin wall was destroyed?")
  console.log(`Query: "what's the year the Berlin wall was destroyed?"`)
  console.log(`Result: ${result2}`)

  const result3 = await cache.get('When did WW2 end?')
  console.log(`Query: "When did WW2 end?"`)
  console.log(`Result: ${result3}\n`)

  // Example 3: Different contexts
  console.log('📝 Example 3: Different Contexts')
  await cache.set('the chemical formula for water', 'H2O')
  await cache.set('the healthiest drink on a hot day', 'water')
  await delay(1000)

  const result4 = await cache.get('what should I drink when it\'s hot outside?')
  console.log(`Query: "what should I drink when it's hot outside?"`)
  console.log(`Result: ${result4}`)

  const result5 = await cache.get("tell me water's chemical formula")
  console.log(`Query: "tell me water's chemical formula"`)
  console.log(`Result: ${result5}\n`)

  // Example 4: Namespace support
  console.log('📝 Example 4: Namespace Support')
  const userCache = new SemanticCache({
    provider: 'voyage',
    voyageApiKey: process.env.VOYAGE_API_KEY!,
    namespace: 'user123'
  })

  await userCache.set('favorite color', 'blue')
  await delay(1000)

  const result6 = await userCache.get('What color do I like?')
  console.log(`Query (namespace: user123): "What color do I like?"`)
  console.log(`Result: ${result6}\n`)

  await userCache.close()

  // Clean up
  await cache.close()
  console.log('✅ Cache closed')
}

runVoyageExample().catch(console.error)
