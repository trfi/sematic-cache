/**
 * Interface for embedding providers
 * All embedding providers must implement this interface
 */
export interface EmbeddingProvider {
  /**
   * Generate embeddings for the given text
   * @param text - The text to generate embeddings for
   * @returns A promise that resolves to an array of numbers representing the embedding vector
   */
  embed(text: string): Promise<number[]>

  /**
   * Get the name of the provider
   */
  getName(): string

  /**
   * Get the model being used
   */
  getModel(): string
}
