// src/ai/flows/answer-gs1-questions-with-vector-search.ts
'use server';

/**
 * @fileOverview A conceptual AI agent that answers questions about GS1 standards
 * documents by dynamically retrieving relevant document chunks from a vector store.
 * This flow demonstrates an advanced RAG (Retrieval Augmented Generation) pattern.
 *
 * - answerGs1QuestionsWithVectorSearch - A function that answers questions using vector search.
 * - AnswerGs1QuestionsWithVectorSearchInput - The input type for the function.
 * - AnswerGs1QuestionsWithVectorSearchOutput - The return type for the function (reusing AnswerGs1QuestionsOutput structure).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnswerGs1QuestionsWithVectorSearchInputSchema, DocumentChunk } from '@/ai/schemas';
import { queryVectorStoreTool } from '@/ai/tools/vector-store-tools'; // Import the conceptual tool

// Re-export input type
export type AnswerGs1QuestionsWithVectorSearchInput = z.infer<typeof AnswerGs1QuestionsWithVectorSearchInputSchema>;

// Define Output Schema (similar to the original answerGs1Questions flow for consistency)
const CitedSourceSchema = z.object({
  sourceName: z.string().describe('The name or identifier of the cited source document.'),
  pageNumber: z.number().optional().describe('The page number in the cited source document.'),
  sectionTitle: z.string().optional().describe('The title of the section in the cited source document.'),
});

const AnswerGs1QuestionsWithVectorSearchOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, synthesized from retrieved document chunks.'),
  citedSources: z.array(CitedSourceSchema).optional().describe('A list of sources (document chunks) cited by the AI.'),
  reasoningSteps: z.array(z.string()).optional().describe('The steps the AI took to arrive at the answer.'),
});
export type AnswerGs1QuestionsWithVectorSearchOutput = z.infer<typeof AnswerGs1QuestionsWithVectorSearchOutputSchema>;


export async function answerGs1QuestionsWithVectorSearch(
  input: AnswerGs1QuestionsWithVectorSearchInput
): Promise<AnswerGs1QuestionsWithVectorSearchOutput> {
  return answerGs1QuestionsWithVectorSearchFlow(input);
}

// Define a prompt specific to using retrieved chunks
const vectorSearchBasedAnswerPrompt = ai.definePrompt({
  name: 'vectorSearchBasedAnswerPrompt',
  input: { schema: z.object({ question: z.string(), documentChunks: z.array(DocumentChunk) }) },
  output: { schema: AnswerGs1QuestionsWithVectorSearchOutputSchema },
  prompt: `You are an AI assistant that answers questions based *only* on the provided document content chunks retrieved from a knowledge base.

Here are the most relevant content chunks found for the user's question:
{{#each documentChunks}}
---
Source Document: "{{this.sourceName}}"
{{#if this.pageNumber}}Page: {{this.pageNumber}}{{/if}}
{{#if this.sectionTitle}}Section: "{{this.sectionTitle}}"{{/if}}

Content Snippet:
{{{this.content}}}
---
{{/each}}

User's Question: {{{question}}}

Based solely on the provided content snippets:
1. Answer the question clearly and concisely.
2. If your answer draws from specific snippets, try to implicitly refer to the source (e.g., "According to [sourceName]...").
3. Populate the 'citedSources' field in your output with a list of the document chunks you primarily used to formulate your answer. Each item in 'citedSources' should include the 'sourceName', 'pageNumber' (if available), and 'sectionTitle' (if available) from the input chunks.
4. Provide a list of 'reasoningSteps' outlining your thought process. For example:
   - "Interpreted user question: [paraphrased question]"
   - "Analyzed retrieved document chunks for relevance."
   - "Key information found in chunks from '{{documentChunks.0.sourceName}}' (Page {{documentChunks.0.pageNumber}}) and '{{documentChunks.1.sourceName}}'."
   - "Synthesized the answer based on these key pieces of information."
   - "Formulated citations based on the utilized chunks."

Answer:`,
});


const answerGs1QuestionsWithVectorSearchFlow = ai.defineFlow(
  {
    name: 'answerGs1QuestionsWithVectorSearchFlow',
    inputSchema: AnswerGs1QuestionsWithVectorSearchInputSchema,
    outputSchema: AnswerGs1QuestionsWithVectorSearchOutputSchema,
    tools: [queryVectorStoreTool], // Make the tool available to this flow
  },
  async (input) => {
    // Step 1: Retrieve relevant document chunks using the queryVectorStoreTool
    // Note: The LLM in Genkit doesn't automatically decide to call tools in a flow
    // unless the flow's core logic is a prompt that can use tools.
    // Here, we are explicitly calling the tool as part of the flow's imperative logic.
    const { results: documentChunks } = await queryVectorStoreTool({
      query: input.question,
      topK: input.topK,
    });

    if (!documentChunks || documentChunks.length === 0) {
      return {
        answer: "I couldn't find any relevant information in the knowledge base to answer your question.",
        citedSources: [],
        reasoningSteps: ["Searched knowledge base for relevant documents.", "No relevant documents found for the question.", "Unable to provide an answer."],
      };
    }

    // Step 2: Generate an answer using the retrieved chunks and the original question
    const { output } = await vectorSearchBasedAnswerPrompt({
      question: input.question,
      documentChunks: documentChunks,
    });

    return output!;
  }
);
