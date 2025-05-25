
"use client";

import { z } from "zod";
import { ClientAiForm } from "@/components/features/client-ai-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { handleDetectStandardErrors } from "@/lib/actions/ai-actions";
import type { DetectStandardErrorsOutput, ExplainableOutput } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

const errorDetectionFormSchema = z.object({
  documentContent: z.string().min(100, "Document content must be at least 100 characters for meaningful error detection."),
});
type ErrorDetectionFormValues = z.infer<typeof errorDetectionFormSchema>;

export default function ErrorDetectionPage() {
  const renderFormFields = (form: any) => ( // form type is UseFormReturn<ErrorDetectionFormValues>
    <FormField
      control={form.control}
      name="documentContent"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Standards Document Content</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Paste the full content of the standards document here. The AI will analyze it for errors, inconsistencies, ambiguities, and overlapping definitions."
              className="min-h-[300px] resize-y"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Provide the document text. The AI will try to identify potential issues and suggest corrections.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderOutput = (data: DetectStandardErrorsOutput) => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-2">Summary of Findings</h3>
        <p className="text-sm">{data.summary}</p>
      </div>
      {data.detectedIssues && data.detectedIssues.length > 0 ? (
        <div>
          <h3 className="font-semibold text-lg mb-3">Detected Issues</h3>
          <div className="space-y-4">
            {data.detectedIssues.map((issue, index) => (
              <Card key={`issue-${index}`} className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>Issue #{index + 1}: {issue.errorType}</span>
                    <Badge variant="outline" className="text-xs">{issue.errorType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong className="font-medium">Description:</strong> {issue.description}</p>
                  {issue.locationContext && (
                    <p><strong className="font-medium">Context:</strong> <em className="bg-muted p-1 rounded text-xs">"{issue.locationContext}"</em></p>
                  )}
                  {issue.suggestedCorrection && (
                    <Alert variant="default" className="mt-2">
                       <Lightbulb className="h-4 w-4" />
                      <AlertTitle className="font-medium text-primary">Suggested Correction</AlertTitle>
                      <AlertDescription>
                        {issue.suggestedCorrection}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No significant issues detected in the provided document content.</p>
      )}
    </div>
  );

  const extractExplainability = (data: DetectStandardErrorsOutput): ExplainableOutput => {
    // Placeholder: Real explainability data would come from the AI flow if supported
    return {
      reasoningSteps: [
        "Parsed and segmented document content.", 
        "Applied rule-based checks for common error patterns.",
        "Utilized language model to identify semantic inconsistencies and ambiguities.",
        "Cross-referenced definitions for overlaps.",
        "Synthesized findings into a structured report."
      ],
      confidenceScore: Math.random() * 0.20 + 0.75, // Random confidence between 0.75 and 0.95
      modelEvaluationMetrics: { 
        "Issue Recall": Math.random() * 0.15 + 0.70, // Simulated
        "Correction Precision": Math.random() * 0.20 + 0.65, // Simulated
        "False Positive Rate": (Math.random() * 0.1 + 0.05).toFixed(3) // Simulated low FP rate
      },
    };
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Error Detection and Correction</CardTitle>
          <CardDescription>
            This AI-powered tool analyzes standards documents to detect errors, inconsistencies, ambiguities,
            overlapping definitions, and formatting issues. It can also provide suggestions for corrections.
          </CardDescription>
        </CardHeader>
      </Card>

      <ClientAiForm<ErrorDetectionFormValues, DetectStandardErrorsOutput>
        formSchema={errorDetectionFormSchema}
        defaultValues={{ documentContent: "" }}
        serverAction={handleDetectStandardErrors}
        renderFormFields={renderFormFields}
        renderOutput={renderOutput}
        outputTitle="Error Detection Report"
        formSubmitButtonText="Detect Errors"
        extractExplainability={extractExplainability}
      />
    </div>
  );
}
