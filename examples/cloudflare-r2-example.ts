/**
 * Example: Using Semantic Cache with Cloudflare R2
 *
 * This example demonstrates how to use semantic caching with Cloudflare R2,
 * an S3-compatible object storage service with zero egress fees.
 *
 * Prerequisites:
 * 1. A Cloudflare account with R2 enabled
 * 2. An R2 bucket created
 * 3. R2 API credentials (Access Key ID and Secret Access Key)
 * 4. Your R2 account ID
 * 5. A VoyageAI API key
 */

import { SemanticCache } from '../src/index'

// Helper function for delays
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('🚀 Semantic Cache with Cloudflare R2 Example\n')

  // Option 1: Using environment variables (recommended for production)
  // Set these in your .env file:
  // VOYAGE_API_KEY=your_voyage_api_key
  // LANCEDB_URI=s3://my-r2-bucket/cache-data
  // AWS_ACCESS_KEY_ID=your_r2_access_key_id
  // AWS_SECRET_ACCESS_KEY=your_r2_secret_access_key
  // AWS_REGION=auto
  // S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com

  // Using environment variables with a more practical similarity threshold
  // Using a timestamped namespace for fresh data (avoids cache pollution from previous runs)
  const cache = new SemanticCache({
    minProximity: 0.85,  // Lower threshold allows more semantic flexibility
    namespace: `example-${Date.now()}`
  });

  // Option 2: Explicit configuration
  // const cache = new SemanticCache({
  //   voyageApiKey: process.env.VOYAGE_API_KEY || 'your-voyage-api-key',
  //   dbUri: process.env.LANCEDB_URI || 's3://my-r2-bucket/cache-data',
  //   minProximity: 0.85,
  //   storageOptions: {
  //     awsAccessKeyId: process.env.R2_ACCESS_KEY_ID || 'your-r2-access-key',
  //     awsSecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'your-r2-secret-key',
  //     region: 'auto', // R2 requires 'auto' as the region
  //     endpoint: process.env.R2_ENDPOINT || 'https://your-account-id.r2.cloudflarestorage.com'
  //   }
  // })

  try {
    // Example 1: Basic caching
    console.log('📝 Example 1: Basic semantic caching with R2')
    await cache.set('What is the capital of France?', 'Paris')
    await delay(1000) // Wait for index update

    const result1 = await cache.get('What is France\'s capital city?')
    console.log(`Query: "What is France's capital city?"`)
    console.log(`Result: ${result1}`)
    console.log()

    // Example 2: Semantic matching
    console.log('🌍 Example 2: Semantic matching with similar phrasing')
    await cache.set('Best practices for TypeScript', 'Use strict mode, enable type checking, avoid any type')
    await delay(1000)

    const result2 = await cache.get('What are the best practices for TypeScript')
    console.log(`Query: "What are the best practices for TypeScript"`)
    console.log(`Result: ${result2}`)
    console.log()

    // Example 3: Bulk operations
    console.log('📦 Example 3: Bulk operations with multiple keys')
    await cache.set(
      ['What is the weather like', 'How do I cook pasta', 'Best practices for coding'],
      ['I don\'t have weather data', 'Boil water, add pasta, cook for 8-10 minutes', 'Write clean code, use version control, write tests']
    )
    await delay(1000)

    const results = await cache.get(['Tell me about the weather', 'How to cook pasta', 'Coding best practices'])
    results.forEach((result, index) => {
      console.log(`Query ${index + 1}: ${result}`)
    })
    console.log()

    // Example 4: Namespace isolation
    console.log('🏢 Example 4: Using namespaces for multi-tenancy')
    const userCache = new SemanticCache({
      namespace: 'user-123',
      minProximity: 0.85
    })

    await userCache.set('My favorite color', 'Blue')
    await delay(1000)

    const userResult = await userCache.get('What is my favorite color?')
    console.log(`User-specific query: ${userResult}`)
    console.log()

    // Cleanup
    await userCache.close()

    console.log('✅ All examples completed successfully!')
    console.log('\n💡 Benefits of using Cloudflare R2:')
    console.log('   - Zero egress fees (no charges for data retrieval)')
    console.log('   - S3-compatible API')
    console.log('   - Global distribution')
    console.log('   - Cost-effective storage')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await cache.close()
  }
}

// Run the example
main().catch(console.error)
