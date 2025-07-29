'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { LocateFixed } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';

interface LocationPickerProps {
  value?: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number }) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { toast } = useToast();
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const handleLocationFetch = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Geolocation is not supported by your browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onChange(newLocation);
        toast({ title: 'Location captured successfully.' });
      },
      () => {
        toast({ variant: 'destructive', title: 'Unable to retrieve your location.' });
      }
    );
  }, [onChange, toast]);

  useEffect(() => {
    // Automatically fetch location on mount if not already set
    if (!value) {
      handleLocationFetch();
    }
  }, [value, handleLocationFetch]);

  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      onChange(newLocation);
    }
  };

  return (
    <Card>
      <CardContent className="p-2 space-y-2">
        <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
            {loadError && <div className='flex items-center justify-center h-full'>Error loading map. Please check the API key.</div>}
            {!isLoaded ? (
                 <Skeleton className="h-full w-full" />
            ) : (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={value || defaultCenter}
                    zoom={value ? 15 : 5}
                    options={mapOptions}
                >
                    {value && <Marker position={value} draggable={true} onDragEnd={onMarkerDragEnd} />}
                </GoogleMap>
            )}
        </div>
        <div className='flex justify-between items-center p-2'>
            <div className="text-sm text-muted-foreground">
              {value ? `Lat: ${value.lat.toFixed(4)}, Lng: ${value.lng.toFixed(4)}` : 'No location set'}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleLocationFetch}>
                <LocateFixed className="w-4 h-4 mr-2" />
                Get Current Location
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
