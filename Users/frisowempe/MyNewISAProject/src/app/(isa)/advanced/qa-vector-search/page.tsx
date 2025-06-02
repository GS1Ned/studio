
"use client";

import { z } from "zod";
import Image from "next/image";
import { ClientAiForm } from "@/components/features/client-ai-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleAnswerGs1QuestionsWithVectorSearch } from "@/lib/actions/ai-actions";
import type { AnswerGs1QuestionsWithVectorSearchOutput, ExplainableOutput } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookText, Info, DatabaseZap } from "lucide-react";

const qaVectorSearchFormSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters."),
  topK: z.string().optional().refine(val => val === undefined || val === "" || /^\d+$/.test(val), {
    message: "Top K must be a positive integer if provided.",
  }).transform(val => val ? parseInt(val, 10) : undefined),
});
type QaVectorSearchFormValues = z.infer<typeof qaVectorSearchFormSchema>;

export default function QAVectorSearchPage() {
  const renderFormFields = (form: any) => (
    <>
      <FormField
        control={form.control}
        name="question"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Question</FormLabel>
            <FormControl>
              <Input placeholder="e.g., What is the specification for GTIN allocation?" {...field} />
            </FormControl>
            <FormDescription>
              The AI will use a simulated vector search to find relevant document chunks to answer your question.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="topK"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Chunks (Top K - Optional)</FormLabel>
            <FormControl>
              <Input type="text" inputMode="numeric" placeholder="e.g., 5 (default)" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : e.target.value)} />
            </FormControl>
            <FormDescription>
              How many relevant document chunks the vector search should retrieve (simulated).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderOutput = (data: AnswerGs1QuestionsWithVectorSearchOutput) => (
    <div className="space-y-4">
      <p className="whitespace-pre-wrap">{data.answer}</p>
      {typeof data.retrievedChunksCount === 'number' && (
        <div className="text-xs text-muted-foreground flex items-center pt-2">
          <DatabaseZap className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          Simulated vector search retrieved {data.retrievedChunksCount} chunk(s) to synthesize this answer.
        </div>
      )}
      {data.citedSources && data.citedSources.length > 0 && (
        <div className="pt-2">
          <h4 className="font-semibold text-sm mb-2 flex items-center">
            <BookText className="w-4 h-4 mr-2 text-muted-foreground" />
            Cited Sources (from Vector Search):
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.citedSources.map((source, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-normal">
                {source.sourceName}
                {source.pageNumber && `, p. ${source.pageNumber}`}
                {source.sectionTitle && ` (${source.sectionTitle})`}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const extractExplainability = (data: AnswerGs1QuestionsWithVectorSearchOutput): ExplainableOutput => {
    const metrics: Record<string, string | number | React.ReactNode> = { 
      "Vector Search Recall (Simulated)": (Math.random() * 0.15 + 0.80).toFixed(2),
      "Answer Relevance (Simulated)": (Math.random() * 0.15 + 0.75).toFixed(2),
    };
    if (typeof data.retrievedChunksCount === 'number') {
      metrics["Retrieved Chunks (Simulated)"] = data.retrievedChunksCount;
    }

    return {
      reasoningSteps: data.reasoningSteps || ["No reasoning steps provided by the AI."],
      confidenceScore: Math.random() * 0.2 + 0.7, // Simulated
      modelEvaluationMetrics: metrics,
    };
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Q&A with Vector Search (Conceptual)</CardTitle>
          <CardDescription className="flex flex-col gap-2">
            <span>
              Ask questions about GS1 standards. This interface uses an AI flow that conceptually
              retrieves relevant document chunks via a vector search before generating an answer.
            </span>
            <span className="text-xs text-muted-foreground flex items-center">
              <Info className="w-3 h-3 mr-1.5 shrink-0" />
              Note: The vector search and document chunk retrieval are currently MOCKED for demonstration.
            </span>
          </CardDescription>
        </CardHeader>
         <CardContent>
          <Image
            src="https://placehold.co/800x300.png"
            alt="Conceptual image for AI Document Q&A with Vector Search"
            width={800}
            height={300}
            className="rounded-lg object-cover w-full"
            data-ai-hint="search database"
            priority
          />
        </CardContent>
      </Card>

      <ClientAiForm<QaVectorSearchFormValues, AnswerGs1QuestionsWithVectorSearchOutput>
        formSchema={qaVectorSearchFormSchema}
        defaultValues={{ question: "", topK: undefined }}
        serverAction={handleAnswerGs1QuestionsWithVectorSearch}
        renderFormFields={renderFormFields}
        renderOutput={renderOutput}
        outputTitle="AI Answer (Vector Search)"
        formSubmitButtonText="Ask Question"
        extractExplainability={extractExplainability}
      />
    </div>
  );
}
