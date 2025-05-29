
// src/ai/flows/demonstrate-kg-query.ts
'use server';
/**
 * @fileOverview An AI agent that demonstrates querying a conceptual Knowledge Graph.
 *
 * - demonstrateKgQuery - A function that calls the KG query tool.
 * - DemonstrateKgQueryInput - The input type for the function.
 * - DemonstrateKgQueryOutput - The return type for the function (which is QueryKnowledgeGraphOutputSchema).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { DemonstrateKgQueryInputSchema } from '@/ai/schemas';
import { queryKnowledgeGraphTool, QueryKnowledgeGraphOutputSchema } from '@/ai/tools/knowledge-graph-tools';

export type DemonstrateKgQueryInput = z.infer<typeof DemonstrateKgQueryInputSchema>;
export type DemonstrateKgQueryOutput = z.infer<typeof QueryKnowledgeGraphOutputSchema>;

export async function demonstrateKgQuery(input: DemonstrateKgQueryInput): Promise<DemonstrateKgQueryOutput> {
  console.log(`[FLOW_KG_DEMO][INPUT] Query: "${input.queryString}"`);
  try {
    const flowOutput = await demonstrateKgQueryFlow(input);
    // The flow itself should return a schema-compliant object or throw an error that would be caught here.
    console.log(`[FLOW_KG_DEMO][SUCCESS] Successfully executed flow. Summary: ${flowOutput.summary}`);
    return flowOutput;
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error during KG query demonstration.';
    console.error('[FLOW_KG_DEMO][ERROR] Error in demonstrateKgQuery function:', errorMessage, error.stack);
    return { 
      summary: `An unexpected error occurred while demonstrating the KG query: ${errorMessage}`,
      matchedEntities: undefined,
      relatedInformation: undefined,
    };
  }
}

const demonstrateKgQueryFlow = ai.defineFlow(
  {
    name: 'demonstrateKgQueryFlow',
    inputSchema: DemonstrateKgQueryInputSchema,
    outputSchema: QueryKnowledgeGraphOutputSchema, // Output is the tool's output schema
  },
  async (flowInput) => {
    console.log(`[FLOW_KG_DEMO_INTERNAL] Calling queryKnowledgeGraphTool with query: "${flowInput.queryString}"`);
    
    const toolOutput = await queryKnowledgeGraphTool({ query: flowInput.queryString });

    if (!toolOutput) {
      console.error('[FLOW_KG_DEMO_INTERNAL][ERROR] queryKnowledgeGraphTool did not return a valid output (was null or undefined).');
      return { 
        summary: 'Error: The Knowledge Graph tool failed to provide any response.',
        matchedEntities: undefined,
        relatedInformation: undefined,
      };
    }
    console.log(`[FLOW_KG_DEMO_INTERNAL][SUCCESS] queryKnowledgeGraphTool returned output. Summary: ${toolOutput.summary}`);
    return toolOutput;
  }
);
