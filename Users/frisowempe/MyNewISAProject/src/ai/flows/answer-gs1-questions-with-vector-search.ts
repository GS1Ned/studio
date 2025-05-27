// src/ai/flows/answer-gs1-questions-with-vector-search.ts
'use server';

/**
 * @fileOverview An AI agent that answers questions about GS1 standards
 * documents by:
 * 1. Generating an embedding for the user's question (simulated).
 * 2. Querying a vector store tool with this embedding to get relevant document chunks (simulated).
 * 3. Synthesizing an answer from these chunks using an LLM.
 * This flow demonstrates an advanced RAG (Retrieval Augmented Generation) pattern.
 *
 * - answerGs1QuestionsWithVectorSearch - A function that answers questions using vector search.
 * - AnswerGs1QuestionsWithVectorSearchInput - The input type for the function.
 * - AnswerGs1QuestionsWithVectorSearchOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnswerGs1QuestionsWithVectorSearchInputSchema, DocumentChunkSchema } from '@/ai/schemas'; 
import { queryVectorStoreTool } from '@/ai/tools/vector-store-tools';


export type AnswerGs1QuestionsWithVectorSearchInput = z.infer<typeof AnswerGs1QuestionsWithVectorSearchInputSchema>;


const CitedSourceSchema = z.object({
  sourceName: z.string().describe('The name or identifier of the cited source document.'),
  pageNumber: z.number().optional().describe('The page number in the cited source document.'),
  sectionTitle: z.string().optional().describe('The title of the section in the cited source document.'),
});

const AnswerGs1QuestionsWithVectorSearchOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, synthesized from retrieved document chunks.'),
  citedSources: z.array(CitedSourceSchema).optional().describe('A list of sources (document chunks) cited by the AI.'),
  reasoningSteps: z.array(z.string()).optional().describe('The steps the AI took to arrive at the answer.'),
  retrievedChunksCount: z.number().optional().describe('Number of chunks retrieved from the vector store.')
});
export type AnswerGs1QuestionsWithVectorSearchOutput = z.infer<typeof AnswerGs1QuestionsWithVectorSearchOutputSchema>;


async function generateMockQueryEmbedding(queryText: string): Promise<number[]> {
  // Simulate embedding generation for the query
  console.log(`[MOCK] Generating embedding for query: "${queryText}"`);
  // Simulate a brief delay for embedding generation
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50)); 
  // Return a mock embedding vector (e.g., 10 dimensions of random numbers)
  return Array.from({ length: 10 }, () => parseFloat(Math.random().toFixed(4)));
}


const SynthesisPromptInputSchema = z.object({
  question: z.string(),
  documentChunks: z.array(DocumentChunkSchema),
});


const synthesizeAnswerFromChunksPrompt = ai.definePrompt({
  name: 'synthesizeAnswerFromChunksPrompt',
  input: { schema: SynthesisPromptInputSchema },
  output: { schema: AnswerGs1QuestionsWithVectorSearchOutputSchema.omit({ retrievedChunksCount: true }) }, 
  prompt: `You are an AI assistant that answers questions about GS1 standards based *only* on the provided document content snippets.

Provided Document Chunks:
{{#if documentChunks.length}}
  {{#each documentChunks}}
  ---
  Source Document: "{{this.sourceName}}"
  {{#if this.pageNumber}}Page: {{this.pageNumber}}{{/if}}
  {{#if this.sectionTitle}}Section: "{{this.sectionTitle}}"{{/if}}

  Content Snippet:
  {{{this.content}}}
  ---
  {{/each}}
{{else}}
  (No document chunks were retrieved from the knowledge base.)
{{/if}}

User's Original Question: {{{question}}}

Based solely on the provided content snippets (if any):
1. If document chunks are available, analyze them to synthesize a clear and concise 'answer' to the user's original 'question'.
2. If no document chunks are available, state that no relevant information was found in the knowledge base to answer the question.
3. Populate the 'citedSources' field with details from the document chunks you primarily used. If no chunks were used or available, this should be an empty array.
4. Provide a list of 'reasoningSteps' outlining your thought process. If no chunks are available, explain that no information was found and why (e.g., "No relevant documents found in vector search for the query.").

Begin.`,
});


export async function answerGs1QuestionsWithVectorSearch(
  input: AnswerGs1QuestionsWithVectorSearchInput
): Promise<AnswerGs1QuestionsWithVectorSearchOutput> {
  try {
    // Step 1: Simulate generating an embedding for the user's question.
    const questionEmbedding = await generateMockQueryEmbedding(input.question);

    // Step 2: Call the (mocked) vector store tool to retrieve document chunks.
    const { results: retrievedDocumentChunks } = await queryVectorStoreTool({
      queryText: input.question, // Pass original query text for context/logging
      queryEmbedding: questionEmbedding,
      topK: input.topK,
    });
    
    // Step 3: Synthesize an answer from the retrieved chunks using an LLM.
    const synthesisInput = {
      question: input.question,
      documentChunks: retrievedDocumentChunks,
    };

    const { output: synthesisOutputP } = await synthesizeAnswerFromChunksPrompt(synthesisInput);
    const synthesisOutput = await synthesisOutputP; // Resolve the promise

    if (!synthesisOutput) {
      console.error('synthesizeAnswerFromChunksPrompt did not return a valid output.');
      return {
        answer: "I encountered an issue generating an answer from the retrieved information. The AI model failed to produce a structured response. Please try again.",
        citedSources: [],
        reasoningSteps: ["The AI model failed to produce a structured response during the synthesis stage."],
        retrievedChunksCount: retrievedDocumentChunks.length,
      };
    }
    
    // Combine the synthesis output with the count of retrieved chunks.
    return {
      ...synthesisOutput,
      retrievedChunksCount: retrievedDocumentChunks.length,
    };

  } catch (error) {
    console.error("Error in answerGs1QuestionsWithVectorSearch flow:", error);
    // Ensure a schema-compliant error object is returned
    return {
      answer: "An unexpected error occurred while processing your request with vector search. Please check the input or try again later.",
      citedSources: [],
      reasoningSteps: ["An unexpected error occurred in the RAG pipeline."],
      retrievedChunksCount: 0,
    };
  }
}

// Previous flow definition removed for brevity and direct error handling in exported function
// const answerGs1QuestionsWithVectorSearchFlow = ai.defineFlow( ... );
// This structure (direct function export performing all steps) is used for clarity
// in this conceptual RAG pipeline demonstration.
