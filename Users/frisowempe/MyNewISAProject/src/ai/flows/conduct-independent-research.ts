
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
  try {
    const {output} = await conductIndependentResearchPrompt(input);
    if (!output) {
      console.error('conductIndependentResearchPrompt did not return a valid output.');
      return {
        collectedInformation: 'Failed to collect information due to an internal AI model error. Please try again.',
        formulatedQuestions: [],
        sources: [],
      };
    }
    return output;
  } catch (error) {
    console.error("Error in conductIndependentResearch flow:", error);
    return {
      collectedInformation: "An unexpected error occurred during independent research. Please check the input or try again later.",
      formulatedQuestions: [],
      sources: []
    };
  }
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
    console.log(`[MOCK] Simulating web search for: ${input.query}`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 500)); 

    const querySpecificResultsBase = [
      { title: `Exploring ${input.query}: A Deep Dive`, link: `https://example.com/deep-dive-${input.query.replace(/\s+/g, "-").toLowerCase()}`, snippet: `This article offers a comprehensive examination of ${input.query}, covering its historical context, current applications, and future outlook. Key statistics and case studies are included.` },
      { title: `Common Misconceptions about ${input.query}`, link: `https://example.com/misconceptions-${input.query.replace(/\s+/g, "-").toLowerCase()}`, snippet: `Debunking prevalent myths surrounding ${input.query}. We address three common misunderstandings and provide factual clarifications with supporting evidence.` },
      { title: `Ethical Considerations of ${input.query}`, link: `https://example.com/ethics-${input.query.replace(/\s+/g, "-").toLowerCase()}`, snippet: `An analysis of the ethical implications associated with ${input.query}. This paper discusses potential biases, societal impacts, and regulatory challenges.` },
    ];
    
    const genericResultsBase = [
        { title: `Official Documentation for topics similar to ${input.query}`, link: `https://example.com/docs/related-to-${input.query.replace(/\s+/g, "-").toLowerCase()}`, snippet: `While no direct official documentation was found for '${input.query}', related standards and guidelines can be found here.` },
        { title: `Community Discussions on ${input.query}`, link: `https://example.com/forum/${input.query.replace(/\s+/g, "-").toLowerCase()}`, snippet: `A forum where experts and enthusiasts discuss ${input.query}. Contains user-generated content, questions, and answers.`},
        { title: `Research Papers mentioning ${input.query}`, link: `https://scholar.example.com/search?q=${input.query.replace(/\s+/g, "+").toLowerCase()}`, snippet: `A collection of academic papers and preprints that reference or study ${input.query}. Results may vary in relevance.`}
    ];
    
    let allPossibleResults = [...querySpecificResultsBase, ...genericResultsBase];
    // Shuffle to make results somewhat varied for different mock calls
    allPossibleResults.sort(() => 0.5 - Math.random());
        
    const numResults = Math.max(1, Math.floor(Math.random() * 3) + 1); 
    const searchResults: z.infer<typeof SearchResultItemSchema>[] = allPossibleResults.slice(0, numResults);
    
    return { searchResults };
  }
);

const conductIndependentResearchPrompt = ai.definePrompt({
  name: 'conductIndependentResearchPrompt',
  input: {schema: ConductIndependentResearchInputSchema},
  output: {schema: ConductIndependentResearchOutputSchema},
  tools: [researchTool],
  prompt: `You are an AI assistant helping a standards expert conduct independent research.

The expert is researching the following topic: {{{topic}}}

Here's an initial research question, if provided: {{{researchQuestion}}}

Your goal is to:
1.  Formulate 2-3 diverse search queries based on the topic and initial research question. Ensure the queries are distinct to cover different angles.
2.  For each query, use the webSearch tool to find relevant information. You should analyze the 'title', 'link', and 'snippet' of each search result provided by the tool.
3.  Synthesize the information gathered from *all* search results into a coherent 'collectedInformation' summary. Focus on extracting key facts, insights, and potential areas of further investigation. If a search yields no relevant results, note that.
4.  Based on the synthesized information and any gaps identified, formulate 2-4 insightful 'formulatedQuestions' aimed at guiding further research or data collection. These questions should be distinct and probe different aspects of the topic.
5.  Extract and list key 'sources' from the search results that appear most relevant and authoritative. For each source, provide its 'title' and 'url' as found in the search results. Prioritize unique URLs.

Process for using the webSearch tool:
{{#if researchQuestion}}
- First search query: Use the initial '{{{researchQuestion}}}' directly or a close variation.
- Subsequent search queries: Based on '{{{topic}}}' and initial findings, generate 1-2 more distinct queries to broaden or deepen the research. Try different keywords or phrasing.
{{else}}
- Generate 2-3 distinct search queries based on '{{{topic}}}' to explore different facets of it. For example, if the topic is "XYZ standard", queries could be "benefits of XYZ standard", "challenges in XYZ standard implementation", "XYZ standard and related technologies".
{{/if}}

When synthesizing 'collectedInformation':
- Combine insights from all search result snippets. If a search result snippet is not relevant, discard it.
- Aim for a comprehensive yet concise summary of what was found.
- Highlight any conflicting information or areas requiring further clarification.
- If no useful information is found across all searches, explicitly state that.

When formulating 'formulatedQuestions':
- These should be actionable questions that can guide the next steps of research.
- They should aim to fill gaps or explore interesting avenues identified from the collected information.
- If little information was found, some questions might focus on how to find better information sources.

When listing 'sources':
- For each source, provide its 'title' and 'url' as found in the search results.
- Avoid duplicate URLs. If multiple search results point to the same core information, try to cite the most comprehensive or authoritative one.
- If a search result provided no useful information, do not list it as a source.

Output the results in the specified JSON format.
`,
});

// Previous flow definition removed for brevity and direct error handling in exported function
// const conductIndependentResearchFlow = ai.defineFlow( ... );
