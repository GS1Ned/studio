
"use client";

import { z } from "zod";
import { ClientAiForm } from "@/components/features/client-ai-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { handleAnswerGs1Questions } from "@/lib/actions/ai-actions";
import type { AnswerGs1QuestionsOutput, ExplainableOutput } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookText } from "lucide-react";

// This schema matches the form fields on the page, not the AI flow's direct input.
// The transformation to documentChunks happens in the server action.
const qaFormSchema = z.object({
  documentContent: z.string().min(50, "Document content must be at least 50 characters."),
  question: z.string().min(5, "Question must be at least 5 characters."),
});
type QaFormValues = z.infer<typeof qaFormSchema>;

export default function QAPage() {
  const renderFormFields = (form: any) => ( // form type is UseFormReturn<QaFormValues>
    <>
      <FormField
        control={form.control}
        name="documentContent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GS1 Document Content</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Paste the content of the GS1 standards document here..."
                className="min-h-[200px] resize-y"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide the full text of the GS1 document you want to ask questions about. 
              The AI will treat this as a single document source.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="question"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Question</FormLabel>
            <FormControl>
              <Input placeholder="e.g., What is the specification for GTIN allocation?" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderOutput = (data: AnswerGs1QuestionsOutput) => (
    <div className="space-y-4">
      <p className="whitespace-pre-wrap">{data.answer}</p>
      {data.citedSources && data.citedSources.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center">
            <BookText className="w-4 h-4 mr-2 text-muted-foreground" />
            Cited Sources:
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
  
  const extractExplainability = (data: AnswerGs1QuestionsOutput): ExplainableOutput => {
    return {
      reasoningSteps: data.reasoningSteps || ["No reasoning steps provided by the AI."], // Use actual reasoning steps
      confidenceScore: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0 (still mocked)
      modelEvaluationMetrics: { "Fidelity": Math.random() * 0.2 + 0.75, "Robustness": Math.random() * 0.2 + 0.7 }, // Still mocked
    };
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">AI Document Q&amp;A</CardTitle>
          <CardDescription>
            Ask questions about GS1 standards documents. Provide the document content and your question below.
            The AI will use its knowledge and the provided text to give you an answer, citing sources and explaining its reasoning where possible.
          </CardDescription>
        </CardHeader>
      </Card>

      <ClientAiForm<QaFormValues, AnswerGs1QuestionsOutput>
        formSchema={qaFormSchema}
        defaultValues={{ documentContent: "", question: "" }}
        serverAction={handleAnswerGs1Questions}
        renderFormFields={renderFormFields}
        renderOutput={renderOutput}
        outputTitle="AI Answer"
        formSubmitButtonText="Ask Question"
        extractExplainability={extractExplainability}
      />
    </div>
  );
}
