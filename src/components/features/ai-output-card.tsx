
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { FeedbackButtons } from "./feedback-buttons";
import { OutputActions } from "./output-actions";
import type { ExplainableOutput } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AiOutputCardProps<T> {
  title: string;
  data: T;
  renderOutput: (data: T) => React.ReactNode;
  explainability?: ExplainableOutput;
  isLoading?: boolean;
  error?: string | null;
}

export function AiOutputCard<T>({
  title,
  data,
  renderOutput,
  explainability,
  isLoading,
  error,
}: AiOutputCardProps<T>) {
  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Processing your request...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{title} - Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground bg-destructive p-3 rounded-md">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return null; // Or some placeholder if no data yet but not loading/error
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {explainability?.confidenceScore && (
          <CardDescription>
            Confidence: {typeof explainability.confidenceScore === 'number' ? explainability.confidenceScore.toFixed(2) : explainability.confidenceScore}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-auto max-h-[400px] pr-4">
         <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderOutput(data)}
          </div>
        </ScrollArea>
        
        {(explainability?.reasoningSteps || explainability?.modelEvaluationMetrics) && (
          <>
            <Separator className="my-4" />
            <Accordion type="single" collapsible className="w-full">
              {explainability.reasoningSteps && explainability.reasoningSteps.length > 0 && (
                <AccordionItem value="reasoning">
                  <AccordionTrigger>Reasoning Steps</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {explainability.reasoningSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              {explainability.modelEvaluationMetrics && Object.keys(explainability.modelEvaluationMetrics).length > 0 && (
                 <AccordionItem value="metrics">
                  <AccordionTrigger>Model Evaluation Metrics</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(explainability.modelEvaluationMetrics).map(([key, value]) => (
                        <li key={key}><strong>{key}:</strong> {value}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <FeedbackButtons />
        <OutputActions dataToExport={data} />
      </CardFooter>
    </Card>
  );
}
