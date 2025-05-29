
// src/ai/flows/validate-identifier.ts
'use server';
/**
 * @fileOverview An AI agent that validates GS1 identifiers based on conceptual rules,
 * with symbolic validation for GTIN-13 check digits.
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

// Helper function for GTIN-13 check digit validation
function isValidGtin13CheckDigit(gtin: string): { valid: boolean; calculatedCheckDigit?: number; actualCheckDigit?: number } {
  if (!/^\d{13}$/.test(gtin)) {
    return { valid: false }; // Not a 13-digit number
  }

  let sumOdd = 0;
  let sumEven = 0;

  for (let i = 0; i < 12; i++) {
    const digit = parseInt(gtin[i], 10);
    if ((i + 1) % 2 === 0) { // Even position (2nd, 4th, ... from left)
      sumEven += digit;
    } else { // Odd position (1st, 3rd, ... from left)
      sumOdd += digit;
    }
  }

  const totalSum = sumOdd * 3 + sumEven; // Correction: Odd positions are multiplied by 3
  // Correct GTIN algorithm: Sum digits at odd positions (1st, 3rd, 5th... from left)
  // Sum digits at even positions (2nd, 4th, 6th... from left) then multiply this sum by 3.
  // No, the standard algorithm is:
  // (d1*1 + d2*3 + d3*1 + d4*3 + ... + d12*3)
  // Or, starting from right of first 12: (d12*3 + d11*1 + d10*3 + d9*1 ...)
  // Let's use the common method: sum (position 1,3,5...11 digits) + sum (position 2,4,6...12 digits)*3.
  // No, it's: sum all digits in ODD positions (1,3,5,7,9,11) then multiply sum by 3. Add to sum of digits in EVEN positions (2,4,6,8,10,12).
  // Still not quite. The standard is:
  // For GTIN-13: Multiply digits at positions 2, 4, 6, 8, 10, 12 by 3.
  // Sum these with digits at positions 1, 3, 5, 7, 9, 11.

  // Let's re-implement cleanly.
  // GTIN-13: d1 d2 d3 d4 d5 d6 d7 d8 d9 d10 d11 d12 d13(check)
  // Sum = (d1*1) + (d2*3) + (d3*1) + (d4*3) + ... + (d12*3)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(gtin[i], 10);
    if ((i + 1) % 2 !== 0) { // Odd positions (1st, 3rd, ..., 11th)
      sum += digit;
    } else { // Even positions (2nd, 4th, ..., 12th)
      sum += digit * 3;
    }
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  const actualCheckDigit = parseInt(gtin[12], 10);

  return {
    valid: calculatedCheckDigit === actualCheckDigit,
    calculatedCheckDigit,
    actualCheckDigit,
  };
}


export async function validateIdentifier(input: z.infer<typeof ValidateIdentifierInputSchema>): Promise<ValidateIdentifierOutput> {
  let symbolicCheckDetails: string[] = [];
  let symbolicCheckPassed: boolean | null = null;

  if (input.identifierType === 'GTIN' && input.identifierValue.length === 13 && /^\d{13}$/.test(input.identifierValue)) {
    const gtin13Check = isValidGtin13CheckDigit(input.identifierValue);
    if (gtin13Check.calculatedCheckDigit !== undefined) {
      symbolicCheckDetails.push(`Symbolic GTIN-13 Check Digit Calculation: Actual=${gtin13Check.actualCheckDigit}, Calculated=${gtin13Check.calculatedCheckDigit}.`);
      if (gtin13Check.valid) {
        symbolicCheckDetails.push("Symbolic GTIN-13 Check Digit: Passed.");
        symbolicCheckPassed = true;
      } else {
        symbolicCheckDetails.push("Symbolic GTIN-13 Check Digit: Failed.");
        symbolicCheckPassed = false;
      }
    } else {
       symbolicCheckDetails.push("Symbolic GTIN-13 Check Digit: Not applicable (input not 13 digits).");
    }
  }

  // Create a modified input for the LLM prompt, including the symbolic check results
  const promptInput = {
    ...input,
    symbolicValidationPerformed: symbolicCheckPassed !== null,
    symbolicValidationDetails: symbolicCheckDetails.join(' '),
    symbolicValidationOutcome: symbolicCheckPassed === true ? "Passed" : symbolicCheckPassed === false ? "Failed" : "Not Performed",
  };

  try {
    const { output } = await validateIdentifierPrompt(promptInput);
    if (!output) {
      console.error('validateIdentifierPrompt did not return a valid output.');
      return {
        isValid: false,
        message: 'Validation could not be completed as the AI model failed to produce a structured response.',
        details: ['AI model error: No structured output received.', ...symbolicCheckDetails],
        identifierTypeValidated: input.identifierType,
        validatedValue: input.identifierValue,
      };
    }
    // Combine symbolic details with LLM details
    const combinedDetails = [...symbolicCheckDetails, ...(output.details || [])];
    
    // If symbolic check failed, it overrides LLM's assessment of validity for GTIN-13
    let finalIsValid = output.isValid;
    if (input.identifierType === 'GTIN' && input.identifierValue.length === 13 && symbolicCheckPassed === false) {
        finalIsValid = false;
    }


    return {
      ...output,
      isValid: finalIsValid,
      details: combinedDetails.length > 0 ? combinedDetails : undefined,
      identifierTypeValidated: input.identifierType,
      validatedValue: input.identifierValue,
    };
  } catch (error: any) {
    console.error("Error in validateIdentifier flow:", error.message || error);
    return {
      isValid: false,
      message: `An unexpected error occurred during identifier validation: ${error.message || 'Unknown error'}.`,
      details: ['System error during validation process.', ...symbolicCheckDetails],
      identifierTypeValidated: input.identifierType,
      validatedValue: input.identifierValue,
    };
  }
}

// Modify the input schema for the prompt to accept symbolic check information
const ValidateIdentifierPromptInputSchema = ValidateIdentifierInputSchema.extend({
    symbolicValidationPerformed: z.boolean().describe("Whether a symbolic pre-validation was performed."),
    symbolicValidationDetails: z.string().optional().describe("Details from the symbolic pre-validation."),
    symbolicValidationOutcome: z.string().optional().describe("Outcome of the symbolic pre-validation (Passed, Failed, Not Performed).")
});

const validateIdentifierPrompt = ai.definePrompt({
  name: 'validateIdentifierPrompt',
  input: { schema: ValidateIdentifierPromptInputSchema }, // Use extended schema
  output: { schema: ValidateIdentifierOutputSchema.omit({ identifierTypeValidated: true, validatedValue: true }) },
  prompt: `You are a GS1 Identifier Validation Bot. Your task is to validate the provided GS1 identifier based on its type using **highly detailed but conceptual and illustrative mock rules**.
This is for demonstration purposes; the rules are not official or exhaustive. Your goal is to be very explicit about each rule check performed and list these checks in the 'details' array.

Identifier Type: {{{identifierType}}}
Identifier Value: {{{identifierValue}}}

{{#if symbolicValidationPerformed}}
A preliminary symbolic validation was performed with the following outcome:
Symbolic Validation Outcome: {{{symbolicValidationOutcome}}}
Symbolic Validation Details: {{{symbolicValidationDetails}}}
Please take this symbolic validation into account. If the symbolic check already failed (e.g., for a GTIN-13 check digit), the identifier is definitively invalid for that aspect, but you should still perform other conceptual checks. Your 'isValid' output should reflect the overall validity considering both symbolic (if performed and failed) and conceptual checks.
{{/if}}

**Detailed Mock Validation Rules by Identifier Type & Expected Output Format for 'details' (Perform these IN ADDITION to any symbolic checks provided above):**

- **GTIN (Global Trade Item Number):**
  1.  **Numeric Check:** Verify it consists of only numeric digits. (Detail format: "LLM Conceptual Numeric Check: Passed" or "LLM Conceptual Numeric Check: Failed (contains 'X')")
  2.  **Length Check:** Verify it is 8, 12, 13, or 14 digits long. (Detail format: "LLM Conceptual Length Check (8,12,13,14): Passed (Actual Length: X)" or "LLM Conceptual Length Check (8,12,13,14): Failed (Actual Length: X)")
  3.  **Mock GTIN-13 Prefix '012' Rule:** If length is 13 AND starts with "012", then this rule is passed. (Detail format: "LLM Mock GTIN-13 Prefix '012': Passed" or "LLM Mock GTIN-13 Prefix '012': Failed (Prefix is 'YYY')" or "LLM Mock GTIN-13 Prefix '012': Not Applicable (Length not 13)")
  4.  **Mock GTIN-8 Suffix '.XYZ' Rule (Illustrative):** If length is 8 AND ends with ".XYZ", then this rule is passed (this is a deliberately absurd rule for testing detail). (Detail format: "LLM Mock GTIN-8 Suffix '.XYZ': Passed" or "LLM Mock GTIN-8 Suffix '.XYZ': Failed (Suffix is 'ABC')" or "LLM Mock GTIN-8 Suffix '.XYZ': Not Applicable (Length not 8 or format incorrect)")
  5.  **Conceptual Check Digit (Mock - if no symbolic check was done or for other lengths):** If all relevant preceding conceptual checks for a common type (e.g., GTIN-12, GTIN-8) pass, assume check digit is conceptually valid. (Detail format: "LLM Mock Check Digit Verification: Conceptually Valid" or "LLM Mock Check Digit Verification: Invalid (due to prior rule failures)" or "LLM Mock Check Digit Verification: Not Applicable (Not a recognized GTIN length for check digit simulation, or symbolic check was definitive)")

- **GLN (Global Location Number):**
  1.  **Numeric Check:** Verify it is all numeric. (Detail format: "LLM Conceptual Numeric Check: Passed" or "LLM Conceptual Numeric Check: Failed (contains 'X')")
  2.  **Length Check:** Verify it is 13 digits. (Detail format: "LLM Conceptual Length Check (13 digits): Passed (Actual Length: X)" or "LLM Conceptual Length Check (13 digits): Failed (Actual Length: X)")
  3.  **Mock GLN Suffix '000' Rule:** If ends with "000", rule passed. (Detail format: "LLM Mock GLN Suffix '000': Passed" or "LLM Mock GLN Suffix '000': Failed (Suffix is 'YYY')" or "LLM Mock GLN Suffix '000': Not Applicable (e.g. length incorrect)")

- **SSCC (Serial Shipping Container Code):**
  1.  **Numeric Check:** Verify it is all numeric. (Detail format: "LLM Conceptual Numeric Check: Passed" or "LLM Conceptual Numeric Check: Failed (contains 'X')")
  2.  **Length Check:** Verify it is 18 digits. (Detail format: "LLM Conceptual Length Check (18 digits): Passed (Actual Length: X)" or "LLM Conceptual Length Check (18 digits): Failed (Actual Length: X)")
  3.  **Mock SSCC Prefix '00' Rule:** If starts with "00", rule passed. (Detail format: "LLM Mock SSCC Prefix '00': Passed" or "LLM Mock SSCC Prefix '00': Failed (Prefix is 'YY')" or "LLM Mock SSCC Prefix '00': Not Applicable (e.g. length incorrect)")

- **GRAI (Global Returnable Asset Identifier):**
  1.  **Alphanumeric Check:** Verify it can contain alphanumeric characters. (Detail format: "LLM Charset Check: Passed (Allows Alphanumeric)")
  2.  **Mock GRAI Content & Length Rule:** If length is between 14 and 30 (inclusive) AND contains "GRAI" (case-insensitive), rule passed. (Detail format: "LLM Mock GRAI Content/Length (14-30 chars, contains 'GRAI'): Passed" or "LLM Mock GRAI Content/Length (14-30 chars, contains 'GRAI'): Failed (Reason: e.g., length X, or missing 'GRAI')")

- **GIAI (Global Individual Asset Identifier):**
  1.  **Alphanumeric Check:** Verify it can contain alphanumeric characters. (Detail format: "LLM Charset Check: Passed (Allows Alphanumeric)")
  2.  **Mock GIAI Content & Length Rule:** If length is between 11 and 30 (inclusive) AND contains "GIAI" (case-insensitive), rule passed. (Detail format: "LLM Mock GIAI Content/Length (11-30 chars, contains 'GIAI'): Passed" or "LLM Mock GIAI Content/Length (11-30 chars, contains 'GIAI'): Failed (Reason: e.g., length X, or missing 'GIAI')")

- **GSRN (Global Service Relation Number):**
  1.  **Numeric Check:** Verify it is all numeric. (Detail format: "LLM Conceptual Numeric Check: Passed" or "LLM Conceptual Numeric Check: Failed (contains 'X')")
  2.  **Length Check:** Verify it is 18 digits. (Detail format: "LLM Conceptual Length Check (18 digits): Passed (Actual Length: X)" or "LLM Conceptual Length Check (18 digits): Failed (Actual Length: X)")
  3.  **Mock GSRN Prefix '8018' Rule:** If starts with "8018", rule passed. (Detail format: "LLM Mock GSRN Prefix '8018': Passed" or "LLM Mock GSRN Prefix '8018': Failed (Prefix is 'YYYY')" or "LLM Mock GSRN Prefix '8018': Not Applicable (e.g. length incorrect)")

- **GDTI (Global Document Type Identifier):**
  1.  **Base Numeric Check:** First 13 characters (if present and if total length >= 13) must be numeric. (Detail format: "LLM GDTI Base Numeric Check (First 13 chars): Passed" or "LLM GDTI Base Numeric Check (First 13 chars): Failed (e.g., char 'X' at pos Y is not numeric)" or "LLM GDTI Base Numeric Check (First 13 chars): Not Applicable (Length < 13)")
  2.  **Base Length Check:** The numeric base must be 13 digits. (If total length is <13, this fails. If >13, check first 13). (Detail format: "LLM GDTI Base Length Check (13 digits): Passed" or "LLM GDTI Base Length Check (13 digits): Failed (Base length is X)")
  3.  **Mock GDTI Base Prefix '253' Rule:** If numeric base is 13 digits AND starts with "253", rule passed. (Detail format: "LLM Mock GDTI Base Prefix '253': Passed" or "LLM Mock GDTI Base Prefix '253': Failed (Prefix is 'YYY')" or "LLM Mock GDTI Base Prefix '253': Not Applicable (Base not 13 digits)")
  4.  **Optional Serial Component Check:** Alphanumeric characters may follow the 13-digit base, up to a total length of 30. (Detail format: "LLM Optional Serial Component Check: Present and Valid (Total Length X)" or "LLM Optional Serial Component Check: Not Present (Total Length 13)" or "LLM Optional Serial Component Check: Invalid (e.g., total length > 30, or non-alphanumeric in serial)" or "LLM Optional Serial Component Check: Not Applicable (Base rules failed)")

- **OTHER (Default/Fallback for types not explicitly listed above):**
  1.  **Generic Charset Check:** Must contain only alphanumeric characters and hyphens. (Detail format: "LLM Generic Charset Check (Alphanumeric, Hyphen): Passed" or "LLM Generic Charset Check (Alphanumeric, Hyphen): Failed (contains invalid char 'X')")
  2.  **Generic Length Check:** Must be between 5 and 30 characters long (inclusive). (Detail format: "LLM Generic Length Check (5-30 chars): Passed (Actual Length: X)" or "LLM Generic Length Check (5-30 chars): Failed (Actual Length: X)")

**Instructions for Your Output:**
1.  Carefully select the set of rules that apply to the given 'identifierType'. If the type is not explicitly listed with specific rules, use the 'OTHER' rules.
2.  For each applicable rule within that set, determine if the 'identifierValue' passes or fails. If a fundamental check (like numeric-only for a GTIN) fails, subsequent checks for that type that depend on it may be marked as "Not Applicable (due to prior rule failure)".
3.  Populate the 'details' array with a string for *each conceptual rule check performed* for the specified identifierType, using the "LLM " prefixed "Detail format" examples provided above. Be meticulous and list ALL checks for the chosen type.
4.  Based on whether ALL applicable conceptual checks passed AND considering the outcome of any `symbolicValidationPerformed` (if it 'Failed', the overall `isValid` must be false for that specific aspect), set 'isValid' to true or false.
5.  Provide a concise 'message' summarizing the overall conceptual validation result (e.g., "Conceptually Valid GTIN-13 (LLM Mock Rules Met, Symbolic Check Digit Passed)" or "Conceptually Invalid SSCC: Fails LLM mock length rule based on detailed checks").

Ensure your output strictly adheres to the output schema.
`,
});
