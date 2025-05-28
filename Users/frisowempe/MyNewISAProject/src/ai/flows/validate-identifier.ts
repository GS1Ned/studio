
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
  details: z.array(z.string()).optional().describe('An array of specific validation checks passed or failed, or other relevant details from the conceptual validation process.'),
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
        details: ['AI model error: No structured output received.'],
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
  } catch (error: any) {
    console.error("Error in validateIdentifier flow:", error.message || error);
    return {
      isValid: false,
      message: `An unexpected error occurred during identifier validation: ${error.message || 'Unknown error'}.`,
      details: ['System error during validation process.'],
      identifierTypeValidated: input.identifierType,
      validatedValue: input.identifierValue,
    };
  }
}

const validateIdentifierPrompt = ai.definePrompt({
  name: 'validateIdentifierPrompt',
  input: { schema: ValidateIdentifierInputSchema },
  output: { schema: ValidateIdentifierOutputSchema.omit({ identifierTypeValidated: true, validatedValue: true }) }, // LLM doesn't need to echo these back
  prompt: `You are a GS1 Identifier Validation Bot. Your task is to validate the provided GS1 identifier based on its type using **highly detailed but conceptual and illustrative mock rules**.
This is for demonstration purposes; the rules are not official or exhaustive. Your goal is to be very explicit about each rule check.

Identifier Type: {{{identifierType}}}
Identifier Value: {{{identifierValue}}}

**Detailed Mock Validation Rules by Identifier Type & Expected Output Format for 'details':**

- **GTIN (Global Trade Item Number):**
  1.  **Numeric Check:** Must consist of only numeric digits. (Detail format: "Numeric Check: Passed" or "Numeric Check: Failed (contains 'X')")
  2.  **Length Check:** Must be 8, 12, 13, or 14 digits long. (Detail format: "Length Check (8,12,13,14): Passed (Length X)" or "Length Check (8,12,13,14): Failed (Length X)")
  3.  **Mock GTIN-13 Prefix Rule:** If length is 13 AND starts with "012", then this rule is passed. (Detail format: "Mock GTIN-13 Prefix '012': Passed" or "Mock GTIN-13 Prefix '012': Failed" or "Mock GTIN-13 Prefix '012': Not Applicable")
  4.  **Mock GTIN-8 Prefix Rule:** If length is 8 AND starts with "0", then this rule is passed. (Detail format: "Mock GTIN-8 Prefix '0': Passed" or "Mock GTIN-8 Prefix '0': Failed" or "Mock GTIN-8 Prefix '0': Not Applicable")
  5.  **Conceptual Check Digit (Mock):** If all relevant preceding checks for a common type (e.g., GTIN-13, GTIN-12, GTIN-8) pass, assume check digit is conceptually valid. (Detail format: "Mock Check Digit: Conceptually Valid" or "Mock Check Digit: Invalid (due to prior failures)" or "Mock Check Digit: Not Applicable")

- **GLN (Global Location Number):**
  1.  **Numeric Check:** Must be all numeric. (Detail format: "Numeric Check: Passed/Failed")
  2.  **Length Check:** Must be 13 digits. (Detail format: "Length Check (13 digits): Passed/Failed")
  3.  **Mock Suffix Rule:** If ends with "000", rule passed. (Detail format: "Mock GLN Suffix '000': Passed/Failed/Not Applicable")

- **SSCC (Serial Shipping Container Code):**
  1.  **Numeric Check:** Must be all numeric. (Detail format: "Numeric Check: Passed/Failed")
  2.  **Length Check:** Must be 18 digits. (Detail format: "Length Check (18 digits): Passed/Failed")
  3.  **Mock Prefix Rule:** If starts with "00", rule passed. (Detail format: "Mock SSCC Prefix '00': Passed/Failed/Not Applicable")

- **GRAI (Global Returnable Asset Identifier):**
  1.  **Alphanumeric Check:** Can contain alphanumeric characters. (Detail format: "Alphanumeric Check: Passed (Allows Alphanumeric)")
  2.  **Mock Content & Length Rule:** If length is between 14 and 30 (inclusive) AND contains "GRAI" (case-insensitive), rule passed. (Detail format: "Mock GRAI Content/Length (14-30, 'GRAI'): Passed/Failed")

- **GIAI (Global Individual Asset Identifier):**
  1.  **Alphanumeric Check:** Can contain alphanumeric characters. (Detail format: "Alphanumeric Check: Passed (Allows Alphanumeric)")
  2.  **Mock Content & Length Rule:** If length is between 11 and 30 (inclusive) AND contains "GIAI" (case-insensitive), rule passed. (Detail format: "Mock GIAI Content/Length (11-30, 'GIAI'): Passed/Failed")

- **GSRN (Global Service Relation Number):**
  1.  **Numeric Check:** Must be all numeric. (Detail format: "Numeric Check: Passed/Failed")
  2.  **Length Check:** Must be 18 digits. (Detail format: "Length Check (18 digits): Passed/Failed")
  3.  **Mock Prefix Rule:** If starts with "8018", rule passed. (Detail format: "Mock GSRN Prefix '8018': Passed/Failed/Not Applicable")

- **GDTI (Global Document Type Identifier):**
  1.  **Base Numeric Check:** First 13 characters (if present and if total length >= 13) must be numeric. (Detail format: "GDTI Base Numeric Check (First 13): Passed/Failed/Not Applicable (Length < 13)")
  2.  **Base Length Check:** The numeric base must be 13 digits. (If total length is <13, this fails. If >13, check first 13). (Detail format: "GDTI Base Length Check (13 digits): Passed/Failed")
  3.  **Mock Prefix Rule (for base):** If numeric base is 13 digits AND starts with "253", rule passed. (Detail format: "Mock GDTI Base Prefix '253': Passed/Failed/Not Applicable")
  4.  **Optional Serial Component:** Alphanumeric characters may follow the 13-digit base, up to a total length of 30. (Detail format: "Optional Serial Component: Present/Not Present/Valid Format/Invalid Format/Not Applicable")

- **OTHER (Default/Fallback):**
  1.  **Generic Alphanumeric & Hyphen Check:** Must contain only alphanumeric characters and hyphens. (Detail format: "Generic Charset Check (Alphanumeric, Hyphen): Passed/Failed")
  2.  **Generic Length Check:** Must be between 5 and 30 characters long (inclusive). (Detail format: "Generic Length Check (5-30): Passed/Failed")

**Instructions for Your Output:**
1.  Carefully select the rules that apply to the given 'identifierType'. If the type is not explicitly listed, use the 'OTHER' rules.
2.  For each applicable rule, determine if the 'identifierValue' passes or fails. If a fundamental check (like numeric-only for a GTIN) fails, subsequent checks for that type may be marked as "Not Applicable (due to prior failure)".
3.  Populate the 'details' array with a string for *each rule check performed* for the specified identifierType, using the "Detail format" examples provided above. Be meticulous.
4.  Based on whether all applicable checks passed, set 'isValid' to true or false.
5.  Provide a concise 'message' summarizing the overall conceptual validation result (e.g., "Conceptually Valid GTIN-13 (Mock Rules Met)" or "Conceptually Invalid SSCC: Fails mock length rule based on detailed checks").

Ensure your output strictly