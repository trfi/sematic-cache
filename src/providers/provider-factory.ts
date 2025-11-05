import { type EmbeddingProvider } from './embedding-provider'
import { OpenAIEmbeddingProvider } from './openai-provider'
import { GeminiEmbeddingProvider } from './gemini-provider'
import { VoyageEmbeddingProvider } from './voyage-provider'

export type SupportedProvider = 'openai' | 'gemini' | 'voyage'

export interface ProviderConfig {
  /**
   * The embedding provider to use
   * Can be set via EMBED_PROVIDER environment variable
   * @default "voyage"
   */
  provider?: SupportedProvider

  /**
   * OpenAI API key (required if provider is 'openai')
   * Can be set via OPENAI_API_KEY environment variable
   */
  openaiApiKey?: string

  /**
   * OpenAI model to use for embeddings
   * Can be set via OPENAI_MODEL environment variable
   * @default "text-embedding-3-small"
   */
  openaiModel?: string

  /**
   * Gemini API key (required if provider is 'gemini')
   * Can be set via GEMINI_API_KEY environment variable
   */
  geminiApiKey?: string

  /**
   * Gemini model to use for embeddings
   * Can be set via GEMINI_MODEL environment variable
   * @default "gemini-embedding-001"
   */
  geminiModel?: string

  /**
   * VoyageAI API key (required if provider is 'voyage')
   * Can be set via VOYAGE_API_KEY environment variable
   */
  voyageApiKey?: string

  /**
   * VoyageAI model to use for embeddings
   * Can be set via VOYAGE_MODEL environment variable
   * @default "voyage-3.5-lite"
   */
  voyageModel?: string
}

/**
 * Factory class for creating embedding providers
 */
export class EmbeddingProviderFactory {
  /**
   * Create an embedding provider based on configuration
   * @param config - Provider configuration
   * @returns An instance of EmbeddingProvider
   */
  static createProvider(config: ProviderConfig = {}): EmbeddingProvider {
    // Get provider from config or environment variable (default to voyage for backwards compatibility)
    const provider = (config.provider || process.env.EMBED_PROVIDER || 'voyage').toLowerCase() as SupportedProvider

    switch (provider) {
      case 'openai':
        return this.createOpenAIProvider(config)

      case 'gemini':
        return this.createGeminiProvider(config)

      case 'voyage':
        return this.createVoyageProvider(config)

      default:
        throw new Error(
          `Unsupported embedding provider: ${provider}. Supported providers are: openai, gemini, voyage`
        )
    }
  }

  private static createOpenAIProvider(config: ProviderConfig): OpenAIEmbeddingProvider {
    const apiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        'OpenAI API key is required. Set it via config.openaiApiKey or OPENAI_API_KEY environment variable.'
      )
    }

    const model = config.openaiModel || process.env.OPENAI_MODEL || 'text-embedding-3-small'
    return new OpenAIEmbeddingProvider(apiKey, model)
  }

  private static createGeminiProvider(config: ProviderConfig): GeminiEmbeddingProvider {
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error(
        'Gemini API key is required. Set it via config.geminiApiKey or GEMINI_API_KEY environment variable.'
      )
    }

    const model = config.geminiModel || process.env.GEMINI_MODEL || 'gemini-embedding-001'
    return new GeminiEmbeddingProvider(apiKey, model)
  }

  private static createVoyageProvider(config: ProviderConfig): VoyageEmbeddingProvider {
    const apiKey = config.voyageApiKey || process.env.VOYAGE_API_KEY
    if (!apiKey) {
      throw new Error(
        'VoyageAI API key is required. Set it via config.voyageApiKey or VOYAGE_API_KEY environment variable.'
      )
    }

    const model = config.voyageModel || process.env.VOYAGE_MODEL || 'voyage-3.5-lite'
    return new VoyageEmbeddingProvider(apiKey, model)
  }
}
