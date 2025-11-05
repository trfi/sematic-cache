import { type EmbeddingProvider } from './embedding-provider'

/**
 * OpenAI embedding provider implementation
 * Uses OpenAI's text-embedding models
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string
  private model: string
  private baseURL: string

  constructor(apiKey: string, model: string = 'text-embedding-3-small') {
    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }
    this.apiKey = apiKey
    this.model = model
    this.baseURL = 'https://api.openai.com/v1'
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          input: text,
          model: this.model
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        )
      }

      const data = await response.json() as any

      if (data.data && data.data.length > 0 && data.data[0]?.embedding) {
        return data.data[0].embedding
      }

      throw new Error('No embedding returned from OpenAI')
    } catch (error) {
      throw new Error(
        `Failed to get OpenAI embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  getName(): string {
    return 'openai'
  }

  getModel(): string {
    return this.model
  }
}
