
"use server";

import {
  AnalyzeStandardsInputSchema,
  ConductIndependentResearchInputSchema,
  NaturalLanguageToFormalDescriptionInputSchema,
  DetectStandardErrorsInputSchema,
  AnswerGs1QuestionsWithVectorSearchInputSchema, 
  DocumentChunkSchema
} from "@/ai/schemas"; 

import {
  answerGs1Questions,
  type AnswerGs1QuestionsInput, 
  type AnswerGs1QuestionsOutput,
  analyzeStandards,
  type AnalyzeStandardsInput,
  type AnalyzeStandardsOutput,
  conductIndependentResearch,
  type ConductIndependentResearchInput,
  type ConductIndependentResearchOutput,
  naturalLanguageToFormalDescription,
  type NaturalLanguageToFormalDescriptionInput,
  type NaturalLanguageToFormalDescriptionOutput,
  detectStandardErrors,
  type DetectStandardErrorsInput,
  type DetectStandardErrorsOutput,
  answerGs1QuestionsWithVectorSearch, 
  type AnswerGs1QuestionsWithVectorSearchInput, 
  type AnswerGs1QuestionsWithVectorSearchOutput, 
} from "@/ai/flows"; 
import { z } from "zod";

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Schema for the form data coming from the client-side Q&A page
const QaPageFormSchema = z.object({
  documentContent: z.string().min(50, "Document content must be at least 50 characters."),
  sourceName: z.string().optional(),
  pageNumber: z.string().optional().refine(val => val === undefined || val === "" || /^\d+$/.test(val), {
    message: "Page number must be a positive integer if provided.",
  }),
  sectionTitle: z.string().optional(),
  question: z.string().min(5, "Question must be at least 5 characters."),
});
type QaPageFormValues = z.infer<typeof QaPageFormSchema>;


export async function handleAnswerGs1Questions(
  clientInput: QaPageFormValues // Input comes from the form
): Promise<ActionResult<AnswerGs1QuestionsOutput>> {
  try {
    // Validate the client input against the form schema first
    const validatedClientInput = QaPageFormSchema.parse(clientInput);

    let pageNum: number | undefined = undefined;
    if (validatedClientInput.pageNumber && validatedClientInput.pageNumber.trim() !== "") {
      const parsed = parseInt(validatedClientInput.pageNumber, 10);
      if (!isNaN(parsed)) {
        pageNum = parsed;
      }
    }

    // Transform client input to the flow's expected input structure
    const flowInput: AnswerGs1QuestionsInput = {
      question: validatedClientInput.question,
      documentChunks: [
        {
          content: validatedClientInput.documentContent,
          sourceName: validatedClientInput.sourceName?.trim() || "Provided Document",
          pageNumber: pageNum,
          sectionTitle: validatedClientInput.sectionTitle?.trim() || undefined,
        },
      ],
    };
    
    // The flow itself will validate flowInput against AnswerGs1QuestionsInputSchema (defined in schemas.ts)
    const result = await answerGs1Questions(flowInput);
    return { success: true, data: result };
  } catch (e: any) {
    console.error("Error in handleAnswerGs1Questions:", e);
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred while processing your Q&A request. Please try again." };
  }
}

export async function handleAnalyzeStandards(
  input: AnalyzeStandardsInput
): Promise<ActionResult<AnalyzeStandardsOutput>> {
  try {
    const validatedInput = AnalyzeStandardsInputSchema.parse(input);
    const result = await analyzeStandards(validatedInput);
    return { success: true, data: result };
  } catch (e: any) {
    console.error("Error in handleAnalyzeStandards:", e);
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred while analyzing the standards document. Please try again." };
  }
}

export async function handleConductIndependentResearch(
  input: ConductIndependentResearchInput
): Promise<ActionResult<ConductIndependentResearchOutput>> {
  try {
    const validatedInput = ConductIndependentResearchInputSchema.parse(input);
    const result = await conductIndependentResearch(validatedInput);
    return { success: true, data: result };
  } catch (e: any) {
    console.error("Error in handleConductIndependentResearch:", e);
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred during independent research. Please try again." };
  }
}

export async function handleNaturalLanguageToFormalDescription(
  input: NaturalLanguageToFormalDescriptionInput
): Promise<ActionResult<NaturalLanguageToFormalDescriptionOutput>> {
  try {
    const validatedInput = NaturalLanguageToFormalDescriptionInputSchema.parse(input);
    const result = await naturalLanguageToFormalDescription(validatedInput);
    return { success: true, data: result };
  } catch (e: any) {
    console.error("Error in handleNaturalLanguageToFormalDescription:", e);
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred while transforming the description. Please try again." };
  }
}

export async function handleDetectStandardErrors(
  input: DetectStandardErrorsInput
): Promise<ActionResult<DetectStandardErrorsOutput>> {
  try {
    const validatedInput = DetectStandardErrorsInputSchema.parse(input);
    const result = await detectStandardErrors(validatedInput);
    return { success: true, data: result };
  } catch (e: any) {
    console.error("Error in handleDetectStandardErrors:", e);
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred while detecting errors. Please try again." };
  }
}

export async function handleAnswerGs1QuestionsWithVectorSearch(
  input: AnswerGs1QuestionsWithVectorSearchInput
): Promise<ActionResult<AnswerGs1QuestionsWithVectorSearchOutput>> {
  try {
    const validatedInput = AnswerGs1QuestionsWithVectorSearchInputSchema.parse(input);
    const result = await answerGs1QuestionsWithVectorSearch(validatedInput);
    return { success: true, data: result };
  } catch (e: any) {
    console.error("Error in handleAnswerGs1QuestionsWithVectorSearch:", e);
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred during the advanced Q&A request. Please try again." };
  }
}
