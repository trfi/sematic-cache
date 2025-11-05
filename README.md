# Sematic Cache

Sematic Cache is library for caching natural text based on semantic similarity using LanceDB with multiple embedding provider support (OpenAI, Google Gemini, VoyageAI). It's ideal for any task that involves querying or retrieving information based on meaning, such as natural language classification or caching AI responses. Two pieces of text can be similar but not identical (e.g., "great places to check out in Spain" vs. "best places to visit in Spain"). Traditional caching doesn't recognize this semantic similarity and misses opportunities for reuse.

Sematic Cache allows you to:

- Easily classify natural text into predefined categories
- Avoid redundant LLM work by caching AI responses
- Reduce API latency by responding to similar queries with already cached values

## Highlights

- **Multiple Embedding Providers**: Choose from OpenAI, Google Gemini, or VoyageAI
- **Uses semantic similarity**: Stores cache entries by their meaning, not just the literal characters
- **Handles synonyms**: Recognizes and handles synonyms
- **Multi-language support**: Works across different languages
- **Complex query support**: Understands long and nested user queries
- **Easy integration**: Simple API for usage in Node.js applications
- **Customizable**: Set a custom proximity threshold to filter out less relevant results
- **LanceDB backend**: Fast and scalable vector database
- **Flexible configuration**: Configure via environment variables or constructor options

## Getting Started

### Prerequisites

- An API key for your chosen embedding provider:
  - **OpenAI**: Get one [here](https://platform.openai.com/api-keys)
  - **Google Gemini**: Get one [here](https://ai.google.dev/)
  - **VoyageAI**: Get one [here](https://www.voyageai.com/)
- Node.js 18+ or Bun runtime

### Installation

Install the package with your preferred package manager:

```bash
npm install sematic-cache
# or
bun add sematic-cache
# or
yarn add sematic-cache
# or
pnpm add sematic-cache
```

### Setup

First, get an API key from your chosen embedding provider.

Create a `.env` file in the root directory of your project and add your configuration:

#### Using OpenAI

```plaintext
EMBED_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=text-embedding-3-small  # Optional, default: text-embedding-3-small
```

#### Using Google Gemini

```plaintext
EMBED_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-embedding-001      # Optional, default: gemini-embedding-001
```

#### Using VoyageAI

```plaintext
EMBED_PROVIDER=voyage
VOYAGE_API_KEY=your_voyage_api_key_here
VOYAGE_MODEL=voyage-3.5-lite         # Optional, default: voyage-3.5-lite
```

#### Additional Optional Configuration

```plaintext
LANCEDB_URI=./lancedb               # Default: ./lancedb
CACHE_TABLE_NAME=semantic_cache     # Default: semantic_cache
CACHE_NAMESPACE=                    # Default: (none)
CACHE_MIN_PROXIMITY=0.9             # Default: 0.9
```

All configuration options can be set via environment variables or passed directly to the constructor. Constructor arguments take precedence over environment variables.

### Using Sematic Cache

Here's how you can use Sematic Cache in your Node.js application:

```typescript
import { SemanticCache } from "sematic-cache";

// Configuration loaded from .env file
const semanticCache = new SemanticCache();

async function runDemo() {
  await semanticCache.set("Capital of Turkey", "Ankara");
  await delay(1000);

  // Outputs: "Ankara"
  const result = await semanticCache.get("What is Turkey's capital?");
  console.log(result);

  // Don't forget to close the connection when done
  await semanticCache.close();
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runDemo();
```

### The `minProximity` Parameter

The `minProximity` parameter ranges from `0` to `1`. It lets you define the minimum relevance score to determine a cache hit. The higher this number, the more similar your user input must be to the cached content to be a hit. In practice, a score of 0.95 indicates a very high similarity, while a score of 0.75 already indicates a low similarity. For example, a value of 1.00, the highest possible, would only accept an _exact_ match of your user query and cache content as a cache hit.

### Namespace Support

You can separate your data into partitions with namespaces.

```typescript
import { SemanticCache } from "sematic-cache";

// Your semantic cache with namespace
const semanticCache = new SemanticCache({
  provider: 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY!,
  minProximity: 0.95,
  namespace: "user1"
});

await semanticCache.set("Capital of Turkey", "Ankara");
```

## Configuration Options

All configuration options are optional and can be set via:
1. Constructor arguments (takes precedence)
2. Environment variables
3. Default values

```typescript
type SemanticCacheConfig = {
  // Embedding Provider Configuration
  provider?: 'openai' | 'gemini' | 'voyage';  // Provider choice (default: "voyage")
                                               // ENV: EMBED_PROVIDER
  // OpenAI Configuration
  openaiApiKey?: string;           // OpenAI API key (required if provider is 'openai')
                                   // ENV: OPENAI_API_KEY
  openaiModel?: string;            // OpenAI model (default: "text-embedding-3-small")
                                   // ENV: OPENAI_MODEL
  // Gemini Configuration
  geminiApiKey?: string;           // Gemini API key (required if provider is 'gemini')
                                   // ENV: GEMINI_API_KEY
  geminiModel?: string;            // Gemini model (default: "gemini-embedding-001")
                                   // ENV: GEMINI_MODEL
  // VoyageAI Configuration
  voyageApiKey?: string;           // VoyageAI API key (required if provider is 'voyage')
                                   // ENV: VOYAGE_API_KEY
  voyageModel?: string;            // VoyageAI model (default: "voyage-3.5-lite")
                                   // ENV: VOYAGE_MODEL
  // Cache Configuration
  minProximity?: number;           // 0-1, similarity threshold (default: 0.9)
                                   // ENV: CACHE_MIN_PROXIMITY
  dbUri?: string;                  // LanceDB URI (default: "./lancedb")
                                   // ENV: LANCEDB_URI
  tableName?: string;              // Table name (default: "semantic_cache")
                                   // ENV: CACHE_TABLE_NAME
  namespace?: string;              // Optional namespace
                                   // ENV: CACHE_NAMESPACE
};
```

### Environment Variables Reference

#### Core Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `EMBED_PROVIDER` | Embedding provider (`openai`, `gemini`, or `voyage`) | `voyage` |
| `LANCEDB_URI` | Path to LanceDB storage (local or S3 URI) | `./lancedb` |
| `CACHE_TABLE_NAME` | Name of the cache table | `semantic_cache` |
| `CACHE_NAMESPACE` | Optional namespace for isolation | - |
| `CACHE_MIN_PROXIMITY` | Minimum similarity threshold (0-1) | `0.9` |

#### Provider-Specific Variables

**OpenAI**
| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | - |
| `OPENAI_MODEL` | OpenAI embedding model | `text-embedding-3-small` |

**Google Gemini**
| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Gemini API key | - |
| `GEMINI_MODEL` | Gemini embedding model | `gemini-embedding-001` |

**VoyageAI**
| Variable | Description | Default |
|----------|-------------|---------|
| `VOYAGE_API_KEY` | VoyageAI API key | - |
| `VOYAGE_MODEL` | VoyageAI embedding model | `voyage-3.5-lite` |

#### S3 / S3-Compatible Storage Variables

When using S3 or S3-compatible storage (like Cloudflare R2), set these additional variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | Access key ID | `your_access_key` |
| `AWS_SECRET_ACCESS_KEY` | Secret access key | `your_secret_key` |
| `AWS_SESSION_TOKEN` | Session token (optional) | - |
| `AWS_REGION` | AWS region | `us-east-1` (or `auto` for R2) |
| `S3_ENDPOINT` | Custom S3 endpoint | `https://<account_id>.r2.cloudflarestorage.com` |
| `ALLOW_HTTP` | Allow HTTP (for local dev) | `true` or `false` |

## Using with Cloud Storage

Sematic Cache supports S3 and S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.) for scalable, distributed deployments.

### Cloudflare R2 Example

```typescript
import { SemanticCache } from "sematic-cache";

const cache = new SemanticCache({
  provider: 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY!,
  dbUri: "s3://my-r2-bucket/cache-data",
  storageOptions: {
    awsAccessKeyId: process.env.R2_ACCESS_KEY_ID!,
    awsSecretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    region: "auto", // R2 requires "auto" as the region
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  }
});
```

### AWS S3 Example

```typescript
import { SemanticCache } from "sematic-cache";

const cache = new SemanticCache({
  provider: 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY!,
  dbUri: "s3://my-s3-bucket/cache-data",
  storageOptions: {
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: "us-east-1"
  }
});
```

### Using Environment Variables for Cloud Storage

Set these in your `.env` file:

```plaintext
EMBED_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
LANCEDB_URI=s3://my-r2-bucket/cache-data
AWS_ACCESS_KEY_ID=your_r2_access_key
AWS_SECRET_ACCESS_KEY=your_r2_secret_key
AWS_REGION=auto
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

Then simply instantiate without arguments:

```typescript
const cache = new SemanticCache();
```

## Examples

The following examples demonstrate how you can utilize Sematic Cache in various use cases:

> [!NOTE]
> We add a 1-second delay after setting the data to allow time for the vector index to update. This delay is necessary to ensure that the data is available for retrieval.

### Basic Semantic Retrieval

```typescript
await semanticCache.set("Capital of France", "Paris");
await delay(1000);

// Outputs "Paris"
const result = await semanticCache.get("What's the capital of France?");
```

### Handling Synonyms

```typescript
await semanticCache.set("largest city in USA by population", "New York");
await delay(1000);

// Outputs "New York"
const result = await semanticCache.get("which is the most populated city in the USA?");
```

### Multilingual Queries

Note: VoyageAI embedding models support multiple languages.

```typescript
await semanticCache.set("German Chancellor", "Olaf Scholz");
await delay(1000);

// "Who is the chancellor of Germany?" -> outputs "Olaf Scholz"
const result = await semanticCache.get("Wer ist der Bundeskanzler von Deutschland?");
```

### Complex Queries

```typescript
await semanticCache.set("year in which the Berlin wall fell", "1989");
await delay(1000);

// Outputs "1989"
const result = await semanticCache.get("what's the year the Berlin wall destroyed?");
```

### Different Contexts

```typescript
await semanticCache.set("the chemical formula for water", "H2O");
await semanticCache.set("the healthiest drink on a hot day", "water");

await delay(1000);

// Outputs "water"
const result = await semanticCache.get("what should i drink when it's hot outside?");

// Outputs "H2O"
const result = await semanticCache.get("tell me water's chemical formula");
```

### Bulk Operations

```typescript
// Bulk set
await semanticCache.set(
  ["capital of France", "capital of Germany"],
  ["Paris", "Berlin"]
);

await delay(1000);

// Bulk get
const results = await semanticCache.get([
  "France's capital",
  "Germany's capital"
]);
console.log(results); // ["Paris", "Berlin"]
```

### Search API

The `search()` method helps you understand why queries match or don't match:

```typescript
// Set some cache entries
await semanticCache.set("Best practices for TypeScript", "Use strict mode, enable type checking, avoid any");
await delay(1000);

// Use search() to see similarity scores
const results = await semanticCache.search("TypeScript coding tips", 3);

results.forEach(result => {
  console.log(`Similarity: ${result.similarity.toFixed(4)}`);
  console.log(`Text: "${result.text}"`);
  console.log(`Value: "${result.value}"`);
  console.log(`Match: ${result.similarity >= 0.9 ? "✓" : "✗"}`);
  console.log('---');
});

// Output example:
// Similarity: 0.7143
// Text: "Best practices for TypeScript"
// Value: "Use strict mode, enable type checking, avoid any"
// Match: ✗  (below 0.9 threshold)
```

This helps you:
- Understand why `get()` returns `undefined` for certain queries
- Find the optimal `minProximity` threshold
- See which cached entries are semantically similar to your query

## API Reference

### `new SemanticCache(config)`

Creates a new SemanticCache instance.

### `set(key: string, value: string): Promise<void>`
### `set(keys: string[], values: string[]): Promise<void>`

Store a value or multiple values in the cache.

### `get(key: string): Promise<string | undefined>`
### `get(keys: string[]): Promise<(string | undefined)[]>`

Retrieve a value or multiple values from the cache.

### `search(key: string, limit?: number): Promise<SearchResult[]>`

Search for similar cache entries and return detailed results with similarity scores.

### `delete(key: string): Promise<number>`

Delete a single key from the cache. Returns the number of deleted items.

### `bulkDelete(keys: string[]): Promise<number>`

Delete multiple keys from the cache. Returns the number of deleted items.

### `flush(): Promise<void>`

Clear all entries from the cache.

### `close(): Promise<void>`

Close the database connection.

## Contributing

We appreciate your contributions! If you'd like to contribute to this project, please fork the repository, make your changes, and submit a pull request.

## License

Distributed under the MIT License. See `LICENSE` for more information.
