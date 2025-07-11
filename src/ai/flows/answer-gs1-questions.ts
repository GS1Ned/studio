// src/ai/flows/answer-gs1-questions.ts
'use server';

/**
 * @fileOverview An AI agent that answers questions about GS1 standards documents.
 *
 * - answerGs1Questions - A function that answers questions about GS1 standards documents.
 * - AnswerGs1QuestionsInput - The input type for the answerGs1Questions function.
 * - AnswerGs1QuestionsOutput - The return type for the answerGs1Questions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnswerGs1QuestionsInputSchema } from '@/ai/schemas'; // Import schema object

// Type export remains, Zod object definition removed from here
export type AnswerGs1QuestionsInput = z.infer<typeof AnswerGs1QuestionsInputSchema>;

const AnswerGs1QuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the GS1 standards document.'),
});
export type AnswerGs1QuestionsOutput = z.infer<typeof AnswerGs1QuestionsOutputSchema>;

export async function answerGs1Questions(input: AnswerGs1QuestionsInput): Promise<AnswerGs1QuestionsOutput> {
  return answerGs1QuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerGs1QuestionsPrompt',
  input: {schema: AnswerGs1QuestionsInputSchema}, // Use imported schema object
  output: {schema: AnswerGs1QuestionsOutputSchema},
  prompt: `You are an AI assistant that answers questions about GS1 standards documents.

  You will be provided with a question and the content of a GS1 standards document.
  Your task is to answer the question based on the information in the document.

  Question: {{{question}}}
  Document Content: {{{documentContent}}}

  Answer:`, 
});

const answerGs1QuestionsFlow = ai.defineFlow(
  {
    name: 'answerGs1QuestionsFlow',
    inputSchema: AnswerGs1QuestionsInputSchema, // Use imported schema object
    outputSchema: AnswerGs1QuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
