
'use server';

import {
  assessIssue as assessIssueFlow,
  type AssessIssueInput,
} from '@/ai/flows/assess-issue-severity';
import {
  findMunicipality as findMunicipalityFlow,
  type FindMunicipalityInput,
} from '@/ai/flows/find-municipality';
import { updateIssueStatus } from '@/lib/data';
import type { Status } from '@/lib/types';
import { z } from 'zod';

const assessSchema = z.object({
  photoDataUri: z.string().trim().min(1, { message: 'Photo data URI cannot be empty.' }).refine(
    (uri) => uri.startsWith('data:image/'),
    { message: 'Photo must be a valid data URI for an image (e.g., data:image/jpeg;base64,...).' }
  ),
});

export async function assessIssue(photoDataUri: string) {
  try {
    const validation = assessSchema.safeParse({ photoDataUri });

    if (!validation.success) {
      const errorMessage = validation.error.errors.map(e => e.message).join(' ');
      return { success: false, error: errorMessage };
    }
    
    const input: AssessIssueInput = { photoDataUri: validation.data.photoDataUri };

    const result = await assessIssueFlow(input);
    return { success: true, severity: result.suggestedSeverity, issueType: result.issueType };
  } catch (error) {
    console.error('AI assessment failed:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to assess issue: ${message}` };
  }
}

const findMunicipalitySchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export async function findMunicipalityAction(location: { lat: number, lng: number }) {
  try {
    const validation = findMunicipalitySchema.safeParse(location);
    if (!validation.success) {
      return { success: false, error: 'Invalid location.' };
    }

    const input: FindMunicipalityInput = validation.data;
    const result = await findMunicipalityFlow(input);
    return { success: true, municipality: result.municipality };
  } catch (error) {
    console.error('Find municipality failed:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to find municipality: ${message}` };
  }
}

const updateStatusSchema = z.object({
    issueId: z.string().trim().min(1, 'Issue ID cannot be empty.'),
    status: z.enum(['Received', 'Under Review', 'Repair Scheduled', 'Repair In Progress', 'Resolved', 'Cannot Action']),
});

export async function updateIssueStatusAction(issueId: string, status: Status) {
    try {
        const validation = updateStatusSchema.safeParse({ issueId, status });

        if (!validation.success) {
            const errorMessage = validation.error.errors.map(e => e.message).join(' ');
            console.error("Status update validation failed:", errorMessage);
            return { success: false, error: `Invalid input: ${errorMessage}` };
        }
        
        const updatedIssue = updateIssueStatus(issueId, status);
        if (updatedIssue) {
            return { success: true, issue: updatedIssue };
        } else {
            console.error(`Issue not found for ID: ${issueId}`);
            return { success: false, error: 'Issue not found.' };
        }
    } catch (error) {
        console.error(`Failed to update status for issue ${issueId}:`, error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to update status: ${message}` };
    }
}
