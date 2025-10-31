
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { RideBasicInfoDTO, CancelRideRequestDTO, DriverUpcomingTripDTO, PassengerUpcomingRideDTO } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Car, Users, X, DollarSign, Calendar, Navigation } from 'lucide-react';

export default function MyRides() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch driver's upcoming trips (rides they're offering)
  const { data: driverTrips, isLoading: loadingDriverTrips } = useQuery({
    queryKey: ['driverTrips', userId],
    queryFn: () => apiService.getUpcomingRides(userId!),
    enabled: !!userId,
  });

  // Fetch passenger's upcoming rides (rides they've booked)
  const { data: passengerRides, isLoading: loadingPassengerRides } = useQuery({
    queryKey: ['passengerRides', userId],
    queryFn: () => apiService.getMyUpcomingRidesAsPassenger(userId!),
    enabled: !!userId,
  });

  const { data: historyRides, isLoading: loadingHistory } = useQuery({
    queryKey: ['historyRides', userId],
    queryFn: () => apiService.getHistoryRides(userId!),
    enabled: !!userId,
  });

  const cancelRideMutation = useMutation({
    mutationFn: ({ tripId, reason }: { tripId: string; reason?: string }) => {
      const cancelData: CancelRideRequestDTO = {
        tripId,
        cancellationReason: reason
      };
      return apiService.cancelRide(userId!, cancelData);
    },
    onSuccess: (data) => {
      if (data.success && data.responseContent?.rideCancelled) {
        toast({
          title: 'Ride cancelled',
          description: 'Your ride has been successfully cancelled.',
        });
        queryClient.invalidateQueries({ queryKey: ['driverTrips', userId] });
        queryClient.invalidateQueries({ queryKey: ['passengerRides', userId] });
        queryClient.invalidateQueries({ queryKey: ['historyRides', userId] });
      } else {
        toast({
          title: 'Cancellation failed',
          description: data.responseContent?.errMsg || data.errorMessage || 'Failed to cancel ride',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel ride',
        variant: 'destructive',
      });
    },
  });

  const handleCancelRide = async (tripId: string) => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      cancelRideMutation.mutate({ tripId });
    }
  };

  const RideCard = ({ ride, showCancelButton = false }: { ride: RideBasicInfoDTO; showCancelButton?: boolean }) => (
    <Card>
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
                <span>{new Date(ride.rideStartTime).toLocaleString()}</span>
              </div>
              {ride.vehicleNumber && (
                <div className="flex items-center space-x-1">
                  <Car className="h-4 w-4" />
                  <span>{ride.vehicleNumber}</span>
                </div>
              )}
            </div>
            {ride.seats && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{ride.seats}</span>
              </div>
            )}
            <div className="inline-block">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ride.tripStatus === 'ALLOTTED' ? 'bg-green-100 text-green-800' :
                ride.tripStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                ride.tripStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ride.tripStatus}
              </span>
            </div>
          </div>
          {showCancelButton && ride.tripStatus === 'ALLOTTED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancelRide(ride.tripId)}
              disabled={cancelRideMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );


  // Component for Passenger's Ride Card (rides they've booked)
  const PassengerRideCard = ({ ride, showCancelButton = false }: { ride: PassengerUpcomingRideDTO; showCancelButton?: boolean }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                As Passenger
              </Badge>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ride.rideStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                ride.rideStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                ride.rideStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ride.rideStatus}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {ride.pickupLocation.placeAddress} → {ride.dropoffLocation.placeAddress}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(ride.tripStartDateTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Car className="h-4 w-4" />
                <span>{ride.vehicleNumber || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Driver:</span>{' '}
                <span className="font-medium">{ride.driverId}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">{ride.bookedSeats}</span> seat(s)
                </span>
              </div>
            </div>

            {ride.estimatedFare && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Estimated fare:</span>{' '}
                  <span className="font-medium text-blue-600">${ride.estimatedFare.toFixed(2)}</span>
                </span>
              </div>
            )}
          </div>
          {showCancelButton && ride.rideStatus === 'CONFIRMED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancelRide(ride.rideId)}
              disabled={cancelRideMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // New component for Driver's Trip Card
  const DriverTripCard = ({ trip, showCancelButton = false }: { trip: DriverUpcomingTripDTO; showCancelButton?: boolean }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                As Driver
              </Badge>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                trip.tripStatus === 'OFFERED' ? 'bg-blue-100 text-blue-800' :
                trip.tripStatus === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                trip.tripStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                trip.tripStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {trip.tripStatus}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {trip.sourceAddress.placeAddress} → {trip.destinationAddress.placeAddress}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(trip.tripStartDateTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Car className="h-4 w-4" />
                <span>{trip.vehicleNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Distance:</span>{' '}
                <span className="font-medium">{trip.routeDistanceInKm.toFixed(1)} km</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>{' '}
                <span className="font-medium">{Math.round(trip.routeDurationInMinutes)} min</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">{trip.availableSeats}</span> available
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Booked:</span>{' '}
                <span className="font-medium">{trip.bookedSeats}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">
                  ${trip.estimatedEarnings.toFixed(2)}
                </span>
              </div>
            </div>

            {trip.passengers && trip.passengers.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm font-medium mb-1">Passengers ({trip.passengers.length}):</p>
                <div className="space-y-1">
                  {trip.passengers.map((passenger, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground pl-4">
                      • {passenger.userId} - {passenger.bookedSeats} seat(s)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {showCancelButton && trip.tripStatus === 'OFFERED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancelRide(trip.tripId)}
              disabled={cancelRideMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const driverTripsData = driverTrips?.responseContent || [];
  const passengerRidesData = passengerRides?.responseContent || [];
  const historyRidesData = historyRides?.responseContent || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Rides</h1>
          <p className="text-muted-foreground">Manage your trips as driver and passenger</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {/* Driver Trips Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">My Trips (As Driver)</h2>
                <Badge variant="secondary">{driverTripsData.length}</Badge>
              </div>
              
              {loadingDriverTrips ? (
                <div className="text-center py-8">Loading your trips...</div>
              ) : driverTripsData.length > 0 ? (
                <div className="space-y-4">
                  {driverTripsData.map((trip) => (
                    <DriverTripCard key={trip.tripId} trip={trip} showCancelButton={true} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No upcoming trips as driver.</p>
                    <p className="text-sm text-muted-foreground mt-1">Offer a ride to get started!</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Passenger Rides Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-semibold">My Bookings (As Passenger)</h2>
                <Badge variant="secondary">{passengerRidesData.length}</Badge>
              </div>
              
              {loadingPassengerRides ? (
                <div className="text-center py-8">Loading your bookings...</div>
              ) : passengerRidesData.length > 0 ? (
                <div className="space-y-4">
                  {passengerRidesData.map((ride) => (
                    <PassengerRideCard key={ride.rideId} ride={ride} showCancelButton={true} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No upcoming bookings as passenger.</p>
                    <p className="text-sm text-muted-foreground mt-1">Book a ride to get started!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loadingHistory ? (
              <div className="text-center py-8">Loading ride history...</div>
            ) : historyRidesData.length > 0 ? (
              <div className="space-y-4">
                {historyRidesData.map((ride) => (
                  <RideCard key={ride.tripId} ride={ride} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No ride history found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
