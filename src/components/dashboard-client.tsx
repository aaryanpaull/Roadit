
'use client';

import { useState, useEffect } from 'react';
import type { Issue, Status } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { subDays } from 'date-fns';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';
import { getIssues } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateIssueStatusAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

const statusOptions: Status[] = ['Received', 'Under Review', 'Repair Scheduled', 'Repair In Progress', 'Resolved', 'Cannot Action'];

const getStatusColor = (status: Issue['status'], submittedAt: Date): string => {
  if (status === 'Resolved') return 'bg-green-500/80 text-green-50';
  if (status === 'Cannot Action') return 'bg-gray-500/80 text-gray-50';
  if (subDays(new Date(), 7) > new Date(submittedAt) && status !== 'Resolved') {
      return 'bg-accent text-accent-foreground';
  }
  if (status === 'Received' || status === 'Under Review') return 'bg-yellow-500/80 text-yellow-50';
  return 'bg-primary text-primary-foreground';
};

const getSeverityBadgeVariant = (severity: Issue['severity']): "destructive" | "default" | "secondary" => {
    switch (severity) {
        case 'Severe/Hazardous': return 'destructive';
        case 'Moderate': return 'default';
        case 'Minor': return 'secondary';
    }
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
};

export default function DashboardClient() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMunicipalUser, setIsMunicipalUser] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsMounted(true);
    const allIssues = getIssues();
    setIssues(allIssues);
    if (allIssues.length > 0) {
      setSelectedIssue(allIssues[0]);
    }
    const userRole = localStorage.getItem('userRole');
    setIsMunicipalUser(userRole === 'municipal');
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const handleStatusChange = async (issueId: string, newStatus: Status) => {
    setUpdatingStatusId(issueId);
    
    const result = await updateIssueStatusAction(issueId, newStatus);

    if (result.success && result.issue) {
        // Create a new array with the updated issue
        setIssues(currentIssues => 
            currentIssues.map(i => (i.id === issueId ? result.issue! : i))
        );
        // Update the selected issue if it's the one being changed
        if (selectedIssue?.id === issueId) {
            setSelectedIssue(result.issue);
        }
        toast({
            title: 'Status Updated',
            description: `Issue status changed to "${newStatus}".`
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: result.error || 'An unknown error occurred.',
        });
    }
    
    setUpdatingStatusId(null);
  };

  const mapCenter = selectedIssue ? selectedIssue.location : { lat: 20.5937, lng: 78.9629 }; // Centered on India

  if (!isMounted) {
    return (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
         <div className="lg:col-span-2 h-full min-h-[300px] lg:min-h-0">
            <Skeleton className="h-full w-full" />
         </div>
         <div className="h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-2 font-headline">Reported Issues</h2>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[100px] w-full" />)}
            </div>
         </div>
       </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className="lg:col-span-2 h-full min-h-[300px] lg:min-h-0">
        <Card className="h-full">
          <CardContent className="p-0 h-full relative overflow-hidden rounded-lg">
            {loadError && <div className='flex items-center justify-center h-full'>Error loading map</div>}
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={selectedIssue ? 14 : 5}
                options={mapOptions}
              >
                {issues.map(issue => (
                   <Marker
                        key={issue.id}
                        position={issue.location}
                        onClick={() => setSelectedIssue(issue)}
                        title={issue.address}
                    />
                ))}
              </GoogleMap>
            ) : <Skeleton className="h-full w-full" />}
          </CardContent>
        </Card>
      </div>
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-2 font-headline">Reported Issues</h2>
        <ScrollArea className="flex-1 -mr-4">
          <div className="space-y-4 pr-4">
            {issues.length === 0 && <p className="text-muted-foreground">No issues reported yet.</p>}
            {issues.map(issue => (
              <Card
                key={issue.id}
                className={cn(
                  "hover:shadow-lg transition-all duration-300",
                  selectedIssue?.id === issue.id ? 'border-primary ring-2 ring-primary' : 'border-card'
                )}
                
              >
                <CardContent className="p-3">
                  <div className="flex gap-4 items-start" onClick={() => setSelectedIssue(issue)}>
                    <div className="block shrink-0">
                      <img
                        src={issue.photoUrl}
                        alt={issue.type}
                        width={80}
                        height={80}
                        className="rounded-md object-cover aspect-square cursor-pointer"
                        data-ai-hint={issue.photoHint}
                      />
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                      <Link href={`/issues/${issue.id}`} passHref>
                        <h3 className="font-semibold truncate hover:underline">{issue.type}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">{issue.address}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={cn("border-transparent", getStatusColor(issue.status, issue.submittedAt))}>
                          {issue.status}
                        </Badge>
                        <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isMunicipalUser && (
                    <div className="mt-3 flex items-center gap-2">
                       <Select 
                          value={issue.status} 
                          onValueChange={(newStatus: Status) => handleStatusChange(issue.id, newStatus)}
                          disabled={updatingStatusId === issue.id}
                        >
                          <SelectTrigger className="w-full text-xs h-8">
                              <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                              {statusOptions.map(opt => (
                                  <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      {updatingStatusId === issue.id && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
