
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
  AnswerGs1QuestionsWithVectorSearchInput,
  AnswerGs1QuestionsWithVectorSearchOutput,
  DemonstrateKgQueryInput, // Added import
  DemonstrateKgQueryOutput, // Added import
  ValidateIdentifierInput, // Added import
  ValidateIdentifierOutput, // Added import
} from "@/ai/flows";
import { GS1IdentifierType } from "./schemas";


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
  AnswerGs1QuestionsWithVectorSearchInput,
  AnswerGs1QuestionsWithVectorSearchOutput,
  DemonstrateKgQueryInput, // Added export
  DemonstrateKgQueryOutput, // Added export
  ValidateIdentifierInput, // Added export
  ValidateIdentifierOutput, // Added export
  GS1IdentifierType, // Added export
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
