// src/ai/flows/answer-gs1-questions.ts
'use server';

/**
 * @fileOverview An AI agent that answers questions about GS1 standards documents using provided document chunks.
 *
 * - answerGs1Questions - A function that answers questions about GS1 standards documents.
 * - AnswerGs1QuestionsInput - The input type for the answerGs1Questions function.
 * - AnswerGs1QuestionsOutput - The return type for the answerGs1Questions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnswerGs1QuestionsInputSchema } from '@/ai/schemas'; 

export type AnswerGs1QuestionsInput = z.infer<typeof AnswerGs1QuestionsInputSchema>;

const CitedSourceSchema = z.object({
  sourceName: z.string().describe('The name or identifier of the cited source document.'),
  pageNumber: z.number().optional().describe('The page number in the cited source document.'),
  sectionTitle: z.string().optional().describe('The title of the section in the cited source document.'),
});

const AnswerGs1QuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the GS1 standards document.'),
  citedSources: z.array(CitedSourceSchema).optional().describe('A list of sources cited by the AI in generating the answer.'),
  reasoningSteps: z.array(z.string()).optional().describe('The steps the AI took to arrive at the answer, explaining its thought process.'),
});
export type AnswerGs1QuestionsOutput = z.infer<typeof AnswerGs1QuestionsOutputSchema>;

export async function answerGs1Questions(input: AnswerGs1QuestionsInput): Promise<AnswerGs1QuestionsOutput> {
  try {
    const {output} = await answerGs1QuestionsPrompt(input);
    if (!output) {
      console.error('answerGs1QuestionsPrompt did not return a valid output.');
      return {
        answer: 'An error occurred while generating the answer. The AI model failed to produce a structured response. Please try again.',
        citedSources: [],
        reasoningSteps: ['AI model failed to produce a structured response.'],
      };
    }
    return output;
  } catch (error) {
    console.error("Error in answerGs1Questions flow:", error);
    return {
      answer: "An unexpected error occurred while processing your Q&A request. Please check the input or try again later.",
      citedSources: [],
      reasoningSteps: ["An unexpected error occurred in the AI flow."]
    };
  }
}

const answerGs1QuestionsPrompt = ai.definePrompt({
  name: 'answerGs1QuestionsPrompt',
  input: {schema: AnswerGs1QuestionsInputSchema},
  output: {schema: AnswerGs1QuestionsOutputSchema},
  prompt: `You are an AI assistant that answers questions about GS1 standards documents based *only* on the provided content.

Here is the content from the document(s) you should use:
{{#each documentChunks}}
---
Source Document: "{{this.sourceName}}"
{{#if this.pageNumber}}Page: {{this.pageNumber}}{{/if}}
{{#if this.sectionTitle}}Section: "{{this.sectionTitle}}"{{/if}}

Content Snippet:
{{{this.content}}}
---
{{/each}}

Question: {{{question}}}

Based solely on the provided content snippets:
1. Answer the question clearly and concisely.
2. If your answer draws from specific snippets, try to implicitly refer to the source (e.g., "According to [sourceName]...").
3. Populate the 'citedSources' field in your output with a list of the document chunks you primarily used to formulate your answer. Each item in 'citedSources' should include the 'sourceName', 'pageNumber' (if available), and 'sectionTitle' (if available) from the input chunks. If multiple snippets contributed, list all primary ones. If the answer is general or synthesized from many snippets, you might cite the most representative ones or leave 'citedSources' empty if no specific snippet is overwhelmingly dominant.
4. Provide a list of 'reasoningSteps' outlining your thought process to arrive at the answer. For example:
   - "Identified keywords in the question: [keywords]"
   - "Scanned document chunks for relevance to these keywords."
   - "Found relevant information in chunk from '{{documentChunks.0.sourceName}}' (Page {{documentChunks.0.pageNumber}})."
   - "Synthesized the answer based on this information."

Answer:`, 
});

// Previous flow definition removed as the exported function now contains the logic and error handling.
// const answerGs1QuestionsFlow = ai.defineFlow( ... );
// This is a common pattern if the exported function IS the flow execution entry point.
// Alternatively, one could keep answerGs1QuestionsFlow and have answerGs1Questions call it,
// but for simplicity and direct error handling, this combined approach is used.
