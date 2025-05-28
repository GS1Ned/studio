
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
This is for demonstration purposes; the rules are not official or exhaustive.

Identifier Type: {{{identifierType}}}
Identifier Value: {{{identifierValue}}}

**Detailed Mock Validation Rules by Identifier Type:**

- **GTIN (Global Trade Item Number):**
  1.  **Numeric Check:** Must consist of only numeric digits. (e.g., "Numeric Check: Passed/Failed")
  2.  **Length Check:** Must be 8, 12, 13, or 14 digits long. (e.g., "Length Check (8,12,13,14): Passed (Length X)/Failed (Length X)")
  3.  **Mock GTIN-13 Prefix Rule:** If length is 13 AND starts with "012", consider this rule passed. (e.g., "Mock GTIN-13 Prefix '012': Passed/Failed/Not Applicable")
  4.  **Mock GTIN-8 Prefix Rule:** If length is 8 AND starts with "0", consider this rule passed. (e.g., "Mock GTIN-8 Prefix '0': Passed/Failed/Not Applicable")
  5.  **Conceptual Check Digit (Mock):** If all above pass for a common type (e.g. GTIN-13), conceptually assume check digit is valid. (e.g., "Mock Check Digit: Conceptually Valid/Invalid/Not Applicable")

- **GLN (Global Location Number):**
  1.  **Numeric Check:** Must be all numeric.
  2.  **Length Check:** Must be 13 digits.
  3.  **Mock Suffix Rule:** If ends with "000", rule passed. (e.g., "Mock GLN Suffix '000': Passed/Failed")

- **SSCC (Serial Shipping Container Code):**
  1.  **Numeric Check:** Must be all numeric.
  2.  **Length Check:** Must be 18 digits.
  3.  **Mock Prefix Rule:** If starts with "00", rule passed.

- **GRAI (Global Returnable Asset Identifier):**
  1.  **Alphanumeric Check:** Can contain alphanumeric.
  2.  **Mock Content & Length Rule:** If length is 14-30 (inclusive) AND contains "GRAI" (case-insensitive), rule passed.

- **GIAI (Global Individual Asset Identifier):**
  1.  **Alphanumeric Check:** Can contain alphanumeric.
  2.  **Mock Content & Length Rule:** If length is 11-30 (inclusive) AND contains "GIAI" (case-insensitive), rule passed.

- **GSRN (Global Service Relation Number):**
  1.  **Numeric Check:** Must be all numeric.
  2.  **Length Check:** Must be 18 digits.
  3.  **Mock Prefix Rule:** If starts with "8018", rule passed.

- **GDTI (Global Document Type Identifier):**
  1.  **Base Numeric Check:** First 13 characters (if present) must be numeric.
  2.  **Base Length Check:** The numeric base must be 13 digits. (If total length is <13, this fails. If >13, check first 13).
  3.  **Mock Prefix Rule (for base):** If numeric base is 13 digits AND starts with "253", rule passed.
  4.  **Optional Serial Component:** Alphanumeric characters may follow the 13-digit base, up to a total length of 30. (e.g., "Optional Serial: Present/Not Present/Valid Format/Invalid Format")

- **OTHER:**
  1.  **Generic Rule:** If type is 'OTHER' or not listed above, it's valid if it contains only alphanumeric characters and hyphens, AND is between 5 and 30 characters long.

**Instructions for Output:**
1.  Based on the *most specific* set of mock rules for the given 'identifierType', determine if it's 'isValid'. If no specific rules match (and type is not OTHER), apply the OTHER rule.
2.  Provide a concise 'message' summarizing the overall conceptual validation (e.g., "Conceptually Valid GTIN-13 (Mock Rules Met)" or "Conceptually Invalid SSCC: Fails mock length rule").
3.  Populate the 'details' array with strings. Each string should represent a specific mock rule/check that was applied for the given identifierType, followed by its outcome.
    *   Format: "Rule Description: Outcome (Additional Info if any)"
    *   Example for GTIN-13 "0123456789012":
        details: [
          "Numeric Check: Passed",
          "Length Check (8,12,13,14): Passed (Length 13)",
          "Mock GTIN-13 Prefix '012': Passed",
          "Mock Check Digit: Conceptually Valid"
        ]
    *   Example for GLN "123456789012X" (invalid char):
        details: [
          "Numeric Check: Failed (Contains 'X')",
          "Length Check (13 digits): Not Applicable (due to prior failure)",
          "Mock GLN Suffix '000': Not Applicable (due to prior failure)"
        ]
    *   Only include details for rules relevant to the specified identifierType. If a fundamental check (like numeric) fails, subsequent