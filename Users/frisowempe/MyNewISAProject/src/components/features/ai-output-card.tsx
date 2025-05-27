
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { FeedbackButtons } from "./feedback-buttons";
import { OutputActions } from "./output-actions";
import type { ExplainableOutput } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Info } from "lucide-react"; // Added AlertTriangle
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


interface AiOutputCardProps<T> {
  title: string;
  data: T | null; // Allow data to be null initially or on error
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
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 shrink-0" /> 
            {title} - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground bg-destructive p-3 rounded-md">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    // This case handles when not loading, no error, but no data (e.g., initial state before first submission)
    // It might be better for the parent component (ClientAiForm) to control whether to render this card at all
    // For now, returning null is a safe default if there's truly nothing to show.
    return null; 
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
                  <AccordionTrigger className="text-sm">
                    Model Evaluation Metrics
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 ml-2 text-muted-foreground cursor-help shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          <p>These are simulated metrics for demonstration. Actual metrics would involve rigorous offline and online evaluation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(explainability.modelEvaluationMetrics).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-semibold">{key}:</span>{' '}
                          {typeof value === 'string' || typeof value === 'number' ? (
                            value
                          ) : (
                            // If value is a JSX element (like the Tooltip for research page)
                            React.isValidElement(value) ? value : String(value)
                          )}
                        </li>
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
