
// src/ai/flows/generate-document-embeddings.ts
'use server';

/**
 * @fileOverview A flow for generating embeddings for document chunks.
 * This flow now uses a real embedding model via ai.embed() and simulates
 * assigning a unique chunkId and storing metadata.
 * NOTE: To run this flow locally (e.g., via Genkit dev tools), a valid
 * GOOGLE_API_KEY must be present in your .env file.
 *
 * - generateDocumentEmbeddings - A function that handles the embedding generation process.
 * - GenerateDocumentEmbeddingsInput - The input type for the function.
 * - GenerateDocumentEmbeddingsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod'; // Corrected import to zod
import { GenerateDocumentEmbeddingsInputSchema, DocumentChunkSchema } from '@/ai/schemas';
import crypto from 'crypto'; 

export type GenerateDocumentEmbeddingsInput = z.infer<typeof GenerateDocumentEmbeddingsInputSchema>;

// Define the schema for a document chunk that includes an embedding and a chunkId
const DocumentChunkWithEmbeddingSchema = DocumentChunkSchema.extend({
  chunkId: z.string().uuid().describe('Unique identifier for the document chunk.'),
  embedding: z.array(z.number()).describe('The embedding vector for the document chunk.'),
});
export type DocumentChunkWithEmbedding = z.infer<typeof DocumentChunkWithEmbeddingSchema>;

// Define the output schema for the flow
const GenerateDocumentEmbeddingsOutputSchema = z.object({
  chunksWithEmbeddings: z.array(DocumentChunkWithEmbeddingSchema).describe('An array of document chunks, each with its generated embedding and chunkId. Chunks that failed to embed will be omitted.'),
  successfulEmbeddings: z.number().describe('Number of chunks successfully embedded.'),
  failedEmbeddings: z.number().describe('Number of chunks that failed to embed.'),
});
export type GenerateDocumentEmbeddingsOutput = z.infer<typeof GenerateDocumentEmbeddingsOutputSchema>;

export async function generateDocumentEmbeddings(input: GenerateDocumentEmbeddingsInput): Promise<GenerateDocumentEmbeddingsOutput> {
  // The flow itself will handle the main try-catch for overall flow execution.
  // Here, we directly call the flow.
  return generateDocumentEmbeddingsFlow(input);
}

const generateDocumentEmbeddingsFlow = ai.defineFlow(
  {
    name: 'generateDocumentEmbeddingsFlow',
    inputSchema: GenerateDocumentEmbeddingsInputSchema,
    outputSchema: GenerateDocumentEmbeddingsOutputSchema,
  },
  async (input) => {
    const chunksWithEmbeddings: DocumentChunkWithEmbedding[] = [];
    let successfulEmbeddings = 0;
    let failedEmbeddings = 0;

    for (const chunk of input.documentChunks) {
      try {
        const chunkId = crypto.randomUUID();
        console.log(`[EMBEDDING_FLOW] Attempting to generate embedding for chunk from source: "${chunk.sourceName}", assigned chunkId: ${chunkId}, content starting with: "${chunk.content.substring(0, 50)}..."`);
        
        const embedResponse = await ai.embed({
          model: 'googleai/text-embedding-004', // Using a standard embedding model
          content: chunk.content,
        });
        
        // Simulate storing the chunk metadata (excluding the embedding itself)
        // In a real ETLVRE pipeline, this metadata (chunk.content, chunk.sourceName, etc., along with chunkId)
        // would be written to a persistent store like Firestore, keyed by chunkId.
        console.log(`[EMBEDDING_FLOW][SIMULATED_FIRESTORE_WRITE] Storing chunk metadata for chunkId: ${chunkId}, source: "${chunk.sourceName}", page: ${chunk.pageNumber || 'N/A'}, section: "${chunk.sectionTitle || 'N/A'}"`);

        chunksWithEmbeddings.push({
          ...chunk,
          chunkId,
          embedding: embedResponse.embedding,
        });
        successfulEmbeddings++;
      } catch (error) {
        console.error(`[EMBEDDING_FLOW] Failed to generate embedding for chunk from source: "${chunk.sourceName}", content: "${chunk.content.substring(0,50)}...". Error:`, error);
        failedEmbeddings++;
        // Continue to the next chunk
      }
    }

    if (failedEmbeddings > 0) {
      console.warn(`[EMBEDDING_FLOW] ${failedEmbeddings} out of ${input.documentChunks.length} chunks failed to generate embeddings.`);
    }
    
    console.log(`[EMBEDDING_FLOW] Successfully generated embeddings for ${successfulEmbeddings} out of ${input.documentChunks.length} chunks.`);
    return { 
      chunksWithEmbeddings,
      successfulEmbeddings,
      failedEmbeddings,
    };
  }
);

