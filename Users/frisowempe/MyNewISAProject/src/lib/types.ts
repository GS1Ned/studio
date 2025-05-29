
import type {
  AnswerGs1QuestionsInput,
  AnswerGs1QuestionsOutput,
  AnalyzeStandardsInput,
  AnalyzeStandardsOutput,
  ConductIndependentResearchInput,
  ConductIndependentResearchOutput,
  NaturalLanguageToFormalDescriptionInput,
  NaturalLanguageToFormalDescriptionOutput,
  DetectStandardErrorsInput,
  DetectStandardErrorsOutput,
  GenerateDocumentEmbeddingsInput,
  GenerateDocumentEmbeddingsOutput, // Output type already includes chunksWithEmbeddings
  DocumentChunkWithEmbedding, // Exporting the enhanced type
  AnswerGs1QuestionsWithVectorSearchInput,
  AnswerGs1QuestionsWithVectorSearchOutput,
  DemonstrateKgQueryInput,
  DemonstrateKgQueryOutput,
  ValidateIdentifierInput,
  ValidateIdentifierOutput,
  GS1IdentifierType, // Already exported from schemas via this file
} from "@/ai/flows"; // Ensure all flow types are exported from flows/index.ts

// Re-exporting for convenience, or define specific app-level types if needed
export type {
  AnswerGs1QuestionsInput,
  AnswerGs1QuestionsOutput,
  AnalyzeStandardsInput,
  AnalyzeStandardsOutput,
  ConductIndependentResearchInput,
  ConductIndependentResearchOutput,
  NaturalLanguageToFormalDescriptionInput,
  NaturalLanguageToFormalDescriptionOutput,
  DetectStandardErrorsInput,
  DetectStandardErrorsOutput,
  GenerateDocumentEmbeddingsInput,
  GenerateDocumentEmbeddingsOutput,
  DocumentChunkWithEmbedding, // Ensure this is exported
  AnswerGs1QuestionsWithVectorSearchInput,
  AnswerGs1QuestionsWithVectorSearchOutput,
  DemonstrateKgQueryInput,
  DemonstrateKgQueryOutput,
  ValidateIdentifierInput,
  ValidateIdentifierOutput,
  GS1IdentifierType,
};

export interface ExplainableOutput {
  reasoningSteps?: string[];
  confidenceScore?: number | string;
  modelEvaluationMetrics?: Record<string, string | number | React.ReactNode>; // Allow ReactNode for tooltips
  // Add other common explainability fields here
}

// Example usage for a combined output type
export type QAResultWithExplainability = AnswerGs1QuestionsOutput & ExplainableOutput;

export type AnalysisResultWithExplainability = AnalyzeStandardsOutput & ExplainableOutput;

export type NLToFormalResultWithExplainability = NaturalLanguageToFormalDescriptionOutput & ExplainableOutput;

export type ResearchResultWithExplainability = ConductIndependentResearchOutput & ExplainableOutput;

export type ErrorDetectionResultWithExplainability = DetectStandardErrorsOutput & ExplainableOutput;

export type AdvancedQAResultWithExplainability = AnswerGs1QuestionsWithVectorSearchOutput & ExplainableOutput;

export type KgDemoResultWithExplainability = DemonstrateKgQueryOutput & ExplainableOutput;

export type ValidationResultWithExplainability = ValidateIdentifierOutput & ExplainableOutput;

// No specific UI for embeddings yet, so no "WithExplainability" type needed for now.
// However, the GenerateDocumentEmbeddingsOutput type itself is useful.
