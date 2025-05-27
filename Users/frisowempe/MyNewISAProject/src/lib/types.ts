
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
  GenerateDocumentEmbeddingsOutput,
  AnswerGs1QuestionsWithVectorSearchInput, // Added import
  AnswerGs1QuestionsWithVectorSearchOutput // Added import
} from "@/ai/flows"; 

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
  AnswerGs1QuestionsWithVectorSearchInput, // Added export
  AnswerGs1QuestionsWithVectorSearchOutput // Added export
};

export interface ExplainableOutput {
  reasoningSteps?: string[];
  confidenceScore?: number | string;
  modelEvaluationMetrics?: Record<string, string | number>;
  // Add other common explainability fields here
}

// Example usage for a combined output type
export type QAResultWithExplainability = AnswerGs1QuestionsOutput & ExplainableOutput;

export type AnalysisResultWithExplainability = AnalyzeStandardsOutput & ExplainableOutput;

export type NLToFormalResultWithExplainability = NaturalLanguageToFormalDescriptionOutput & ExplainableOutput;

export type ResearchResultWithExplainability = ConductIndependentResearchOutput & ExplainableOutput;

export type ErrorDetectionResultWithExplainability = DetectStandardErrorsOutput & ExplainableOutput;

// No specific UI for embeddings yet, so no "WithExplainability" type needed for now.
// No specific UI for the conceptual vector search flow yet.
