
'use client';

import type { Issue, Status } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, Calendar, MapPin, Tag, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { updateIssueStatusAction } from '@/app/actions';


const statusOptions: Status[] = ['Received', 'Under Review', 'Repair Scheduled', 'Repair In Progress', 'Resolved', 'Cannot Action'];

const getSeverityClass = (severity: Issue['severity']) => {
    switch (severity) {
        case 'Severe/Hazardous': return 'text-destructive';
        case 'Moderate': return 'text-orange-500';
        case 'Minor': return 'text-green-600';
    }
}

export default function IssueDetails({ issue: initialIssue }: { issue: Issue }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [issue, setIssue] = useState(initialIssue);
  const [selectedStatus, setSelectedStatus] = useState<Status>(issue.status);
  const [isMunicipalUser, setIsMunicipalUser] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setIsMunicipalUser(userRole === 'municipal');
  }, []);

  // Sync state if initialIssue prop changes
  useEffect(() => {
    setIssue(initialIssue);
    setSelectedStatus(initialIssue.status);
  }, [initialIssue]);

  const handleStatusUpdate = async () => {
    if (selectedStatus === issue.status) return;
    setIsUpdating(true);
    
    const result = await updateIssueStatusAction(issue.id, selectedStatus);
    
    if (result.success && result.issue) {
        // Directly update the local state with the returned issue data
        setIssue(result.issue);
        toast({
            title: "Status Updated",
            description: `Issue status changed to "${selectedStatus}".`
        });
        // Refresh router cache to ensure other parts of the app are up-to-date
        router.refresh(); 
    } else {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: result.error || 'An unknown error occurred.',
        });
        // Revert the visual state if the update fails
        setSelectedStatus(issue.status);
    }
    
    setIsUpdating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{issue.type}</CardTitle>
            <CardDescription>{issue.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
              <img src={issue.photoUrl} alt={issue.type} className="absolute inset-0 w-full h-full object-cover" data-ai-hint={issue.photoHint} />
            </div>
            <p className="text-foreground">{issue.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline">Issue Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
                <ShieldAlert className={cn("w-5 h-5", getSeverityClass(issue.severity))} />
                <span>Severity: <Badge variant={issue.severity === 'Severe/Hazardous' ? 'destructive' : issue.severity === 'Moderate' ? 'default' : 'secondary'}>{issue.severity}</Badge></span>
            </div>
            <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <span>Status: <Badge>{issue.status}</Badge></span>
            </div>
            <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span>{`Lat: ${issue.location.lat.toFixed(4)}, Lng: ${issue.location.lng.toFixed(4)}`}</span>
            </div>
            <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span>Reported: {format(new Date(issue.submittedAt), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span>Last Update: {format(new Date(issue.updatedAt), 'PPP p')}</span>
            </div>
          </CardContent>
        </Card>
        
        {isMunicipalUser && (
          <Card>
              <CardHeader>
                  <CardTitle className="text-xl font-headline">Manage Status</CardTitle>
                  <CardDescription>For municipal officials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <Select value={selectedStatus} onValueChange={(v: Status) => setSelectedStatus(v)}>
                      <SelectTrigger>
                          <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                          {statusOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <Button onClick={handleStatusUpdate} disabled={isUpdating || selectedStatus === issue.status} className="w-full">
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Status
                  </Button>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
