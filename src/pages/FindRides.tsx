
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
import LocationSearch from '@/components/LocationSearch';
import MapView, { MarkerLoc } from '@/components/MapView';
import { formatDateTimeWithTimezone } from '@/lib/timezone-utils';

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
      // Find the ride to get driverId
      const ride = rides.find(r => r.tripId === tripId);
      
      const rideData: RideDTO = {
        ...searchParams,
        tripId,
        driverId: ride?.driverId,
        rideStartTime: formatDateTimeWithTimezone(searchParams.rideStartTime)
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

  const handlePickupChange = (address: string, lat?: number, lng?: number) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      pickupPoint: {
        latitude: lat || 0,
        longitude: lng || 0,
        placeAddress: address,
      }
    }));
  };

  const handleDestinationChange = (address: string, lat?: number, lng?: number) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      destinationPoint: {
        latitude: lat || 0,
        longitude: lng || 0,
        placeAddress: address,
      }
    }));
  };


  // Prepare map markers for found rides
  const mapMarkers = rides.map((ride: any) => {
    // Handle both old and new backend response formats
    const lat = ride.sourceAddress?.latitude || ride.pickupPoint?.latitude || 0;
    const lng = ride.sourceAddress?.longitude || ride.pickupPoint?.longitude || 0;
    return { latitude: lat, longitude: lng };
  });

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
                <Label htmlFor="pickup-location">Pickup Location</Label>
                <LocationSearch
                      value={searchParams.pickupPoint.placeAddress}
                      onChange={(address, lat, lon) => setSearchParams(prev => ({
                        ...prev,
                        pickupPoint: { latitude: lat || 0, longitude: lon || 0, placeAddress: address }
                      }))}
                      placeholder="Enter pickup location"
                  />
              </div>
              <div>
                <Label htmlFor="destination-location">Destination</Label>
                <LocationSearch
                    value={searchParams.destinationPoint.placeAddress}
                    onChange={(address, lat, lon) => setSearchParams(prev => ({
                      ...prev,
                      destinationPoint: { latitude: lat || 0, longitude: lon || 0, placeAddress: address }
                    }))}
                    placeholder="Enter destination"
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

        {/* Map View of Found Rides */}
        {rides.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Rides Map</CardTitle>
            </CardHeader>
            <CardContent>
              <MapView
                markers={mapMarkers as MarkerLoc[]}
                height="256px"
              />
            </CardContent>
          </Card>
        )}

        {rides.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Available Rides</h2>
            {rides.map((ride: any) => {
              // Calculate available seats from backend data
              const availableSeats = (ride.offeredSeat || 0) - (ride.currSeats || 0);
              
              return (
                <Card key={ride.tripId}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {ride.sourceAddress?.placeAddress || ride.pickupPoint?.placeAddress || 'N/A'} → {ride.destinationAddress?.placeAddress || ride.destinationPoint?.placeAddress || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {ride.tripStartDateTimeUTC 
                                ? new Date(ride.tripStartDateTimeUTC).toLocaleString() 
                                : ride.tripStartTime 
                                  ? new Date(ride.tripStartTime).toLocaleString()
                                  : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Car className="h-4 w-4" />
                            <span>{ride.vehicleNumber || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="font-medium">Driver: {ride.driverId || ride.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{availableSeats} seats available</span>
                        </div>
                        {ride.routeDistance && (
                          <div className="text-sm text-muted-foreground">
                            Distance: {(ride.routeDistance / 1000).toFixed(1)} km • Duration: {Math.round(ride.routeDuration / 60)} min
                          </div>
                        )}
                        {ride.pricePerKm && (
                          <div className="text-sm font-semibold text-primary">
                            Price: ${((ride.routeDistance / 1000) * ride.pricePerKm).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleJoinRide(ride.tripId)}
                        disabled={availableSeats < searchParams.requestedSeats}
                      >
                        Join Ride
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
