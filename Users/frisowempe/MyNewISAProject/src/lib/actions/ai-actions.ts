
"use server";

import {
  AnswerGs1QuestionsInputSchema as ClientAnswerGs1QuestionsInputSchema, // For client-side form schema
  AnalyzeStandardsInputSchema,
  ConductIndependentResearchInputSchema,
  NaturalLanguageToFormalDescriptionInputSchema,
  DetectStandardErrorsInputSchema,
} from "@/ai/schemas"; 

import {
  answerGs1Questions,
  type AnswerGs1QuestionsInput, // This is the flow's input type (with documentChunks)
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
  question: z.string().min(5, "Question must be at least 5 characters."),
});
type QaPageFormValues = z.infer<typeof QaPageFormSchema>;


export async function handleAnswerGs1Questions(
  clientInput: QaPageFormValues // Input comes from the simple form
): Promise<ActionResult<AnswerGs1QuestionsOutput>> {
  try {
    // Validate the client input against the form schema first
    const validatedClientInput = QaPageFormSchema.parse(clientInput);

    // Transform client input to the flow's expected input structure
    const flowInput: AnswerGs1QuestionsInput = {
      question: validatedClientInput.question,
      documentChunks: [
        {
          content: validatedClientInput.documentContent,
          sourceName: "Provided Document", // Default source name for now
          // pageNumber and sectionTitle can be omitted as they are optional
        },
      ],
    };
    
    // The flow itself will validate flowInput against AnswerGs1QuestionsInputSchema (defined in schemas.ts)
    const result = await answerGs1Questions(flowInput);
    return { success: true, data: result };
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    console.error("Error in handleAnswerGs1Questions:", e);
    return { success: false, error: e.message || "An unexpected error occurred in Q&A processing." };
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
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred" };
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
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred" };
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
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred" };
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
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + e.errors.map(err => err.message).join(', ') };
    }
    return { success: false, error: e.message || "An unexpected error occurred" };
  }
}
