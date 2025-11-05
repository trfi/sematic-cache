import { VoyageAIClient } from 'voyageai'
import { type EmbeddingProvider } from './embedding-provider'

/**
 * VoyageAI embedding provider implementation
 * Uses VoyageAI's embedding models
 */
export class VoyageEmbeddingProvider implements EmbeddingProvider {
  private client: VoyageAIClient
  private model: string

  constructor(apiKey: string, model: string = 'voyage-3.5-lite') {
    if (!apiKey) {
      throw new Error('VoyageAI API key is required')
    }
    this.client = new VoyageAIClient({ apiKey })
    this.model = model
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.client.embed({
        input: text,
        model: this.model
      })

      if (response.data && response.data.length > 0 && response.data[0]?.embedding) {
        return response.data[0].embedding
      }

      throw new Error('No embedding returned from VoyageAI')
    } catch (error) {
      throw new Error(
        `Failed to get VoyageAI embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  getName(): string {
    return 'voyage'
  }

  getModel(): string {
    return this.model
  }
}
