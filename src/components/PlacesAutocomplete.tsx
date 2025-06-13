
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function PlacesAutocomplete({
  value,
  onChange,
  placeholder,
  className,
  id,
  required
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
        return;
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return;
      }

      // Prevent multiple script loads
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Script is already loading, wait for it
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);
        return;
      }

      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        setError('Failed to load Google Maps API');
      };
      
      document.head.appendChild(script);
    };

    initializeAutocomplete();
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      // Use the newer Places Autocomplete Service instead of the deprecated Autocomplete
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      let timeoutId: NodeJS.Timeout;
      
      const handleInputChange = (inputValue: string) => {
        if (inputValue.length < 3) return;
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          autocompleteService.getPlacePredictions(
            {
              input: inputValue,
              types: ['establishment', 'geocode'],
              componentRestrictions: { country: 'in' }
            },
            (predictions, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                // For now, we'll just use the input value as address
                // You could implement a dropdown here to show predictions
                onChange(inputValue);
              }
            }
          );
        }, 300);
      };

      // Add event listener for input changes
      const currentInput = inputRef.current;
      const inputHandler = (e: Event) => {
        const target = e.target as HTMLInputElement;
        handleInputChange(target.value);
      };
      
      currentInput.addEventListener('input', inputHandler);
      
      return () => {
        clearTimeout(timeoutId);
        currentInput?.removeEventListener('input', inputHandler);
      };
    }
  }, [isLoaded, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 border border-red-200 rounded">
        {error}
      </div>
    );
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder || (isLoaded ? "Start typing an address..." : "Loading...")}
      className={cn(className)}
      required={required}
      disabled={!isLoaded}
    />
  );
}
