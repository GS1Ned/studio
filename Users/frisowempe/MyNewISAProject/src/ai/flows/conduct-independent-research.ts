
'use server';

/**
 * @fileOverview An AI agent that conducts independent research to collect additional information and formulate research questions.
 *
 * - conductIndependentResearch - A function that handles the independent research process.
 * - ConductIndependentResearchInput - The input type for the conductIndependentResearch function.
 * - ConductIndependentResearchOutput - The return type for the conductIndependentResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ConductIndependentResearchInputSchema } from '@/ai/schemas';

export type ConductIndependentResearchInput = z.infer<
  typeof ConductIndependentResearchInputSchema
>;

const SearchResultItemSchema = z.object({
  title: z.string().describe('The title of the search result.'),
  link: z.string().url().describe('The URL of the search result.'),
  snippet: z.string().describe('A short snippet or description of the search result content.'),
});

const WebSearchOutputSchema = z.object({
  searchResults: z.array(SearchResultItemSchema).describe('An array of structured search results.'),
});

const ConductIndependentResearchOutputSchema = z.object({
  collectedInformation: z
    .string()
    .describe('The additional information collected from independent research, synthesized from search results.'),
  formulatedQuestions: z
    .array(z.string())
    .describe('The formulated research questions aimed at collecting the right data and identifying the right sources.'),
  sources: z
    .array(
      z.object({
        title: z.string().describe('The title of the identified source document or page.'),
        url: z.string().url().describe('The URL of the identified source.'),
      })
    )
    .describe('The identified sources for the collected information, derived from search results.'),
});
export type ConductIndependentResearchOutput = z.infer<
  typeof ConductIndependentResearchOutputSchema
>;

export async function conductIndependentResearch(
  input: ConductIndependentResearchInput
): Promise<ConductIndependentResearchOutput> {
  return conductIndependentResearchFlow(input);
}

const researchTool = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Conducts a web search to find relevant information based on a query. Returns a list of search results including title, link, and snippet for each.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: WebSearchOutputSchema,
  },
  async (input) => {
    // Placeholder implementation for web search.
    // In a real implementation, this would call an external search API (e.g., Google Custom Search API).
    // An API key for the search service would be required and managed securely (e.g., via Google Secret Manager).
    console.log(`Simulating web search for: ${input.query}`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 700)); // Simulate API call delay

    // Example simulated structured results
    const possibleResults = [
      { title: `Comprehensive Overview of ${input.query}`, link: `https://example.com/overview-${input.query.replace(/\s+/g, "-")}`, snippet: `An in-depth article discussing various aspects of ${input.query}, including history and current trends.` },
      { title: `Key Data Points for ${input.query}`, link: `https://example.com/data-${input.query.replace(/\s+/g, "-")}`, snippet: `Statistical data and key figures related to ${input.query}. Updated quarterly.` },
      { title: `Understanding ${input.query} Challenges`, link: `https://example.com/challenges-${input.query.replace(/\s+/g, "-")}`, snippet: `This report explores common challenges and solutions when dealing with ${input.query}.` },
      { title: `No specific official documentation found for '${input.query}'`, link: `https://example.com/search-generic?q=${input.query.replace(/\s+/g, "+")}`, snippet: `While no direct official documentation was found, this link provides broader search results that might be helpful.` },
    ];
    
    // Return a random subset of results to simulate variability
    const numResults = Math.floor(Math.random() * 3) + 1; // 1 to 3 results
    const searchResults = Array.from({ length: numResults }, () => possibleResults[Math.floor(Math.random() * possibleResults.length)]);
    
    return { searchResults };
  }
);

const prompt = ai.definePrompt({
  name: 'conductIndependentResearchPrompt',
  input: {schema: ConductIndependentResearchInputSchema},
  output: {schema: ConductIndependentResearchOutputSchema},
  tools: [researchTool],
  prompt: `You are an AI assistant helping a standards expert conduct independent research.

The expert is researching the following topic: {{{topic}}}

Here's an initial research question, if provided: {{{researchQuestion}}}

Your goal is to:
1.  Formulate 2-3 diverse search queries based on the topic and initial research question.
2.  For each query, use the webSearch tool to find relevant information.
3.  Synthesize the information gathered from all search results into a coherent 'collectedInformation' summary.
4.  Based on the synthesized information and any gaps identified, formulate 2-4 insightful 'formulatedQuestions' aimed at guiding further research or data collection.
5.  Extract and list key 'sources' (title and URL) from the search results that appear most relevant and authoritative. Prioritize unique sources.

Process for using the webSearch tool:
{{#if researchQuestion}}
- First search query: Use the initial '{{{researchQuestion}}}' directly or a close variation.
- Subsequent search queries: Based on '{{{topic}}}' and initial findings, generate 2 more queries to broaden or deepen the research.
{{else}}
- Generate 2-3 distinct search queries based on '{{{topic}}}' to explore different facets of it.
{{/if}}

When synthesizing 'collectedInformation':
- Combine insights from all search result snippets.
- Aim for a comprehensive yet concise summary of what was found.

When formulating 'formulatedQuestions':
- These should be actionable questions that can guide the next steps of research.
- They should aim to fill gaps or explore interesting avenues identified from the collected information.

When listing 'sources':
- For each source, provide its 'title' and 'url' as found in the search results.
- Avoid duplicate URLs.

Output the results in the specified JSON format.
`,
});

const conductIndependentResearchFlow = ai.defineFlow(
  {
    name: 'conductIndependentResearchFlow',
    inputSchema: ConductIndependentResearchInputSchema,
    outputSchema: ConductIndependentResearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    