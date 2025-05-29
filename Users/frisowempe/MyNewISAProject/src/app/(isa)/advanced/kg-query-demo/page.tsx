
"use client";

import { z } from "zod";
import Image from "next/image";
import { ClientAiForm } from "@/components/features/client-ai-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleDemonstrateKgQuery } from "@/lib/actions/ai-actions";
import type { DemonstrateKgQueryOutput, ExplainableOutput } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Network, Info, ServerCrash } from "lucide-react"; // Removed BookOpen as it's not used
import { Badge } from "@/components/ui/badge";

const kgQueryFormSchema = z.object({
  queryString: z
    .string()
    .min(1, "Query string cannot be empty."),
});

type KgQueryFormValues = z.infer<typeof kgQueryFormSchema>;

export default function KgQueryDemoPage() {
  const renderFormFields = (form: any) => (
    <FormField
      control={form.control}
      name="queryString"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Knowledge Graph Query</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., GTIN, GS1 General Specifications, or 'empty kg test'"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Enter a query for the conceptual Knowledge Graph. (Mocked data)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderOutput = (data: DemonstrateKgQueryOutput) => {
    // Check for error summary first
    if (data.summary?.toLowerCase().includes("error occurred") || data.summary?.toLowerCase().includes("failed to provide")) {
      return (
         <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Query Error</AlertTitle>
          <AlertDescription>
            {data.summary}
          </AlertDescription>
        </Alert>
      );
    }

    const noMeaningfulData = 
        (!data.matchedEntities || data.matchedEntities.length === 0) &&
        (!data.relatedInformation?.entities || data.relatedInformation.entities.length === 0) &&
        (!data.relatedInformation?.relationships || data.relatedInformation.relationships.length === 0);

    if (noMeaningfulData && data.summary && !data.summary.toLowerCase().includes("found")) {
       // Handles cases where summary indicates no results (e.g., "No information found...")
       return (
        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>
            {data.summary}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (noMeaningfulData && !data.summary) {
      // Fallback for truly empty but non-error response
      return (
        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>No Specific Data Found</AlertTitle>
          <AlertDescription>
            The conceptual Knowledge Graph did not return specific entities or relationships for your query.
          </AlertDescription>
        </Alert>
      );
    }


    return (
      <div className="space-y-6">
        {data.summary && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Query Summary</AlertTitle>
            <AlertDescription>{data.summary}</AlertDescription>
          </Alert>
        )}

        {data.matchedEntities && data.matchedEntities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Matched Entities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.matchedEntities.map((entity) => (
                <Card key={entity.id} className="p-4 shadow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-base">{entity.label} <Badge variant="outline" className="ml-2 text-xs">{entity.type}</Badge></h4>
                    <p className="text-xs text-muted-foreground">ID: {entity.id}</p>
                  </div>
                  {entity.description && (
                    <p className="text-sm text-muted-foreground mt-1">{entity.description}</p>
                  )}
                  {entity.properties && Object.keys(entity.properties).length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium uppercase text-muted-foreground">Properties:</h5>
                      <ul className="list-disc pl-5 text-sm space-y-0.5 mt-1">
                        {Object.entries(entity.properties).map(([key, value]) => (
                          <li key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {data.relatedInformation && (data.relatedInformation.entities || data.relatedInformation.relationships) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.relatedInformation.entities && data.relatedInformation.entities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Related Entities:</h4>
                  <div className="space-y-3">
                  {data.relatedInformation.entities.map((entity) => (
                     <Card key={entity.id} className="p-3 shadow-sm bg-muted/50">
                       <div className="flex justify-between items-start">
                         <h5 className="font-semibold text-sm">{entity.label} <Badge variant="secondary" className="ml-2 text-xs">{entity.type}</Badge></h5>
                         <p className="text-xs text-muted-foreground">ID: {entity.id}</p>
                       </div>
                       {entity.description && (
                         <p className="text-xs text-muted-foreground mt-1">{entity.description}</p>
                       )}
                     </Card>
                  ))}
                  </div>
                </div>
              )}
              {data.relatedInformation.relationships && data.relatedInformation.relationships.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Relationships:</h4>
                   <div className="space-y-2">
                  {data.relatedInformation.relationships.map((rel, index) => (
                    <Card key={index} className="p-3 text-sm shadow-sm bg-muted/50">
                      <p>
                        <span className="font-semibold capitalize">{rel.direction}</span> relation of type <Badge variant="outline" className="text-xs">{rel.type}</Badge> to: <strong className="font-medium">{rel.targetEntity.label}</strong> ({rel.targetEntity.type}, ID: {rel.targetEntity.id})
                      </p>
                    </Card>
                  ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const extractExplainability = (data: DemonstrateKgQueryOutput): ExplainableOutput => {
    return {
      reasoningSteps: [
        "Received query string.",
        "Called conceptual `queryKnowledgeGraphTool`.",
        "Tool simulated KG lookup based on mock data.",
        "Structured results (entities, relationships, summary) returned.",
      ],
      confidenceScore: "N/A (Conceptual Mock)",
      modelEvaluationMetrics: {
        "Entities Matched (Mock)": data.matchedEntities?.length || 0,
        "Relationships Found (Mock)": data.relatedInformation?.relationships?.length || 0,
      },
    };
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <Network className="w-7 h-7 mr-3 text-primary" />
            Conceptual Knowledge Graph Query Demo
          </CardTitle>
          <CardDescription className="flex flex-col gap-2 mt-2">
            <span>
              Interact with a conceptual (mocked) Knowledge Graph. This demonstrates how ISA might query structured
              knowledge about standards, entities, and their relationships in the future.
            </span>
            <span className="text-xs text-muted-foreground flex items-center">
              <Info className="w-3 h-3 mr-1.5 shrink-0" />
              Note: The Knowledge Graph and its query responses are MOCKED for demonstration.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src="https://placehold.co/800x300.png"
            alt="Conceptual image for Knowledge Graph"
            width={800}
            height={300}
            className="rounded-lg object-cover w-full"
            data-ai-hint="knowledge graph network"
            priority
          />
        </CardContent>
      </Card>

      <ClientAiForm<KgQueryFormValues, DemonstrateKgQueryOutput>
        formSchema={kgQueryFormSchema}
        defaultValues={{ queryString: "" }}
        serverAction={handleDemonstrateKgQuery}
        renderFormFields={renderFormFields}
        renderOutput={renderOutput}
        outputTitle="KG Query Result (Conceptual)"
        formSubmitButtonText="Query KG"
        extractExplainability={extractExplainability}
      />
    </div>
  );
}
