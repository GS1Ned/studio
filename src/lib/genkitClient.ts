import { AnswerGs1QuestionsWithVectorSearchInputSchema } from '@/ai/schemas';
import { AnswerGs1QuestionsWithVectorSearchOutputSchema } from '@/ai/flows/answer-gs1-questions-with-vector-search';
import { z } from 'zod';

async function callFlow<TInput extends object, TOutput>(name: string, input: TInput, schema: z.Schema<TOutput>): Promise<TOutput> {
  const res = await fetch(`/api/genkit/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`Genkit request failed with status ${res.status}`);
  }
  const data = await res.json();
  return schema.parse(data);
}

export const genkitClient = {
  answerGs1QuestionsWithVectorSearch: (input: z.infer<typeof AnswerGs1QuestionsWithVectorSearchInputSchema>) =>
    callFlow('answerGs1QuestionsWithVectorSearch', input, AnswerGs1QuestionsWithVectorSearchOutputSchema),
};

