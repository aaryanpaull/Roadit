export type IssueType = 'Pothole' | 'Waterlogging' | 'Broken Road' | 'Other';
export type Severity = 'Minor' | 'Moderate' | 'Severe/Hazardous';
export type Status = 'Received' | 'Under Review' | 'Repair Scheduled' | 'Repair In Progress' | 'Resolved' | 'Cannot Action';

export type Issue = {
  id: string;
  type: IssueType;
  severity: Severity;
  status: Status;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  photoUrl: string;
  photoHint: string;
  description: string;
  submittedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  cannotActionReason?: string;
  municipality: 'NDMC' | 'BMC' | 'BBMP' | 'KMC' | 'GCC' | 'GHMC';
};
