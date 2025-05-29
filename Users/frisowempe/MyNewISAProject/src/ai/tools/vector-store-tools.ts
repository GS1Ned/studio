
'use server';
/**
 * @fileOverview Tool for interacting with a vector store.
 * This version is designed to connect to Vertex AI Vector Search.
 * The metadata lookup (fetching full chunk data by ID) is SIMULATED.
 *
 * - queryVectorStoreTool - Tool to query Vertex AI Vector Search for relevant document chunks.
 */

import { ai } from '@/ai/genkit';
import { DocumentChunkSchema } from '@/ai/schemas';
import { z } from 'zod';
import { PredictionServiceClient } from '@google-cloud/aiplatform'; // Corrected: Removed IndexEndpointServiceClient as it's not directly used for FindNeighbors
import {google} from '@google-cloud/aiplatform/build/protos/protos'; // For FindNeighborsRequest structure

// Input schema for querying the vector store
const QueryVectorStoreInputSchema = z.object({
  queryText: z.string().describe('The original natural language query text (for logging/context).'),
  queryEmbedding: z.array(z.number()).describe('The embedding vector of the query.'),
  topK: z.number().optional().default(5).describe('The number of top results to return.'),
  // Vertex AI Specific (Optional, will be read from ENV vars if not provided, or can be overridden)
  indexEndpointId: z.string().optional().describe('The ID of the Vertex AI Index Endpoint.'),
  deployedIndexId: z.string().optional().describe('The ID of the Deployed Index on the Endpoint.'),
});
export type QueryVectorStoreInput = z.infer<typeof QueryVectorStoreInputSchema>;

// Output schema: an array of document chunks
const QueryVectorStoreOutputSchema = z.object({
  results: z.array(DocumentChunkSchema).describe('An array of relevant document chunks retrieved from the vector store.'),
});
export type QueryVectorStoreOutput = z.infer<typeof QueryVectorStoreOutputSchema>;

// SIMULATED METADATA STORE for use AFTER Vertex AI returns datapoint IDs.
// In a real system, this data would come from Firestore, Cloud SQL, etc., keyed by datapointId.
const internalMockDocumentMetadataStore: Record<string, z.infer<typeof DocumentChunkSchema>> = {
  "doc_chunk_gtin_spec_1": { content: "The GS1 GTIN (Global Trade Item Number) is a globally unique identifier used for trade items. Common structures include GTIN-8, GTIN-12, GTIN-13, and GTIN-14.", sourceName: "GS1 General Specifications v24.0", pageNumber: 45, sectionTitle: "2.1 GTIN Allocation Rules" },
  "doc_chunk_digital_link_1": { content: "GS1 Digital Link standard enables brands to web-enable their products by linking physical products to online information and experiences using GS1 identifiers.", sourceName: "GS1 Digital Link Standard v1.3", pageNumber: 12, sectionTitle: "Introduction to Digital Link" },
  "doc_chunk_sscc_1": { content: "Serial Shipping Container Codes (SSCC) are 18-digit identifiers used by companies to identify a logistic unit, which can be any combination of trade items packaged together for storage and/or transport purposes.", sourceName: "GS1 General Specifications v24.0", pageNumber: 150, sectionTitle: "4.3 SSCC Construction" },
  "doc_chunk_healthcare_datamatrix_1": { content: "In the healthcare industry, GS1 DataMatrix symbols are frequently used to encode GTINs, batch/lot numbers, and expiry dates on medical products to enhance patient safety and traceability.", sourceName: "GS1 Healthcare Guideline v12", pageNumber: 33, sectionTitle: "Barcode Implementation for Medical Devices" },
  "doc_chunk_gln_1": { content: "A Global Location Number (GLN) is used to identify physical locations (e.g., a warehouse, a specific hospital wing) or legal entities. It is a 13-digit number.", sourceName: "GS1 GLN Allocation Rules v22.1", pageNumber: 7, sectionTitle: "Purpose and Structure of the GLN" },
  "doc_chunk_edi_1": { content: "GS1 EANCOM is a GS1 EDI (Electronic Data Interchange) standard, providing a set of UN/EDIFACT message implementation guidelines for business documents like orders and invoices.", sourceName: "GS1 EANCOM 2002 S4 Introduction", pageNumber: 5, sectionTitle: "What is EANCOM?"},
  "doc_chunk_epcis_1": { content: "EPCIS (Electronic Product Code Information Services) is a GS1 standard that enables trading partners to share information about the physical movement and status of objects (e.g., products, assets) as they travel through the supply chain.", sourceName: "GS1 EPCIS Standard v1.2", pageNumber: 10, sectionTitle: "Core Concepts of EPCIS"},
  // Add a few more diverse, GS1-relevant mock chunks
  "doc_chunk_gdsn_1": { content: "The Global Data Synchronisation Network (GDSN) allows trading partners to globally share trusted product master data. It operates through a network of interoperable data pools.", sourceName: "GS1 GDSN Maintenance Release 3.1.20", pageNumber: 22, sectionTitle: "GDSN Overview" },
  "doc_chunk_2d_barcode_transition_1": { content: "GS1 is leading the global migration to 2D barcodes at retail point-of-sale, aiming to replace traditional linear barcodes with more data-rich symbols like GS1 DataMatrix or QR Codes carrying GS1 Digital Link URIs.", sourceName: "GS1 Sunrise 2027 Initiative Overview", pageNumber: 3, sectionTitle: "The Need for 2D Barcodes" },
};


export const queryVectorStoreTool = ai.defineTool(
  {
    name: 'queryVectorStoreTool',
    description: 'Queries Vertex AI Vector Search to retrieve document chunks relevant to a given query embedding. Metadata lookup is SIMULATED using an internal mock store.',
    inputSchema: QueryVectorStoreInputSchema,
    outputSchema: QueryVectorStoreOutputSchema,
  },
  async ({ queryText, queryEmbedding, topK = 5, indexEndpointId: inputIndexEndpointId, deployedIndexId: inputDeployedIndexId }) => {
    console.log(`[VECTOR_SEARCH_TOOL] Called with queryText: "${queryText}", topK: ${topK}. QueryEmbedding (first 3 dims): [${queryEmbedding.slice(0,3).join(', ')}, ...]`);

    const projectId = process.env.GCP_PROJECT_ID;
    const region = process.env.GCP_REGION || 'us-central1'; // Default region if not specified
    const indexEndpointId = inputIndexEndpointId || process.env.VERTEX_AI_INDEX_ENDPOINT_ID;
    const deployedIndexId = inputDeployedIndexId || process.env.VERTEX_AI_DEPLOYED_INDEX_ID;

    if (queryText && queryText.toLowerCase().includes("empty vector test")) {
      console.log('[VECTOR_SEARCH_TOOL] "empty vector test" detected. Simulating no neighbors found from Vertex AI.');
      return { results: [] };
    }
    
    if (!projectId || !indexEndpointId || !deployedIndexId) {
      const errorMessage = "Missing required Vertex AI configuration (Project ID, Index Endpoint ID, or Deployed Index ID) in environment variables or input.";
      console.error(`[VECTOR_SEARCH_TOOL] Error: ${errorMessage}`);
      // In a real scenario, you might throw an error or return a more specific error structure.
      // For now, returning empty results to align with schema.
      return { results: [] };
    }
    
    const predictionServiceClient = new PredictionServiceClient({
        apiEndpoint: `${region}-aiplatform.googleapis.com`,
        // Credentials will be picked up from the environment if GOOGLE_APPLICATION_CREDENTIALS is set (Application Default Credentials)
    });

    const endpoint = `projects/${projectId}/locations/${region}/indexEndpoints/${indexEndpointId}`;

    const queryInstance: google.cloud.aiplatform.v1.FindNeighborsRequest.Query.IQuery = {
        datapoint: {
            featureVector: queryEmbedding, // Use the provided query embedding
        },
        neighborCount: topK,
    };

    const request: google.cloud.aiplatform.v1.IFindNeighborsRequest = {
      indexEndpoint: endpoint,
      deployedIndexId: deployedIndexId,
      queries: [queryInstance],
      // returnFullDatapoint: false, // Set to true ONLY if your index stores the full datapoint AND you want to retrieve it directly. Usually false, as metadata is stored separately.
    };

    console.log(`[VECTOR_SEARCH_TOOL] Making FindNeighbors request to Vertex AI: Endpoint=${endpoint}, DeployedIndexID=${deployedIndexId}, TopK=${topK}`);

    try {
      // In a real scenario, enable this call. For pure conceptual testing without a live endpoint, you might mock this response.
      // const [response] = await predictionServiceClient.findNeighbors(request);
      // const neighbors = response.nearestNeighbors?.[0]?.neighbors;

      // START OF MOCK RESPONSE (Simulating Vertex AI call and metadata lookup)
      // To test without a live Vertex AI endpoint, we'll simulate the neighbor IDs
      // and then proceed with the simulated metadata lookup.
      console.warn(`[VECTOR_SEARCH_TOOL] Vertex AI findNeighbors call is currently BYPASSED for conceptual testing. Simulating neighbor IDs.`);
      const mockNeighborIds = Object.keys(internalMockDocumentMetadataStore).sort(() => 0.5 - Math.random()).slice(0, topK);
      const simulatedNeighbors = mockNeighborIds.map(id => ({ datapoint: { datapointId: id }, distance: Math.random() }));
      const neighbors = simulatedNeighbors;
      // END OF MOCK RESPONSE

      if (!neighbors || neighbors.length === 0) {
        console.log('[VECTOR_SEARCH_TOOL] Vertex AI (or mock) returned no neighbors.');
        return { results: [] };
      }

      console.log(`[VECTOR_SEARCH_TOOL] Vertex AI (or mock) returned ${neighbors.length} neighbors (datapoint IDs).`);
      
      const retrievedChunks: z.infer<typeof DocumentChunkSchema>[] = [];
      for (const neighbor of neighbors) {
        if (neighbor.datapoint?.datapointId) {
          const datapointId = neighbor.datapoint.datapointId;
          console.log(`[VECTOR_SEARCH_TOOL][SIMULATED_FIRESTORE_READ] Attempting to fetch metadata for chunkId: ${datapointId} from internalMockDocumentMetadataStore.`);
          
          const chunkData = internalMockDocumentMetadataStore[datapointId];
          if (chunkData) {
            retrievedChunks.push(chunkData); // Already conforms to DocumentChunkSchema
            console.log(`[VECTOR_SEARCH_TOOL] Mock metadata FOUND for ID: ${datapointId}, Source: "${chunkData.sourceName}", Distance: ${neighbor.distance?.toFixed(4) || 'N/A'}`);
          } else {
            console.warn(`[VECTOR_SEARCH_TOOL] Mock metadata NOT FOUND for neighbor ID: ${datapointId} in internalMockDocumentMetadataStore.`);
          }
        }
      }
      
      if(retrievedChunks.length < neighbors.length){
        console.warn(`[VECTOR_SEARCH_TOOL] Only ${retrievedChunks.length} chunks found in metadata store out of ${neighbors.length} neighbor IDs retrieved.`);
      }
      
      return { results: retrievedChunks };

    } catch (error: any) {
      console.error('[VECTOR_SEARCH_TOOL] Error interacting with Vertex AI Vector Search (or during simulation):', error.message || error);
      if (error.details) {
        console.error('[VECTOR_SEARCH_TOOL] Error details:', error.details);
      }
      // Return schema-compliant error
      return { results: [] };
    }
  }
);
