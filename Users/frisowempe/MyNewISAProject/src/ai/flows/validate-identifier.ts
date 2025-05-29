
// src/ai/flows/validate-identifier.ts
'use server';
/**
 * @fileOverview An AI agent that validates GS1 identifiers based on conceptual rules,
 * now enhanced with more TypeScript-based symbolic validation for basic structural checks.
 *
 * - validateIdentifier - A function that validates a GS1 identifier.
 * - ValidateIdentifierInput - The input type for the function.
 * - ValidateIdentifierOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ValidateIdentifierInputSchema } from '@/ai/schemas';

export const ValidateIdentifierOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the identifier is considered valid based on all checks (symbolic and conceptual).'),
  message: z.string().describe('A message summarizing the validation result (e.g., "Valid GTIN-13" or "Invalid: Check digit incorrect, Length incorrect").'),
  details: z.array(z.string()).optional().describe('An array of specific validation checks passed or failed, or other relevant details from the validation process.'),
  identifierTypeValidated: ValidateIdentifierInputSchema.shape.identifierType.describe('The type of identifier that was validated.'),
  validatedValue: z.string().describe('The identifier value that was validated.')
});
export type ValidateIdentifierOutput = z.infer<typeof ValidateIdentifierOutputSchema>;

// --- Symbolic Validation Helper Functions ---

function isNumericOnly(value: string): boolean {
  return /^\d+$/.test(value);
}

function isValidLength(value: string, expectedLengths: number | number[]): boolean {
  const lengths = Array.isArray(expectedLengths) ? expectedLengths : [expectedLengths];
  return lengths.includes(value.length);
}

function isValidGtin13CheckDigit(gtin: string): { valid: boolean; calculatedCheckDigit?: number; actualCheckDigit?: number; reason?: string } {
  if (!isNumericOnly(gtin) || !isValidLength(gtin, 13)) {
    return { valid: false, reason: "Input must be a 13-digit numeric string for GTIN-13 check digit validation." };
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(gtin[i], 10);
    if ((i + 1) % 2 !== 0) { // Odd positions (1st, 3rd, ..., 11th from left)
      sum += digit;
    } else { // Even positions (2nd, 4th, ..., 12th from left)
      sum += digit * 3;
    }
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  const actualCheckDigit = parseInt(gtin[12], 10);

  return {
    valid: calculatedCheckDigit === actualCheckDigit,
    calculatedCheckDigit,
    actualCheckDigit,
    reason: calculatedCheckDigit === actualCheckDigit ? "Check digit matches calculated value." : `Check digit mismatch: expected ${calculatedCheckDigit}, got ${actualCheckDigit}.`
  };
}

// --- Main Flow ---

export async function validateIdentifier(input: z.infer<typeof ValidateIdentifierInputSchema>): Promise<ValidateIdentifierOutput> {
  const symbolicCheckDetails: string[] = [];
  let symbolicChecksOverallPass = true; // Assume pass until a check fails

  // Perform symbolic checks based on type
  switch (input.identifierType) {
    case 'GTIN':
      if (!isNumericOnly(input.identifierValue)) {
        symbolicCheckDetails.push("Symbolic Numeric Check: Failed (contains non-numeric characters).");
        symbolicChecksOverallPass = false;
      } else {
        symbolicCheckDetails.push("Symbolic Numeric Check: Passed.");
      }
      if (!isValidLength(input.identifierValue, [8, 12, 13, 14])) {
        symbolicCheckDetails.push(`Symbolic Length Check (8,12,13,14): Failed (Actual Length: ${input.identifierValue.length}).`);
        symbolicChecksOverallPass = false;
      } else {
        symbolicCheckDetails.push(`Symbolic Length Check (8,12,13,14): Passed (Actual Length: ${input.identifierValue.length}).`);
        if (input.identifierValue.length === 13) {
          const gtin13Check = isValidGtin13CheckDigit(input.identifierValue);
          symbolicCheckDetails.push(`Symbolic GTIN-13 Check Digit: ${gtin13Check.valid ? 'Passed' : 'Failed'} (${gtin13Check.reason})`);
          if (!gtin13Check.valid) symbolicChecksOverallPass = false;
        }
      }
      break;
    case 'GLN':
      if (!isNumericOnly(input.identifierValue)) {
        symbolicCheckDetails.push("Symbolic Numeric Check: Failed (contains non-numeric characters).");
        symbolicChecksOverallPass = false;
      } else {
        symbolicCheckDetails.push("Symbolic Numeric Check: Passed.");
      }
      if (!isValidLength(input.identifierValue, 13)) {
        symbolicCheckDetails.push(`Symbolic Length Check (13 digits): Failed (Actual Length: ${input.identifierValue.length}).`);
        symbolicChecksOverallPass = false;
      } else {
        symbolicCheckDetails.push(`Symbolic Length Check (13 digits): Passed (Actual Length: ${input.identifierValue.length}).`);
        // GLN also has a check digit similar to GTIN-13
        const glnCheck = isValidGtin13CheckDigit(input.identifierValue); // Assuming GLN check digit is same algorithm as GTIN-13
        symbolicCheckDetails.push(`Symbolic GLN Check Digit: ${glnCheck.valid ? 'Passed' : 'Failed'} (${glnCheck.reason})`);
        if (!glnCheck.valid) symbolicChecksOverallPass = false;
      }
      break;
    case 'SSCC':
      if (!isNumericOnly(input.identifierValue)) {
        symbolicCheckDetails.push("Symbolic Numeric Check: Failed (contains non-numeric characters).");
        symbolicChecksOverallPass = false;
      } else {
        symbolicCheckDetails.push("Symbolic Numeric Check: Passed.");
      }
      if (!isValidLength(input.identifierValue, 18)) {
        symbolicCheckDetails.push(`Symbolic Length Check (18 digits): Failed (Actual Length: ${input.identifierValue.length}).`);
        symbolicChecksOverallPass = false;
      } else {
        symbolicCheckDetails.push(`Symbolic Length Check (18 digits): Passed (Actual Length: ${input.identifierValue.length}).`);
        // SSCC has a check digit, Modulo 10 algorithm similar to GTIN but on 17 digits
        // For simplicity, we'll skip implementing the SSCC specific check digit here, but note its existence
        symbolicCheckDetails.push("Symbolic SSCC Check Digit: Conceptual (Not implemented in this symbolic pass, LLM to assess conceptually).");
      }
      break;
    // Add more symbolic checks for other types (GRAI, GIAI, GSRN, GDTI) if simple rules apply
    // For now, GRAI, GIAI, GSRN, GDTI will rely more on LLM conceptual checks
    default:
      symbolicCheckDetails.push(`Symbolic Checks: No specific basic symbolic checks implemented for type '${input.identifierType}'. LLM to perform conceptual validation.`);
      break;
  }

  const promptInput = {
    ...input,
    symbolicValidationPerformed: symbolicCheckDetails.length > 0 && !symbolicCheckDetails[0].startsWith("Symbolic Checks: No specific"),
    symbolicValidationDetails: symbolicCheckDetails.join(' '),
    symbolicValidationOutcome: symbolicChecksOverallPass ? "Passed" : "Failed (at least one check)",
  };

  try {
    const { output: llmOutput } = await validateIdentifierPrompt(promptInput);
    if (!llmOutput) {
      console.error('validateIdentifierPrompt did not return a valid output.');
      return {
        isValid: false,
        message: 'Validation could not be completed as the AI model failed to produce a structured response.',
        details: ['AI model error: No structured output received.', ...symbolicCheckDetails],
        identifierTypeValidated: input.identifierType,
        validatedValue: input.identifierValue,
      };
    }
    
    // Combine symbolic details with LLM details from its conceptual checks
    const combinedDetails = [...symbolicCheckDetails, ...(llmOutput.details || [])];
    
    // Final validity is determined by symbolic checks FIRST, then LLM's assessment
    const finalIsValid = symbolicChecksOverallPass && llmOutput.isValid;
    let finalMessage = llmOutput.message;
    if (!symbolicChecksOverallPass && llmOutput.isValid) {
      finalMessage = `Symbolically Invalid (e.g., ${symbolicCheckDetails.find(d => d.includes("Failed")) || 'basic structure incorrect'}). LLM conceptual checks might have passed otherwise.`;
    } else if (!symbolicChecksOverallPass && !llmOutput.isValid) {
      finalMessage = `Symbolically Invalid and LLM conceptual checks also failed. ${llmOutput.message}`;
    }


    return {
      isValid: finalIsValid,
      message: finalMessage,
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

const ValidateIdentifierPromptInputSchema = ValidateIdentifierInputSchema.extend({
    symbolicValidationPerformed: z.boolean().describe("Whether any specific symbolic pre-validation was performed (beyond generic type checks)."),
    symbolicValidationDetails: z.string().optional().describe("Details from the symbolic pre-validation checks, space-separated."),
    symbolicValidationOutcome: z.string().optional().describe("Overall outcome of the symbolic pre-validation (e.g., 'Passed', 'Failed (at least one check)', 'Not Performed').")
});

const validateIdentifierPrompt = ai.definePrompt({
  name: 'validateIdentifierPrompt',
  input: { schema: ValidateIdentifierPromptInputSchema },
  output: { schema: ValidateIdentifierOutputSchema.omit({ identifierTypeValidated: true, validatedValue: true }) },
  prompt: `You are a GS1 Identifier Validation Bot. Your task is to perform **conceptual validation** for the provided GS1 identifier, supplementing any symbolic checks already performed.

Identifier Type: {{{identifierType}}}
Identifier Value: {{{identifierValue}}}

{{#if symbolicValidationPerformed}}
Preliminary Symbolic Checks Performed:
Outcome: {{{symbolicValidationOutcome}}}
Details: {{{symbolicValidationDetails}}}
Please take these symbolic checks into account. If symbolic checks already definitively failed (e.g., incorrect length, non-numeric for a numeric type, failed check digit), the identifier is invalid for those aspects. Your role is to perform *additional conceptual checks* based on the identifier type and to provide a holistic summary.
{{else}}
No specific symbolic pre-checks were performed for this identifier type, or basic checks passed. Proceed with full conceptual validation.
{{/if}}

**Your Task: Perform Conceptual Validation & Consolidate Output**

Based on the 'identifierType' and 'identifierValue', and considering any 'symbolicValidationOutcome' provided:
1.  Perform **conceptual mock validation rules** appropriate for the 'identifierType'. These are illustrative checks beyond basic structure.
    *   **GTIN:**
        *   LLM Mock GTIN-13 Prefix '012' Rule: If length 13 AND starts with "012", pass. (Detail format: "LLM Conceptual Mock GTIN-13 Prefix '012': Passed/Failed (Prefix is 'YYY')/Not Applicable")
        *   LLM Mock GTIN-8 Suffix '.XYZ' Rule: If length 8 AND ends with ".XYZ", pass. (Detail format: "LLM Conceptual Mock GTIN-8 Suffix '.XYZ': Passed/Failed (Suffix is 'ABC')/Not Applicable")
        *   LLM Mock Check Digit Verification: If symbolic check digit was not performed or inconclusive for this GTIN type (e.g., GTIN-8, GTIN-12, GTIN-14), state "LLM Conceptual Check Digit: Assumed Valid for mock purposes if basic structure correct" or "LLM Conceptual Check Digit: Considered Invalid due to structural issues (if symbolic checks already showed major structural flaws)". If symbolic check was definitive (e.g. for GTIN-13 and it passed/failed), state "LLM Conceptual Check Digit: N/A (Symbolic check was definitive)".
    *   **GLN:**
        *   LLM Mock GLN Suffix '000' Rule: If ends with "000", pass. (Detail format: "LLM Conceptual Mock GLN Suffix '000': Passed/Failed (Suffix is 'YYY')/Not Applicable")
    *   **SSCC:**
        *   LLM Mock SSCC Prefix '00' Rule: If starts with "00", pass. (Detail format: "LLM Conceptual Mock SSCC Prefix '00': Passed/Failed (Prefix is 'YY')/Not Applicable")
    *   **GRAI:**
        *   LLM Charset Check: Should allow alphanumeric. (Detail format: "LLM Conceptual Charset Check (GRAI): Passed (Allows Alphanumeric)")
        *   LLM Mock GRAI Content & Length Rule: If length between 14-30 AND contains "GRAI" (case-insensitive), pass. (Detail format: "LLM Conceptual Mock GRAI Content/Length (14-30, contains 'GRAI'): Passed/Failed (Reason: ...)/Not Applicable")
    *   **GIAI:**
        *   LLM Charset Check: Should allow alphanumeric. (Detail format: "LLM Conceptual Charset Check (GIAI): Passed (Allows Alphanumeric)")
        *   LLM Mock GIAI Content & Length Rule: If length between 11-30 AND contains "GIAI" (case-insensitive), pass. (Detail format: "LLM Conceptual Mock GIAI Content/Length (11-30, contains 'GIAI'): Passed/Failed (Reason: ...)/Not Applicable")
    *   **GSRN:**
        *   LLM Mock GSRN Prefix '8018' Rule: If starts with "8018", pass. (Detail format: "LLM Conceptual Mock GSRN Prefix '8018': Passed/Failed (Prefix is 'YYYY')/Not Applicable")
    *   **GDTI:**
        *   LLM GDTI Base Numeric Check (First 13 chars): (Detail format: "LLM Conceptual GDTI Base Numeric (First 13): Passed/Failed/Not Applicable") (This would be redundant if symbolic numeric check already done on whole string for first 13)
        *   LLM Mock GDTI Base Prefix '253' Rule: If 13-digit base starts with "253", pass. (Detail format: "LLM Conceptual Mock GDTI Base Prefix '253': Passed/Failed (Prefix is 'YYY')/Not Applicable")
        *   LLM Optional Serial Component Check: Alphanumeric after 13-digit base, up to total length 30. (Detail format: "LLM Conceptual Optional Serial (GDTI): Present and Valid (Total Length X)/Not Present/Invalid (Reason: ...)/Not Applicable")
    *   **OTHER:**
        *   LLM Generic Charset Check (Alphanumeric, Hyphen): (Detail format: "LLM Conceptual Generic Charset (Alphanumeric, Hyphen): Passed/Failed (contains 'X')")
        *   LLM Generic Length Check (5-30 chars): (Detail format: "LLM Conceptual Generic Length (5-30 chars): Passed (Actual: X)/Failed (Actual: X)")

2.  Populate the 'details' array with a string for *each conceptual LLM rule check performed* for the specified identifierType. Use the "LLM Conceptual " prefixed "Detail format" examples.
3.  Set 'isValid' to true if ALL conceptual checks pass AND the 'symbolicValidationOutcome' was 'Passed' (or not performed/inapplicable). If 'symbolicValidationOutcome' was 'Failed', 'isValid' MUST be false.
4.  Provide a concise 'message' summarizing the overall validation result, considering both symbolic and your conceptual checks. (e.g., "Valid GTIN-13 (Symbolic & Conceptual checks passed)" or "Invalid GLN: Fails symbolic length check. Conceptual checks also noted...").

Ensure your output strictly adheres to the output schema.
If symbolic checks have already failed structure (e.g. length, numeric), state that conceptual checks for that structure are "Not Applicable (Symbolic check definitive)".
`,
});

```