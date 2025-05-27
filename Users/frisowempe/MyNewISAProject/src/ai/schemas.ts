// src/ai/schemas.ts
import { z } from 'zod';

// Schema for document chunks, reusable across flows
export const DocumentChunkSchema = z.object({
  content: z.string().describe('The text content of the chunk.'),
  sourceName: z.string().describe('The name or identifier of the source document for this chunk.'),
  pageNumber: z.number().optional().describe('The page number in the source document where this chunk originates.'),
  sectionTitle: z.string().optional().describe('The title of the section in the source document where this chunk originates.'),
});
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;


// Schemas previously defined in src/ai/flows/analyze-standards.ts
export const AnalyzeStandardsInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the standards document to analyze.'),
});

// Schemas previously defined in src/ai/flows/answer-gs1-questions.ts
export const AnswerGs1QuestionsInputSchema = z.object({
  question: z.string().describe('The question about the GS1 standards document.'),
  documentChunks: z.array(DocumentChunkSchema).min(1, "At least one document chunk must be provided.").describe('An array of document chunks, each containing content and source metadata.'),
});

// Schemas previously defined in src/ai/flows/conduct-independent-research.ts
export const ConductIndependentResearchInputSchema = z.object({
  topic: z.string().describe('The topic for independent research.'),
  researchQuestion: z
    .string()
    .optional()
    .describe('Optional initial research question to guide the research.'),
});

// Schemas previously defined in src/ai/flows/natural-language-to-formal-description.ts
export const NaturalLanguageToFormalDescriptionInputSchema = z.object({
  naturalLanguageDescription: z
    .string()
    .describe('A natural language description of a standard.'),
});

// Schema for src/ai/flows/detect-standard-errors.ts
export const DetectStandardErrorsInputSchema = z.object({
  documentContent: z
    .string()
    .min(100, "Document content must be at least 100 characters for meaningful error detection.")
    .describe('The content of the standards document to analyze for errors and inconsistencies.'),
});

// Schema for src/ai/flows/generate-document-embeddings.ts
export const GenerateDocumentEmbeddingsInputSchema = z.object({
  documentChunks: z.array(DocumentChunkSchema).min(1, "At least one document chunk must be provided.").describe('An array of document chunks to generate embeddings for.'),
});

// Schema for src/ai/flows/answer-gs1-questions-with-vector-search.ts
export const AnswerGs1QuestionsWithVectorSearchInputSchema = z.object({
  question: z.string().describe('The question to ask.'),
  topK: z.number().optional().default(5).describe('The number of document chunks to retrieve from the vector store.'),
  // Potentially add other filters here in the future, e.g., sourceNameFilter, dateFilter
});
export type AnswerGs1QuestionsWithVectorSearchInput = z.infer<typeof AnswerGs1QuestionsWithVectorSearchInputSchema>;
