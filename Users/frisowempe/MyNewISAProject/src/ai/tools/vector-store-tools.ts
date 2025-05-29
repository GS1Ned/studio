'use server';
/**
 * @fileOverview Conceptual tools for interacting with a vector store.
 * These are placeholders and would need to be integrated with a real vector database.
 *
 * - queryVectorStoreTool - A conceptual tool to query a vector store for relevant document chunks using an embedding.
 */

import { ai } from '@/ai/genkit';
import { DocumentChunkSchema } from '@/ai/schemas';
import { z } from 'zod';

// Input schema for querying the vector store
const QueryVectorStoreInputSchema = z.object({
  queryText: z.string().describe('The original natural language query text (for logging/context).'),
  queryEmbedding: z.array(z.number()).describe('The embedding vector of the query.'),
  topK: z.number().optional().default(5).describe('The number of top results to return.'),
  // In a real scenario, you might add filters for metadata like sourceName, etc.
  // metadataFilter: z.record(z.string(), z.any()).optional().describe('Metadata filters to apply to the search.'),
});
export type QueryVectorStoreInput = z.infer<typeof QueryVectorStoreInputSchema>;

// Output schema: an array of document chunks
const QueryVectorStoreOutputSchema = z.object({
  results: z.array(DocumentChunkSchema).describe('An array of relevant document chunks retrieved from the vector store.'),
});
export type QueryVectorStoreOutput = z.infer<typeof QueryVectorStoreOutputSchema>;

// Define the schema for a document chunk that includes an embedding (for internal mock store)
const DocumentChunkWithEmbeddingSchema = DocumentChunkSchema.extend({
  embedding: z.array(z.number()).describe('The embedding vector for the document chunk.'),
});
type DocumentChunkWithEmbedding = z.infer<typeof DocumentChunkWithEmbeddingSchema>;


// Expanded Mock internal vector store with GS1-specific content
const mockVectorDatabase: DocumentChunkWithEmbedding[] = [
  {
    content: "The GS1 General Specifications define the rules for allocating Global Trade Item Numbers (GTINs). Each brand owner is responsible for ensuring the uniqueness of their assigned GTINs to prevent collisions in the global supply chain.",
    sourceName: "GS1 General Specifications v24.0",
    pageNumber: 45,
    sectionTitle: "2.1 GTIN Allocation Rules",
    embedding: Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4))),
  },
  {
    content: "GS1 Digital Link standard allows brands to web-enable their products by encoding GS1 identifiers (like GTIN) into web URIs. This connects physical products to rich online information and services.",
    sourceName: "GS1 Digital Link v1.3",
    pageNumber: 12,
    sectionTitle: "Introduction to Digital Link",
    embedding: Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4))),
  },
  {
    content: "Serial Shipping Container Codes (SSCC) are used to identify logistic units. They must be globally unique and include a correctly calculated check digit. SSCCs are fundamental for tracking and tracing goods throughout the supply chain.",
    sourceName: "GS1 General Specifications v24.0",
    pageNumber: 150,
    sectionTitle: "4.3 SSCC Construction and Application",
    embedding: Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4))),
  },
  {
    content: "In the healthcare sector, GS1 DataMatrix symbols are commonly used to encode GTINs, batch/lot numbers, and expiry dates on medical devices and pharmaceuticals for enhanced traceability and patient safety.",
    sourceName: "GS1 Healthcare Guideline v12",
    pageNumber: 33,
    sectionTitle: "Barcode Implementation for Medical Products",
    embedding: Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4))),
  },
  {
    content: "The Global Location Number (GLN) is used to identify physical locations or legal entities. GLNs play a crucial role in supply chain efficiency by providing a standard way to reference parties and locations in business transactions.",
    sourceName: "GS1 GLN Allocation Rules",
    pageNumber: 7,
    sectionTitle: "1.2 Purpose of the GLN",
    embedding: Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4))),
  },
  {
    content: "Interoperability is a key principle of the entire GS1 system. Standards are designed to ensure that data can be shared and understood consistently across different trading partners, systems, and countries.",
    sourceName: "GS1 System Architecture Overview",
    pageNumber: 5,
    sectionTitle: "Core Principles of GS1",
    embedding: Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4))),
  },
  {
    content: "Understanding precise GTIN allocation rules is critical for brand owners to avoid duplication and ensure their products are uniquely identified worldwide. The GS1 General Specifications document is the definitive source for these rules.",
    sourceName: "GS1 GTIN Management Standard",
    pageNumber: 19,
    sectionTitle: "Preventing GTIN Duplication",
    embedding: Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4))),
  },
  {
    content: "The syntax for GS1 Digital Link URIs must adhere to specific structural rules to ensure that web resolvers can correctly interpret them and redirect users to the appropriate online resources or experiences.",
    sourceName: "GS1 Digital Link URI Syntax Standard v1.3",
    pageNumber: 28,
    sectionTitle: "3.1 URI Syntax Specification",
    embedding: Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4))),
  }
];


export const queryVectorStoreTool = ai.defineTool(
  {
    name: 'queryVectorStoreTool',
    description: 'Queries a vector store to retrieve document chunks relevant to a given query embedding and text. (Currently a MOCK IMPLEMENTATION)',
    inputSchema: QueryVectorStoreInputSchema,
    outputSchema: QueryVectorStoreOutputSchema,
  },
  async ({ queryText, queryEmbedding, topK = 5 }) => {
    console.log(`[MOCK VECTOR TOOL] queryVectorStoreTool called with queryText: "${queryText}", topK: ${topK}`);
    console.log(`[MOCK VECTOR TOOL] Received queryEmbedding (length: ${queryEmbedding.length}, first 3 dims): [${queryEmbedding.slice(0,3).join(', ')}, ...] (Note: mock logic uses queryText for keyword matching)`);
    
    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 150));

    if (queryText.toLowerCase().includes("empty test")) {
         console.log("[MOCK VECTOR TOOL] Simulating empty results for 'empty test' query.");
         return { results: [] };
    }

    // Rudimentary keyword matching for slightly more dynamic results.
    let relevantChunksWithEmbeddings: DocumentChunkWithEmbedding[] = [];
    const queryKeywords = queryText.toLowerCase().split(/\s+/).filter(kw => kw.length > 2); 

    mockVectorDatabase.forEach(chunk => {
      const chunkText = `${chunk.content} ${chunk.sourceName} ${chunk.sectionTitle || ''}`.toLowerCase();
      if (queryKeywords.some(kw => chunkText.includes(kw))) {
        relevantChunksWithEmbeddings.push(chunk);
      }
    });
    
    // If no "relevant" chunks found by keywords, fall back to returning some general chunks to avoid empty results unless specifically tested.
    if (relevantChunksWithEmbeddings.length === 0 && mockVectorDatabase.length > 0 && !queryText.toLowerCase().includes("show nothing if no keywords")) {
        // Return a shuffled subset of the whole database if no specific keywords matched, to still provide some results
        const shuffledDb = [...mockVectorDatabase].sort(() => 0.5 - Math.random());
        relevantChunksWithEmbeddings = shuffledDb;
    }
    
    // Shuffle "relevant" chunks to simulate varied search results if not already a full shuffle
    if (!(relevantChunksWithEmbeddings.length === mockVectorDatabase.length && !queryKeywords.some(kw => mockVectorDatabase.some(chunk => `${chunk.content} ${chunk.sourceName} ${chunk.sectionTitle || ''}`.toLowerCase().includes(kw))))) {
        relevantChunksWithEmbeddings.sort(() => 0.5 - Math.random());
    }
    
    // Apply topK
    const limitedChunks = relevantChunksWithEmbeddings.slice(0, topK);
    
    // Strip the embedding for the output, as DocumentChunkSchema doesn't include it.
    const retrievedChunksFinal: z.infer<typeof DocumentChunkSchema>[] = limitedChunks.map(chunkWithEmbedding => {
      const { embedding, ...chunk } = chunkWithEmbedding;
      return chunk;
    });
    
    console.log(`[MOCK VECTOR TOOL] queryVectorStoreTool returning ${retrievedChunksFinal.length} chunks.`);
    return { results: retrievedChunksFinal };
  }
);