
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleValidateIdentifier } from "@/lib/actions/ai-actions";
import type { ValidateIdentifierOutput, ExplainableOutput, GS1IdentifierType } from "@/lib/types";
import { GS1IdentifierTypeSchema } from "@/ai/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const identifierValidationFormSchema = z.object({
  identifierValue: z
    .string()
    .min(1, "Identifier value cannot be empty."),
  identifierType: GS1IdentifierTypeSchema,
});

type IdentifierValidationFormValues = z.infer<
  typeof identifierValidationFormSchema
>;

export default function IdentifierValidatorPage() {
  const renderFormFields = (form: any) => (
    <>
      <FormField
        control={form.control}
        name="identifierValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Identifier Value</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 0123456789012" {...field} />
            </FormControl>
            <FormDescription>
              Enter the GS1 identifier value you want to validate.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="identifierType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Identifier Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select identifier type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GS1IdentifierTypeSchema.options.map((type: GS1IdentifierType) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Select the type of GS1 identifier.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderOutput = (data: ValidateIdentifierOutput) => (
    <div className="space-y-4">
      <Card className={data.isValid ? "border-green-500" : "border-red-500"}>
        <CardHeader className="flex flex-row items-center space-x-3 pb-3">
          {data.isValid ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <XCircle className="h-6 w-6 text-red-500" />
          )}
          <CardTitle className="text-lg">
            Validation Result:{" "}
            <Badge variant={data.isValid ? "default" : "destructive"} className={data.isValid ? "bg-green-600" : ""}>
              {data.isValid ? "Valid" : "Invalid"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong className="font-medium">Message:</strong> {data.message}
          </p>
          <p>
            <strong className="font-medium">Identifier Type Validated:</strong> {data.identifierTypeValidated}
          </p>
          <p>
            <strong className="font-medium">Value Validated:</strong> "{data.validatedValue}"
          </p>
          {data.details && data.details.length > 0 && (
            <div>
              <strong className="font-medium">Details:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {data.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const extractExplainability = (data: ValidateIdentifierOutput): ExplainableOutput => {
    // For this conceptual validator, reasoning steps can be derived from validation details.
    // Real reasoning would come from a more complex rule engine or KG lookup.
    const reasoning = data.details ? [...data.details] : [];
    reasoning.unshift(`Validation logic applied for type: ${data.identifierTypeValidated}.`);
    reasoning.push(`Final assessment: ${data.isValid ? 'Valid' : 'Invalid'} - ${data.message}`);
    
    return {
      reasoningSteps: reasoning,
      confidenceScore: data.isValid ? (Math.random() * 0.1 + 0.9).toFixed(2) : (Math.random() * 0.2 + 0.7).toFixed(2), // Higher confidence for valid mock checks
      modelEvaluationMetrics: {
        "Rule Coverage (Mocked)": "N/A",
        "Accuracy (Mocked)": "N/A for conceptual rules",
      },
    };
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Interactive Identifier Validator
          </CardTitle>
          <CardDescription className="flex flex-col gap-2">
            <span>
              Validate GS1 identifiers (e.g., GTIN, GLN, SSCC) against conceptual rules.
              The AI will provide a validation status and details based on the selected identifier type.
            </span>
             <span className="text-xs text-muted-foreground flex items-center">
              <Info className="w-3 h-3 mr-1.5 shrink-0" />
              Note: Validation rules are currently conceptual and simplified for demonstration.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src="https://placehold.co/800x300.png"
            alt="Conceptual image for identifier validation"
            width={800}
            height={300}
            className="rounded-lg object-cover w-full"
            data-ai-hint="shield checkmark"
          />
        </CardContent>
      </Card>

      <ClientAiForm<IdentifierValidationFormValues, ValidateIdentifierOutput>
        formSchema={identifierValidationFormSchema}
        defaultValues={{
          identifierValue: "",
          identifierType: "GTIN" as GS1IdentifierType, // Default to GTIN
        }}
        serverAction={handleValidateIdentifier}
        renderFormFields={renderFormFields}
        renderOutput={renderOutput}
        outputTitle="Validation Report"
        formSubmitButtonText="Validate Identifier"
        extractExplainability={extractExplainability}
      />
    </div>
  );
}

