export { SemanticCache } from './semantic-cache'
export type { StorageOptions, SemanticCacheConfig, SearchResult } from './semantic-cache'

// Export provider types for advanced usage
export type {
  EmbeddingProvider,
  ProviderConfig,
  SupportedProvider
} from './providers'

export {
  EmbeddingProviderFactory,
  OpenAIEmbeddingProvider,
  GeminiEmbeddingProvider,
  VoyageEmbeddingProvider
} from './providers'
