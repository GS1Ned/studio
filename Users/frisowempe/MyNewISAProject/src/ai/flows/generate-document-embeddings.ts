// src/ai/flows/generate-document-embeddings.ts
'use server';

/**
 * @fileOverview A flow for generating embeddings for document chunks.
 * This flow now uses a real embedding model via ai.embed().
 * NOTE: To run this flow locally (e.g., via Genkit dev tools), a valid
 * GOOGLE_API_KEY must be present in your .env file.
 *
 * - generateDocumentEmbeddings - A function that handles the embedding generation process.
 * - GenerateDocumentEmbeddingsInput - The input type for the function.
 * - GenerateDocumentEmbeddingsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { GenerateDocumentEmbeddingsInputSchema, DocumentChunkSchema } from '@/ai/schemas';

export type GenerateDocumentEmbeddingsInput = z.infer<typeof GenerateDocumentEmbeddingsInputSchema>;

// Define the schema for a document chunk that includes an embedding
const DocumentChunkWithEmbeddingSchema = DocumentChunkSchema.extend({
  embedding: z.array(z.number()).describe('The embedding vector for the document chunk.'),
});
export type DocumentChunkWithEmbedding = z.infer<typeof DocumentChunkWithEmbeddingSchema>;

// Define the output schema for the flow
const GenerateDocumentEmbeddingsOutputSchema = z.object({
  chunksWithEmbeddings: z.array(DocumentChunkWithEmbeddingSchema).describe('An array of document chunks, each with its generated embedding.'),
});
export type GenerateDocumentEmbeddingsOutput = z.infer<typeof GenerateDocumentEmbeddingsOutputSchema>;

export async function generateDocumentEmbeddings(input: GenerateDocumentEmbeddingsInput): Promise<GenerateDocumentEmbeddingsOutput> {
  try {
    const result = await generateDocumentEmbeddingsFlow(input);
    return result;
  } catch (error) {
    console.error("Error in generateDocumentEmbeddings flow:", error);
    // Return a schema-compliant error or re-throw if appropriate for the caller
    // For now, returning an empty array if the whole process fails.
    // Individual chunk errors might be handled differently if needed (e.g., skipping a chunk).
    return { chunksWithEmbeddings: [] };
  }
}

const generateDocumentEmbeddingsFlow = ai.defineFlow(
  {
    name: 'generateDocumentEmbeddingsFlow',
    inputSchema: GenerateDocumentEmbeddingsInputSchema,
    outputSchema: GenerateDocumentEmbeddingsOutputSchema,
  },
  async (input) => {
    const chunksWithEmbeddings: DocumentChunkWithEmbedding[] = [];

    for (const chunk of input.documentChunks) {
      try {
        console.log(`Generating embedding for chunk from source: "${chunk.sourceName}", content starting with: "${chunk.content.substring(0, 50)}..."`);
        
        const embedResponse = await ai.embed({
          model: 'googleai/text-embedding-004', // Using a standard, generally available embedding model
          content: chunk.content,
          // Optionally, taskType can be specified, e.g., 'RETRIEVAL_DOCUMENT'
          // taskType: 'RETRIEVAL_DOCUMENT', 
        });
        
        chunksWithEmbeddings.push({
          ...chunk,
          embedding: embedResponse.embedding,
        });
      } catch (error) {
        console.error(`Failed to generate embedding for chunk from source: "${chunk.sourceName}":`, error);
        // Decide on error strategy: skip chunk, add placeholder, or let flow fail.
        // For now, skipping chunks that fail to embed.
      }
    }

    if (chunksWithEmbeddings.length === 0 && input.documentChunks.length > 0) {
      // This case means all chunks failed to embed.
      console.warn("All document chunks failed to generate embeddings.");
    }
    
    console.log(`Successfully generated embeddings for ${chunksWithEmbeddings.length} out of ${input.documentChunks.length} chunks.`);
    return { chunksWithEmbeddings };
  }
);
