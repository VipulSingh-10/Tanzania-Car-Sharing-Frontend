
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Clock, Car, Users, DollarSign } from 'lucide-react';
import { RideDTO, TripBasicInfoDTO } from '@/types/api';

export default function FindRides() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<RideDTO>({
    sourceLocation: '',
    destinationLocation: '',
    departureTime: '',
    seatsRequired: 1,
  });
  const [availableRides, setAvailableRides] = useState<TripBasicInfoDTO[]>([]);

  const searchMutation = useMutation({
    mutationFn: (searchData: RideDTO) => apiService.findRides(userId!, searchData),
    onSuccess: (response) => {
      if (response.success && response.responseContent) {
        setAvailableRides(response.responseContent);
        toast({
          title: 'Search completed',
          description: `Found ${response.responseContent.length} available rides`,
        });
      } else {
        setAvailableRides([]);
        toast({
          title: 'No rides found',
          description: response.errorMessage || 'No rides match your criteria',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Search failed',
        description: 'Failed to search for rides. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const joinMutation = useMutation({
    mutationFn: (rideData: RideDTO) => apiService.joinTrip(userId!, rideData),
    onSuccess: (response) => {
      if (response.success && response.responseContent?.rideJoined) {
        toast({
          title: 'Ride joined successfully!',
          description: 'You have joined the ride.',
        });
        queryClient.invalidateQueries({ queryKey: ['upcomingRides'] });
      } else {
        toast({
          title: 'Failed to join ride',
          description: response.responseContent?.errMsg || 'Could not join the ride',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to join ride. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.sourceLocation || !searchParams.destinationLocation || !searchParams.departureTime) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    searchMutation.mutate(searchParams);
  };

  const handleJoinRide = (trip: TripBasicInfoDTO) => {
    const rideData: RideDTO = {
      tripId: trip.tripId,
      sourceLocation: searchParams.sourceLocation,
      destinationLocation: searchParams.destinationLocation,
      departureTime: searchParams.departureTime,
      seatsRequired: searchParams.seatsRequired,
    };
    joinMutation.mutate(rideData);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Find Rides</h1>
          <p className="text-muted-foreground">Search for available rides that match your route</p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search for Rides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">From</Label>
                  <Input
                    id="source"
                    placeholder="Enter pickup location"
                    value={searchParams.sourceLocation}
                    onChange={(e) => setSearchParams({...searchParams, sourceLocation: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destination">To</Label>
                  <Input
                    id="destination"
                    placeholder="Enter destination"
                    value={searchParams.destinationLocation}
                    onChange={(e) => setSearchParams({...searchParams, destinationLocation: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="datetime">Departure Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={searchParams.departureTime}
                    onChange={(e) => setSearchParams({...searchParams, departureTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seats">Seats Required</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="4"
                    value={searchParams.seatsRequired}
                    onChange={(e) => setSearchParams({...searchParams, seatsRequired: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <Button type="submit" disabled={searchMutation.isPending} className="w-full">
                {searchMutation.isPending ? 'Searching...' : 'Search Rides'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {availableRides.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Rides ({availableRides.length})</h2>
            <div className="grid gap-4">
              {availableRides.map((trip) => (
                <Card key={trip.tripId}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{trip.sourceLocation}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{trip.destinationLocation}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(trip.departureTime).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Car className="h-4 w-4" />
                            <span>{trip.vehicleInfo}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{trip.availableSeats} seats available</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">Driver: {trip.driverName}</span>
                          {trip.estimatedFare && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">${trip.estimatedFare}</span>
                            </div>
                          )}
                        </div>
                        {trip.distance && trip.duration && (
                          <div className="text-sm text-muted-foreground">
                            {trip.distance} • {trip.duration}
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleJoinRide(trip)}
                        disabled={joinMutation.isPending}
                        className="ml-4"
                      >
                        {joinMutation.isPending ? 'Joining...' : 'Join Ride'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
