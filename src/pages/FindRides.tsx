
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { RideDTO, TripBasicInfoDTO } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Clock, Users, Car } from 'lucide-react';

export default function FindRides() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<RideDTO>({
    pickupPoint: {
      latitude: 0,
      longitude: 0,
      placeAddress: ''
    },
    destinationPoint: {
      latitude: 0,
      longitude: 0,
      placeAddress: ''
    },
    rideStartTime: new Date().toISOString(),
    requestedSeats: 1
  });
  const [rides, setRides] = useState<TripBasicInfoDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!userId) return;
    
    setIsSearching(true);
    try {
      const response = await apiService.findRides(userId, searchParams);
      if (response.success && response.responseContent) {
        setRides(response.responseContent);
        if (response.responseContent.length === 0) {
          toast({
            title: 'No rides found',
            description: 'Try adjusting your search criteria.',
          });
        }
      } else {
        toast({
          title: 'Search failed',
          description: response.errorMessage || 'Failed to find rides',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search for rides',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinRide = async (tripId: string) => {
    if (!userId) return;

    try {
      const rideData: RideDTO = {
        ...searchParams,
        tripId
      };
      
      const response = await apiService.joinTrip(userId, rideData);
      if (response.success && response.responseContent?.rideJoined) {
        toast({
          title: 'Success!',
          description: 'You have successfully joined the ride.',
        });
        // Refresh the search results
        handleSearch();
      } else {
        toast({
          title: 'Failed to join ride',
          description: response.responseContent?.errMsg || response.errorMessage || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join ride',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Find Rides</h1>
          <p className="text-muted-foreground">Search for available carpool rides</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input
                  id="pickup"
                  placeholder="Enter pickup address"
                  value={searchParams.pickupPoint.placeAddress}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    pickupPoint: {
                      ...searchParams.pickupPoint,
                      placeAddress: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="Enter destination address"
                  value={searchParams.destinationPoint.placeAddress}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    destinationPoint: {
                      ...searchParams.destinationPoint,
                      placeAddress: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="datetime">Departure Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={searchParams.rideStartTime.slice(0, 16)}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    rideStartTime: new Date(e.target.value).toISOString()
                  })}
                />
              </div>
              <div>
                <Label htmlFor="seats">Seats Required</Label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  max="4"
                  value={searchParams.requestedSeats}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    requestedSeats: parseInt(e.target.value) || 1
                  })}
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search Rides'}
            </Button>
          </CardContent>
        </Card>

        {rides.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Available Rides</h2>
            {rides.map((ride) => (
              <Card key={ride.tripId}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {ride.pickupPoint.placeAddress} → {ride.destinationPoint.placeAddress}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(ride.tripStartTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Car className="h-4 w-4" />
                          <span>{ride.vehicleNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium">{ride.fullName}</span>
                        <span>{ride.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{ride.availableSeats} seats available</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleJoinRide(ride.tripId)}
                      disabled={ride.availableSeats < searchParams.requestedSeats}
                    >
                      Join Ride
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
