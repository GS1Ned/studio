// src/ai/flows/validate-identifier.ts
'use server';
/**
 * @fileOverview An AI agent that validates GS1 identifiers based on conceptual rules.
 *
 * - validateIdentifier - A function that validates a GS1 identifier.
 * - ValidateIdentifierInput - The input type for the function.
 * - ValidateIdentifierOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ValidateIdentifierInputSchema } from '@/ai/schemas';

export const ValidateIdentifierOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the identifier is considered valid based on the rules.'),
  message: z.string().describe('A message summarizing the validation result (e.g., "Valid GTIN-13" or "Invalid: Check digit incorrect").'),
  details: z.array(z.string()).optional().describe('An array of specific validation checks passed or failed, or other relevant details.'),
  identifierTypeValidated: ValidateIdentifierInputSchema.shape.identifierType.describe('The type of identifier that was validated.'),
  validatedValue: z.string().describe('The identifier value that was validated.')
});
export type ValidateIdentifierOutput = z.infer<typeof ValidateIdentifierOutputSchema>;

export async function validateIdentifier(input: z.infer<typeof ValidateIdentifierInputSchema>): Promise<ValidateIdentifierOutput> {
  try {
    const { output } = await validateIdentifierPrompt(input);
    if (!output) {
      console.error('validateIdentifierPrompt did not return a valid output.');
      return {
        isValid: false,
        message: 'Validation could not be completed as the AI model failed to produce a structured response.',
        details: ['AI model error.'],
        identifierTypeValidated: input.identifierType,
        validatedValue: input.identifierValue,
      };
    }
    // Ensure the output from LLM is consistent with the input it processed
    return {
      ...output,
      identifierTypeValidated: input.identifierType,
      validatedValue: input.identifierValue,
    };
  } catch (error) {
    console.error("Error in validateIdentifier flow:", error);
    return {
      isValid: false,
      message: 'An unexpected error occurred during identifier validation.',
      details: ['System error during validation.'],
      identifierTypeValidated: input.identifierType,
      validatedValue: input.identifierValue,
    };
  }
}

const validateIdentifierPrompt = ai.definePrompt({
  name: 'validateIdentifierPrompt',
  input: { schema: ValidateIdentifierInputSchema },
  output: { schema: ValidateIdentifierOutputSchema.omit({ identifierTypeValidated: true, validatedValue: true }) }, // LLM doesn't need to echo these back
  prompt: `You are a GS1 Identifier Validation Bot.
Your task is to validate the provided GS1 identifier based on its type using simplified conceptual rules.

Identifier Type: {{{identifierType}}}
Identifier Value: {{{identifierValue}}}

Validation Rules (Simplified for this demonstration):
- GTIN (Global Trade Item Number):
  - Common lengths: 8, 12, 13, 14 digits.
  - Must be all numeric.
  - (Mock Check) If GTIN-13, check if it starts with "012". Valid if so, invalid otherwise.
- GLN (Global Location Number):
  - Length: 13 digits.
  - Must be all numeric.
  - (Mock Check) Valid if it ends with "00".
- SSCC (Serial Shipping Container Code):
  - Length: 18 digits.
  - Must be all numeric.
  - (Mock Check) Valid if it starts with "00".
- GRAI (Global Returnable Asset Identifier):
  - Format: Up to 30 alphanumeric characters including a serial number component.
  - (Mock Check) Valid if length is between 14 and 30 and contains "GRAI".
- GIAI (Global Individual Asset Identifier):
  - Format: Up to 30 alphanumeric characters.
  - (Mock Check) Valid if length is > 10 and contains "GIAI".
- GSRN (Global Service Relation Number):
  - Length: 18 digits.
  - (Mock Check) Valid if starts with "8018".
- GDTI (Global Document Type Identifier):
  - Format: 13-digit numeric + optional serial number up to 17 alphanumeric.
  - (Mock Check) Valid if numeric part is 13 digits and starts with "253".
- OTHER:
  - Perform a basic check: if it contains any non-alphanumeric characters (excluding hyphens), consider it invalid. Otherwise, valid.

Based on these rules for the given 'identifierType' and 'identifierValue':
1. Determine if it's 'isValid'.
2. Provide a 'message' summarizing the validation (e.g., "Valid GTIN-13 (Mock Check Passed)" or "Invalid SSCC: Does not meet length requirement").
3. Provide 'details' as an array of strings, listing specific checks performed or reasons for invalidity (e.g., ["Length check passed", "Prefix '012' matched for GTIN-13 (Mock)"] or ["Length is not 18 digits for SSCC."]).

Output your response in the specified JSON format. Focus on applying only the mock rules described for the given type.
If an identifier type is not explicitly listed with mock rules, and is not 'OTHER', state that specific validation rules for it are not implemented in this mock version but perform a generic check.
`,
});
