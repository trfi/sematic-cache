import { EmbeddingProvider } from './embedding-provider'

/**
 * Google Gemini embedding provider implementation
 * Uses Google's Gemini text embedding models
 */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string
  private model: string
  private baseURL: string

  constructor(apiKey: string, model: string = 'text-embedding-004') {
    if (!apiKey) {
      throw new Error('Gemini API key is required')
    }
    this.apiKey = apiKey
    this.model = model
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta'
  }

  async embed(text: string): Promise<number[]> {
    try {
      const url = `${this.baseURL}/models/${this.model}:embedContent?key=${this.apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: {
            parts: [{
              text: text
            }]
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        )
      }

      const data = await response.json() as any

      if (data.embedding && data.embedding.values) {
        return data.embedding.values
      }

      throw new Error('No embedding returned from Gemini')
    } catch (error) {
      throw new Error(
        `Failed to get Gemini embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  getName(): string {
    return 'gemini'
  }

  getModel(): string {
    return this.model
  }
}
