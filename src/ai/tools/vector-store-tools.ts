import { defineTool, Tool } from 'genkit';
import { z } from 'zod';

// Mock in-memory vector database
interface DocumentChunk {
  content: string;
  source: string;
  embedding: number[];
}

const mockVectorDatabase: DocumentChunk[] = [
  {
    content: 'ISA standard for barcode is GS1-128',
    source: 'ISA Docs',
    embedding: [0.1, 0.2, 0.3],
  },
  {
    content: 'The main office is located in Brussels',
    source: 'ISA Website',
    embedding: [0.4, 0.5, 0.6],
  },
  {
    content: 'Contact information for support is support@isa.example.com',
    source: 'ISA Contact Page',
    embedding: [0.7, 0.8, 0.9],
  },
  {
    content: 'Membership benefits include access to exclusive events',
    source: 'ISA Membership Brochure',
    embedding: [0.0, 0.1, 0.2],
  },
  {
    content: 'Annual conference will be held in October',
    source: 'ISA Events Calendar',
    embedding: [0.3, 0.4, 0.5],
  },
];

interface DocumentChunkWithEmbedding extends DocumentChunk {
  embedding: number[]; // Assuming embeddings are just arrays of numbers for this mock
}


export const vectorStoreTools: Tool[] = [defineTool({
        name: 'queryVectorStore',
        description: 'Queries a vector store with a natural language question to find relevant document chunks.',
        resource: {
            method: 'queryVectorStore',
            methodInfo: {
                // Define the expected input schema for the tool
                inputSchema: z.object({
                    query: z.string().describe('The natural language question for the vector store.'),
                }),
            },
        },
        func: async ({ query }: { query: string; }) => {
            // Simulate a delay for demonstration purposes
            await new Promise((resolve) => setTimeout(resolve, 500));

            console.log(`Mock Vector Store Tool Called with query: "${query}"`);

            // Rudimentary mock retrieval: find chunks that contain keywords from the query
            const queryKeywords = query.toLowerCase().split(/\s+/).filter(keyword => keyword.length > 2);

            let relevantChunks: DocumentChunkWithEmbedding[] = [];

            if (queryKeywords.length > 0) {
                relevantChunks = mockVectorDatabase.filter(chunk => queryKeywords.some(keyword => chunk.content.toLowerCase().includes(keyword))
                );
            }


            if (relevantChunks.length > 0) {
                const results = relevantChunks.map(
                    (chunk) => `- Content: ${chunk.content}\n  Source: ${chunk.source}`
                );
                console.log('Mock Tool Output: Relevant chunks found.');
                return { result: results.join('\n') };
            } else {
                console.log('Mock Tool Output: No relevant chunks found.');
                return { result: 'No relevant information found in the vector store.' };
            }
        },
    })];