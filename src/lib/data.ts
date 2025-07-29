
import type { Issue, Status } from './types';

const defaultIssues: Issue[] = [
    {
        id: '1',
        type: 'Pothole',
        severity: 'Moderate',
        status: 'Received',
        location: { lat: 28.6139, lng: 77.2090 },
        address: 'Connaught Place, New Delhi, Delhi',
        photoUrl: 'https://placehold.co/600x400.png',
        photoHint: 'pothole road',
        description: 'Large pothole in the middle of the road, causing traffic issues.',
        submittedAt: new Date('2025-07-15T10:00:00Z'),
        updatedAt: new Date('2025-07-15T10:00:00Z'),
        municipality: 'NDMC',
    },
    {
        id: '2',
        type: 'Waterlogging',
        severity: 'Severe/Hazardous',
        status: 'Under Review',
        location: { lat: 12.9716, lng: 77.5946 },
        address: 'MG Road, Bengaluru, Karnataka',
        photoUrl: 'https://placehold.co/600x400.png',
        photoHint: 'waterlogged street',
        description: 'Severe waterlogging after rain, making the road impassable for smaller vehicles.',
        submittedAt: new Date('2025-07-14T14:30:00Z'),
        updatedAt: new Date('2025-07-16T11:20:00Z'),
        municipality: 'BBMP',
    },
    {
        id: '3',
        type: 'Broken Road',
        severity: 'Minor',
        status: 'Resolved',
        location: { lat: 19.0760, lng: 72.8777 },
        address: 'Bandra Kurla Complex, Mumbai, Maharashtra',
        photoUrl: 'https://placehold.co/600x400.png',
        photoHint: 'cracked asphalt',
        description: 'Minor cracks on the pavement.',
        submittedAt: new Date('2025-07-10T09:00:00Z'),
        updatedAt: new Date('2025-07-18T16:45:00Z'),
        resolvedAt: new Date('2025-07-18T16:45:00Z'),
        municipality: 'BMC',
    },
     {
        id: '4',
        type: 'Pothole',
        severity: 'Severe/Hazardous',
        status: 'Repair In Progress',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Park Street, Kolkata, West Bengal',
        photoUrl: 'https://placehold.co/600x400.png',
        photoHint: 'deep pothole',
        description: 'A very deep and dangerous pothole near the main crossing. Multiple vehicles have been damaged.',
        submittedAt: new Date('2025-06-20T11:00:00Z'),
        updatedAt: new Date('2025-07-20T10:00:00Z'),
        municipality: 'KMC',
    },
];

const ISSUES_STORAGE_KEY = 'roadit_issues';

function getStoredIssues(): Issue[] | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem(ISSUES_STORAGE_KEY);
  if (stored) {
    // Dates are stored as strings in JSON, so we need to parse them back
    return JSON.parse(stored).map((issue: any) => ({
      ...issue,
      submittedAt: new Date(issue.submittedAt),
      updatedAt: new Date(issue.updatedAt),
      resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : undefined,
    }));
  }
  return null;
}

function setStoredIssues(issues: Issue[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(issues));
  }
}

// Initialize with default issues if nothing is in storage
if (typeof window !== 'undefined' && !localStorage.getItem(ISSUES_STORAGE_KEY)) {
  setStoredIssues(defaultIssues);
}

export function getIssues(): Issue[] {
  return getStoredIssues() || defaultIssues;
}

export function updateIssueStatus(id: string, status: Status): Issue | null {
    const issues = getIssues();
    const issueIndex = issues.findIndex(i => i.id === id);
    if (issueIndex > -1) {
        const issueToUpdate = issues[issueIndex];

        // Create a new object with the updated properties
        const updatedIssue = {
            ...issueToUpdate,
            status: status,
            updatedAt: new Date(),
        };

        if (status === 'Resolved' && !updatedIssue.resolvedAt) {
            updatedIssue.resolvedAt = new Date();
        } else if (status !== 'Resolved' && updatedIssue.resolvedAt) {
            // If status is changed from Resolved to something else, clear the resolvedAt date
            delete updatedIssue.resolvedAt;
        }
        
        // Create a new array with the updated issue
        const updatedIssues = [
            ...issues.slice(0, issueIndex),
            updatedIssue,
            ...issues.slice(issueIndex + 1),
        ];

        setStoredIssues(updatedIssues);
        return updatedIssue;
    }
    return null;
}


export function addIssue(issue: Omit<Issue, 'id' | 'submittedAt' | 'updatedAt' | 'resolvedAt'>): Issue {
    const issues = getIssues();
    const newIssue: Issue = {
        ...issue,
        id: new Date().getTime().toString(),
        submittedAt: new Date(),
        updatedAt: new Date(),
    };
    const newIssues = [newIssue, ...issues];
    setStoredIssues(newIssues);
    return newIssue;
}
