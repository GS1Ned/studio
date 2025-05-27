// src/ai/flows/answer-gs1-questions-with-vector-search.ts
'use server';

/**
 * @fileOverview An AI agent that answers questions about GS1 standards
 * documents by dynamically retrieving relevant document chunks from a vector store using LLM-driven tool calling.
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

// Re-export input type
export type AnswerGs1QuestionsWithVectorSearchInput = z.infer<typeof AnswerGs1QuestionsWithVectorSearchInputSchema>;

// Define Output Schema (consistent structure for AI answers)
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

// This prompt will now instruct the LLM to use the queryVectorStoreTool.
const vectorSearchAgentPrompt = ai.definePrompt({
  name: 'vectorSearchAgentPrompt',
  input: { schema: AnswerGs1QuestionsWithVectorSearchInputSchema }, // Takes original user question and topK
  output: { schema: AnswerGs1QuestionsWithVectorSearchOutputSchema },
  tools: [queryVectorStoreTool], // Make the tool available to this prompt
  system: `You are an AI assistant that answers questions about GS1 standards.
To answer the user's question, you MUST first use the 'queryVectorStoreTool' to retrieve relevant document chunks from the knowledge base.
Use the user's 'question' and 'topK' parameters for the tool.

If the tool returns document chunks:
1. Analyze the retrieved document chunks. Each chunk will have 'content', 'sourceName', 'pageNumber', and 'sectionTitle'.
2. Synthesize a clear and concise 'answer' to the user's original 'question' based *solely* on the information found in these chunks.
3. Populate the 'citedSources' field with details from the document chunks you primarily used.
4. Provide a list of 'reasoningSteps' outlining your thought process (e.g., how you used the tool, interpreted chunks, and formed the answer).

If the 'queryVectorStoreTool' returns no relevant document chunks:
1. Set the 'answer' to indicate that no relevant information was found in the knowledge base.
2. Set 'citedSources' to an empty array or omit it.
3. Set 'reasoningSteps' to explain that the search yielded no results.

User's question: {{{question}}}
(You will use the 'topK' value of '{{topK}}' when calling the queryVectorStoreTool)

Begin your process now.
`,
});


const answerGs1QuestionsWithVectorSearchFlow = ai.defineFlow(
  {
    name: 'answerGs1QuestionsWithVectorSearchFlow',
    inputSchema: AnswerGs1QuestionsWithVectorSearchInputSchema,
    outputSchema: AnswerGs1QuestionsWithVectorSearchOutputSchema,
    // The tools are now associated with the prompt, not directly with the flow's definition here,
    // as the prompt itself will manage tool invocation.
  },
  async (input) => {
    // The flow now primarily invokes the agentic prompt, which internally decides to use tools.
    const { output } = await vectorSearchAgentPrompt(input);

    // Handle cases where the LLM might not perfectly adhere to the output schema,
    // especially if tool use fails or it doesn't find chunks.
    if (!output) {
      return {
        answer: "I encountered an issue processing your request. Please try again.",
        citedSources: [],
        reasoningSteps: ["The AI agent did not produce a valid output structure after attempting to use internal tools."],
      };
    }
    
    return output;
  }
);
