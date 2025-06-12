
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Car } from 'lucide-react';
import { OfferRideDTO } from '@/types/api';

export default function CreateTrip() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tripData, setTripData] = useState<OfferRideDTO>({
    sourceLocation: '',
    destinationLocation: '',
    departureTime: '',
    availableSeats: 1,
    vehicleId: '',
    estimatedFare: 0,
    notes: '',
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => apiService.getUserVehicles(userId!),
    enabled: !!userId,
  });

  const createTripMutation = useMutation({
    mutationFn: (data: OfferRideDTO) => apiService.createTrip(userId!, data),
    onSuccess: (response) => {
      if (response.success && response.responseContent?.tripCreated) {
        toast({
          title: 'Trip created successfully!',
          description: 'Your trip has been posted and is now available for others to join.',
        });
        setTripData({
          sourceLocation: '',
          destinationLocation: '',
          departureTime: '',
          availableSeats: 1,
          vehicleId: '',
          estimatedFare: 0,
          notes: '',
        });
        queryClient.invalidateQueries({ queryKey: ['upcomingRides'] });
      } else {
        toast({
          title: 'Failed to create trip',
          description: response.responseContent?.errMsg || 'Could not create trip',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create trip. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripData.sourceLocation || !tripData.destinationLocation || !tripData.departureTime || !tripData.vehicleId) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createTripMutation.mutate(tripData);
  };

  const vehiclesData = vehicles?.responseContent || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Trip</h1>
          <p className="text-muted-foreground">Offer a ride to help others reach their destination</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Trip Details</span>
            </CardTitle>
            <CardDescription>
              Fill in the details of your trip to make it available for others to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">From *</Label>
                  <Input
                    id="source"
                    placeholder="Enter pickup location"
                    value={tripData.sourceLocation}
                    onChange={(e) => setTripData({...tripData, sourceLocation: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destination">To *</Label>
                  <Input
                    id="destination"
                    placeholder="Enter destination"
                    value={tripData.destinationLocation}
                    onChange={(e) => setTripData({...tripData, destinationLocation: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="datetime">Departure Time *</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={tripData.departureTime}
                    onChange={(e) => setTripData({...tripData, departureTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seats">Available Seats *</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="8"
                    value={tripData.availableSeats}
                    onChange={(e) => setTripData({...tripData, availableSeats: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fare">Estimated Fare ($)</Label>
                  <Input
                    id="fare"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tripData.estimatedFare}
                    onChange={(e) => setTripData({...tripData, estimatedFare: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicle">Select Vehicle *</Label>
                <Select
                  value={tripData.vehicleId}
                  onValueChange={(value) => setTripData({...tripData, vehicleId: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiclesData.map((vehicle) => (
                      <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span>{vehicle.make} {vehicle.model} ({vehicle.licensePlate})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vehiclesData.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    No vehicles found. Please add a vehicle first.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information for passengers..."
                  value={tripData.notes}
                  onChange={(e) => setTripData({...tripData, notes: e.target.value})}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                disabled={createTripMutation.isPending || vehiclesData.length === 0}
                className="w-full"
              >
                {createTripMutation.isPending ? 'Creating Trip...' : 'Create Trip'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
