
'use server';

/**
 * @fileOverview A flow for assessing the severity and type of a road issue based on an image.
 *
 * - assessIssue - A function that handles the issue assessment process.
 * - AssessIssueInput - The input type for the assessIssue function.
 * - AssessIssueOutput - The return type for the assessIssue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessIssueInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the road issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AssessIssueInput = z.infer<typeof AssessIssueInputSchema>;

const AssessIssueOutputSchema = z.object({
  suggestedSeverity: z
    .enum(['Minor', 'Moderate', 'Severe/Hazardous'])
    .describe('The suggested severity level for the road issue.'),
  issueType: z
    .enum(['Pothole', 'Waterlogging', 'Broken Road', 'Other'])
    .describe('The type of road issue identified in the image.'),
});
export type AssessIssueOutput = z.infer<typeof AssessIssueOutputSchema>;

export async function assessIssue(
  input: AssessIssueInput
): Promise<AssessIssueOutput> {
  return assessIssueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessIssuePrompt',
  input: {schema: AssessIssueInputSchema},
  output: {schema: AssessIssueOutputSchema},
  prompt: `You are an expert AI assistant specializing in civil infrastructure assessment. Your task is to analyze an image of a road and identify any issues.

Based *only* on the visual information in the image provided, you must determine two things:
1.  **Issue Type**: Classify the problem into one of the following categories: 'Pothole', 'Waterlogging', 'Broken Road', or 'Other'.
2.  **Severity Level**: Assess the severity of the issue and classify it as 'Minor', 'Moderate', or 'Severe/Hazardous'. Consider factors like the size and depth of potholes, the extent of water coverage for waterlogging, or the degree of fragmentation for a broken road.

Your response must be in the specified JSON format. Do not add any commentary or extra text.

Image for analysis: {{media url=photoDataUri}}`,
});

const assessIssueFlow = ai.defineFlow(
  {
    name: 'assessIssueFlow',
    inputSchema: AssessIssueInputSchema,
    outputSchema: AssessIssueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid assessment. Please try again.");
    }
    return output;
  }
);
