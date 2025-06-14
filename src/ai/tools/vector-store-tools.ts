import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Tool } from 'genkit';
import { logger } from '@/lib/logger';

// Mock in-memory vector database
interface DocumentChunk {
  content: string;
  sourceName: string;
  embedding: number[];
}

const mockVectorDatabase: DocumentChunk[] = [
  {
    content: 'ISA standard for barcode is GS1-128',
    sourceName: 'ISA Docs',
    embedding: [0.1, 0.2, 0.3],
  },
  {
    content: 'The main office is located in Brussels',
    sourceName: 'ISA Website',
    embedding: [0.4, 0.5, 0.6],
  },
  {
    content: 'Contact information for support is support@isa.example.com',
    sourceName: 'ISA Contact Page',
    embedding: [0.7, 0.8, 0.9],
  },
  {
    content: 'Membership benefits include access to exclusive events',
    sourceName: 'ISA Membership Brochure',
    embedding: [0.0, 0.1, 0.2],
  },
  {
    content: 'Annual conference will be held in October',
    sourceName: 'ISA Events Calendar',
    embedding: [0.3, 0.4, 0.5],
  },
];

interface DocumentChunkWithEmbedding extends DocumentChunk {
  embedding: number[]; // Assuming embeddings are just arrays of numbers for this mock
}


export const queryVectorStoreTool = ai.defineTool(
  {
    name: 'queryVectorStore',
    description:
      'Queries a vector store with a natural language question to find relevant document chunks.',
    inputSchema: z.object({
      query: z.string().describe('The natural language question for the vector store.'),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          content: z.string(),
          sourceName: z.string(),
        })
      ),
    }),
  },
  async ({ query }: { query: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));

      logger.info(`Mock Vector Store Tool Called with query: "${query}"`);

      const queryKeywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(keyword => keyword.length > 2);

      let relevantChunks: DocumentChunkWithEmbedding[] = [];

      if (queryKeywords.length > 0) {
        relevantChunks = mockVectorDatabase.filter(chunk =>
          queryKeywords.some(keyword =>
            chunk.content.toLowerCase().includes(keyword)
          )
        );
      }

      if (relevantChunks.length > 0) {
        logger.info('Mock Tool Output: Relevant chunks found.');
        return { results: relevantChunks };
      } else {
        logger.info('Mock Tool Output: No relevant chunks found.');
        return { results: [] };
      }
    }
);

export const vectorStoreTools: Tool[] = [queryVectorStoreTool];
