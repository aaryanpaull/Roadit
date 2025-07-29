
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Loader2, Tag, Building } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Severity, IssueType } from '@/lib/types';
import LocationPicker from './location-picker';
import { assessIssue, findMunicipalityAction } from '@/app/actions';
import { addIssue } from '@/lib/data';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  photo: z.any().refine(file => file instanceof File, 'Photo is required.'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  issueType: z.enum(['Pothole', 'Waterlogging', 'Broken Road', 'Other']),
  severity: z.enum(['Minor', 'Moderate', 'Severe/Hazardous']),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  municipality: z.string().min(1, 'Municipality is required.'),
});

const severities: Severity[] = ['Minor', 'Moderate', 'Severe/Hazardous'];

export default function ReportIssueForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isFindingMunicipality, setIsFindingMunicipality] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  const issueType = form.watch('issueType');
  const location = form.watch('location');
  const municipality = form.watch('municipality');

  useEffect(() => {
    if (location) {
      const fetchMunicipality = async () => {
        setIsFindingMunicipality(true);
        form.setValue('municipality', '');
        const result = await findMunicipalityAction(location);
        setIsFindingMunicipality(false);
        if (result.success && result.municipality) {
          form.setValue('municipality', result.municipality);
        } else {
          toast({
            variant: 'destructive',
            title: 'Could not find municipality',
            description: result.error || 'Please check the location or enter the municipality manually.',
          });
        }
      };
      fetchMunicipality();
    }
  }, [location, form, toast]);


  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setPhotoPreview(dataUri);
        setIsAssessing(true);

        const result = await assessIssue(dataUri);
        
        setIsAssessing(false);
        if (result.success && result.severity && result.issueType) {
          form.setValue('severity', result.severity);
          form.setValue('issueType', result.issueType);
          toast({
            title: 'AI Assessment Complete',
            description: `We've classified this as a "${result.issueType}" with "${result.severity}" severity. You can adjust severity if needed.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'AI Assessment Failed',
            description: result.error || 'Could not assess image. Please set the type and severity manually.',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Simulate uploading the image and getting a URL
    await new Promise(resolve => setTimeout(resolve, 1000));
    const photoUrl = photoPreview!; // In real app, this would be a URL from a storage service

    const newIssueData = {
        type: values.issueType,
        severity: values.severity,
        location: values.location,
        address: 'User-provided address (placeholder)', // This could also be reverse-geocoded
        photoUrl: photoUrl,
        photoHint: `${values.issueType.toLowerCase()} road`,
        description: values.description,
        municipality: values.municipality as any,
        status: 'Received' as const,
    };
    
    addIssue(newIssueData);

    setIsSubmitting(false);
    toast({
      title: 'Issue Reported Successfully!',
      description: 'Thank you for your contribution to improving our roads.',
    });
    form.reset();
    setPhotoPreview(null);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
                <Card>
                  <CardContent className="p-4">
                    <FormField
                      control={form.control}
                      name="photo"
                      render={() => (
                        <FormItem>
                          <FormLabel>Issue Photo</FormLabel>
                          <FormControl>
                            <div className="relative w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 flex items-center justify-center text-center p-4">
                              {photoPreview ? (
                                <img src={photoPreview} alt="Issue preview" className="absolute inset-0 w-full h-full object-cover rounded-md" />
                              ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                  <Camera className="w-10 h-10" />
                                  <span>Click to upload or drag & drop</span>
                                </div>
                              )}
                              <Input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoChange} />
                              {isAssessing && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                                  <Loader2 className="w-8 h-8 animate-spin" />
                                  <span className="ml-2">AI is assessing...</span>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <LocationPicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        We'll try to detect your location. You can adjust it on the map.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="space-y-8">
               <FormItem>
                <FormLabel>Responsible Municipal Body</FormLabel>
                 <Card>
                  <CardContent className="p-4">
                    {isFindingMunicipality ? (
                       <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin"/>
                          <span className="text-sm text-muted-foreground">Finding municipal body...</span>
                        </div>
                    ) : municipality ? (
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary"/>
                        <span className="font-semibold">{municipality}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Select a location to find the responsible municipal body.
                      </p>
                    )}
                  </CardContent>
                </Card>
                <FormField
                  control={form.control}
                  name="municipality"
                  render={() => <FormMessage />}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Type of Issue</FormLabel>
                <Card>
                  <CardContent className="p-4">
                    {issueType ? (
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary"/>
                        <span className="font-semibold">{issueType}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        The issue type will be determined by AI after you upload a photo.
                      </p>
                    )}
                  </CardContent>
                </Card>
                <FormField
                  control={form.control}
                  name="issueType"
                  render={() => <FormMessage />}
                />
              </FormItem>

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Severity (AI Suggested)</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {severities.map(level => (
                           <FormItem key={level} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={level} disabled={!issueType} />
                                </FormControl>
                                <FormLabel className="font-normal">{level}</FormLabel>
                           </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about the issue..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
        </div>

        <Button type="submit" disabled={isSubmitting || isAssessing || isFindingMunicipality} className="w-full md:w-auto">
          {(isSubmitting || isAssessing || isFindingMunicipality) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>
      </form>
    </Form>
  );
}
