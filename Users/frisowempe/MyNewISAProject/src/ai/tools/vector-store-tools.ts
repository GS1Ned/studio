
'use server';
/**
 * @fileOverview Tool for interacting with a vector store.
 * This version is designed to connect to Vertex AI Vector Search.
 *
 * - queryVectorStoreTool - Tool to query Vertex AI Vector Search for relevant document chunks.
 */

import { ai } from '@/ai/genkit';
import { DocumentChunkSchema } from '@/ai/schemas';
import { z } from 'zod';
import { PredictionServiceClient, IndexEndpointServiceClient } from '@google-cloud/aiplatform';
import {google} from '@google-cloud/aiplatform/build/protos/protos'; // For FindNeighborsRequest structure

// Input schema for querying the vector store
const QueryVectorStoreInputSchema = z.object({
  queryText: z.string().describe('The original natural language query text (for logging/context).'),
  queryEmbedding: z.array(z.number()).describe('The embedding vector of the query.'),
  topK: z.number().optional().default(5).describe('The number of top results to return.'),
  // Vertex AI Specific (Optional, can be read from ENV vars if not provided)
  indexEndpointId: z.string().optional().describe('The ID of the Vertex AI Index Endpoint.'),
  deployedIndexId: z.string().optional().describe('The ID of the Deployed Index on the Endpoint.'),
});
export type QueryVectorStoreInput = z.infer<typeof QueryVectorStoreInputSchema>;

// Output schema: an array of document chunks
const QueryVectorStoreOutputSchema = z.object({
  results: z.array(DocumentChunkSchema).describe('An array of relevant document chunks retrieved from the vector store.'),
});
export type QueryVectorStoreOutput = z.infer<typeof QueryVectorStoreOutputSchema>;

// SIMULATED METADATA STORE: In a real system, this data would come from Firestore, Cloud SQL, etc.
// keyed by the ID returned from Vertex AI Vector Search.
const mockDocumentMetadataStore: Record<string, z.infer<typeof DocumentChunkSchema>> = {
  "doc_chunk_1": { content: "GS1 GTINs are globally unique identifiers for trade items. They can be 8, 12, 13, or 14 digits.", sourceName: "GS1 General Specifications v24.0", pageNumber: 45, sectionTitle: "2.1 GTIN Allocation Rules" },
  "doc_chunk_2": { content: "GS1 Digital Link allows brands to web-enable products using GS1 identifiers.", sourceName: "GS1 Digital Link v1.3", pageNumber: 12, sectionTitle: "Introduction" },
  "doc_chunk_3": { content: "SSCCs (Serial Shipping Container Codes) are used for logistic units and must be 18 digits.", sourceName: "GS1 General Specifications v24.0", pageNumber: 150, sectionTitle: "4.3 SSCC Construction" },
  "doc_chunk_4": { content: "DataMatrix symbols are often used in healthcare for encoding GTINs and other data on medical products.", sourceName: "GS1 Healthcare Guideline v12", pageNumber: 33, sectionTitle: "Barcode Implementation" },
  "doc_chunk_5": { content: "Global Location Numbers (GLNs) identify physical locations or legal entities within the supply chain.", sourceName: "GS1 GLN Allocation Rules", pageNumber: 7, sectionTitle: "Purpose of the GLN" },
};


export const queryVectorStoreTool = ai.defineTool(
  {
    name: 'queryVectorStoreTool',
    description: 'Queries Vertex AI Vector Search to retrieve document chunks relevant to a given query embedding. (Metadata lookup is SIMULATED)',
    inputSchema: QueryVectorStoreInputSchema,
    outputSchema: QueryVectorStoreOutputSchema,
  },
  async ({ queryText, queryEmbedding, topK = 5, indexEndpointId: inputIndexEndpointId, deployedIndexId: inputDeployedIndexId }) => {
    console.log(`[VECTOR_SEARCH_TOOL] Called with queryText: "${queryText}", topK: ${topK}`);

    const projectId = process.env.GCP_PROJECT_ID;
    const region = process.env.GCP_REGION || 'us-central1';
    const indexEndpointId = inputIndexEndpointId || process.env.VERTEX_AI_INDEX_ENDPOINT_ID;
    const deployedIndexId = inputDeployedIndexId || process.env.VERTEX_AI_DEPLOYED_INDEX_ID;

    if (!projectId || !indexEndpointId || !deployedIndexId) {
      const errorMessage = "Missing required Vertex AI configuration (Project ID, Index Endpoint ID, or Deployed Index ID) in environment variables or input.";
      console.error(`[VECTOR_SEARCH_TOOL] Error: ${errorMessage}`);
      // In a real scenario, you might throw an error or return a more specific error structure.
      // For now, returning empty results to align with schema.
      return { results: [] };
    }
    
    // This client is for making the actual FindNeighbors call to a *deployed index endpoint*
    const predictionServiceClient = new PredictionServiceClient({
        apiEndpoint: `${region}-aiplatform.googleapis.com`,
        // Credentials will be picked up from the environment if GOOGLE_APPLICATION_CREDENTIALS is set
    });

    const endpoint = `projects/${projectId}/locations/${region}/indexEndpoints/${indexEndpointId}`;

    const queryInstance: google.cloud.aiplatform.v1.FindNeighborsRequest.Query.IQuery = {
        datapoint: {
            featureVector: queryEmbedding,
        },
        neighborCount: topK,
        // You can add filtering here if your index supports it
        // stringFilters: [{ name: 'sourceName', allowTokens: ['GS1 General Specifications v24.0'] }]
    };

    const request: google.cloud.aiplatform.v1.IFindNeighborsRequest = {
      indexEndpoint: endpoint,
      deployedIndexId: deployedIndexId,
      queries: [queryInstance],
      // returnFullDatapoint: false, // Set to true if your index stores the full datapoint and you want to retrieve it
    };

    console.log(`[VECTOR_SEARCH_TOOL] Making FindNeighbors request to Vertex AI: ${JSON.stringify({endpoint, deployedIndexId, topK})}`);

    try {
      const [response] = await predictionServiceClient.findNeighbors(request);
      const neighbors = response.nearestNeighbors?.[0]?.neighbors;

      if (!neighbors || neighbors.length === 0) {
        console.log('[VECTOR_SEARCH_TOOL] Vertex AI returned no neighbors.');
        return { results: [] };
      }

      console.log(`[VECTOR_SEARCH_TOOL] Vertex AI returned ${neighbors.length} neighbors.`);
      
      const retrievedChunks: z.infer<typeof DocumentChunkSchema>[] = [];
      for (const neighbor of neighbors) {
        if (neighbor.datapoint?.datapointId) {
          // SIMULATED METADATA LOOKUP:
          // In a real system, use neighbor.datapoint.datapointId to fetch the full DocumentChunk
          // from Firestore, Cloud SQL, GCS, or wherever it's stored.
          const chunkData = mockDocumentMetadataStore[neighbor.datapoint.datapointId];
          if (chunkData) {
            retrievedChunks.push(chunkData);
            console.log(`[VECTOR_SEARCH_TOOL] Mock metadata found for ID: ${neighbor.datapoint.datapointId}, Distance: ${neighbor.distance}`);
          } else {
            console.warn(`[VECTOR_SEARCH_TOOL] No mock metadata found for neighbor ID: ${neighbor.datapoint.datapointId}`);
          }
        }
      }
      
      return { results: retrievedChunks };

    } catch (error: any) {
      console.error('[VECTOR_SEARCH_TOOL] Error calling Vertex AI Vector Search:', error.message || error);
      console.error('Error details:', error.details || 'No details available');
      // Return schema-compliant error
      return { results: [] };
    }
  }
);
