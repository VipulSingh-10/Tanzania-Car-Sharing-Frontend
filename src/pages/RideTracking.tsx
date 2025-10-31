
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { 
  MapPin, 
  Clock, 
  Users, 
  Car,
  Phone,
  Navigation,
  AlertCircle,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { DriverUpcomingTripDTO, PassengerUpcomingRideDTO } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SelectedRide = 
  | { type: 'driver'; data: DriverUpcomingTripDTO }
  | { type: 'passenger'; data: PassengerUpcomingRideDTO }
  | null;

export default function RideTracking() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [selectedRide, setSelectedRide] = useState<SelectedRide>(null);

  // Fetch driver trips (rides you're offering)
  const { data: driverTripsResponse, refetch: refetchDriverTrips } = useQuery({
    queryKey: ['driver-trips', userId],
    queryFn: () => apiService.getUpcomingRides(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Fetch passenger rides (rides you've booked)
  const { data: passengerRidesResponse, refetch: refetchPassengerRides } = useQuery({
    queryKey: ['passenger-rides', userId],
    queryFn: () => apiService.getMyUpcomingRidesAsPassenger(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const driverTrips = driverTripsResponse?.responseContent || [];
  const passengerRides = passengerRidesResponse?.responseContent || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const handleCancelRide = async (tripId: string) => {
    try {
      const response = await apiService.cancelRide(userId!, {
        tripId,
        cancellationReason: 'User cancelled',
      });

      if (response.success && response.responseContent?.rideCancelled) {
        toast({
          title: 'Ride Cancelled',
          description: 'Your ride has been successfully cancelled.',
        });
        refetchDriverTrips();
        refetchPassengerRides();
        setSelectedRide(null);
      } else {
        toast({
          title: 'Cancellation Failed',
          description: response.responseContent?.errMsg || 'Failed to cancel ride.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel ride. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Rides</h1>
          <p className="text-muted-foreground">Monitor your active and upcoming rides in real-time</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All Rides ({driverTrips.length + passengerRides.length})</TabsTrigger>
            <TabsTrigger value="driver">As Driver ({driverTrips.length})</TabsTrigger>
            <TabsTrigger value="passenger">As Passenger ({passengerRides.length})</TabsTrigger>
          </TabsList>

          {/* ALL RIDES TAB */}
          <TabsContent value="all">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {driverTrips.length === 0 && passengerRides.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Active Rides</h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have any active or upcoming rides at the moment.
                      </p>
                      <Button onClick={() => window.location.href = '/book-ride'}>
                        Book a Ride
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Driver Trips */}
                    {driverTrips.map((ride) => (
                      <Card 
                        key={`driver-${ride.tripId}`}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedRide?.type === 'driver' && selectedRide.data.tripId === ride.tripId ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedRide({ type: 'driver', data: ride })}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Car className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">Trip #{ride.tripId.slice(-8)}</h3>
                                  <Badge className="bg-blue-100 text-blue-800">Driver</Badge>
                                </div>
                                <Badge className={getStatusColor(ride.tripStatus)}>
                                  {getStatusIcon(ride.tripStatus)}
                                  <span className="ml-1">{ride.tripStatus}</span>
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Car className="h-4 w-4" />
                                <span>{ride.vehicleNumber}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{ride.sourceAddress.placeAddress}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-red-600" />
                              <span className="text-sm">{ride.destinationAddress.placeAddress}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">{formatDateTime(ride.tripStartDateTime)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-purple-600" />
                              <span className="text-sm">{ride.bookedSeats}/{ride.offeredSeat} seats booked</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm">View Details</Button>
                            {ride.tripStatus.toLowerCase() !== 'completed' && ride.tripStatus.toLowerCase() !== 'cancelled' && (
                              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleCancelRide(ride.tripId); }}>
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Passenger Rides */}
                    {passengerRides.map((ride) => (
                      <Card 
                        key={`passenger-${ride.rideId}`}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedRide?.type === 'passenger' && selectedRide.data.rideId === ride.rideId ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => setSelectedRide({ type: 'passenger', data: ride })}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">Ride #{ride.rideId.slice(-8)}</h3>
                                  <Badge className="bg-purple-100 text-purple-800">Passenger</Badge>
                                </div>
                                <Badge className={getStatusColor(ride.rideStatus)}>
                                  {getStatusIcon(ride.rideStatus)}
                                  <span className="ml-1">{ride.rideStatus}</span>
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Car className="h-4 w-4" />
                                <span>{ride.vehicleNumber}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{ride.pickupLocation.placeAddress}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-red-600" />
                              <span className="text-sm">{ride.dropoffLocation.placeAddress}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">{formatDateTime(ride.tripStartDateTime)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-purple-600" />
                              <span className="text-sm">{ride.bookedSeats} seat(s) booked</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm">View Details</Button>
                            {ride.rideStatus.toLowerCase() !== 'completed' && ride.rideStatus.toLowerCase() !== 'cancelled' && (
                              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleCancelRide(ride.tripId); }}>
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Ride Details Panel */}
              <RideDetailsPanel selectedRide={selectedRide} handleCancelRide={handleCancelRide} />
            </div>
          </TabsContent>

          {/* DRIVER TAB */}
          <TabsContent value="driver">
            <DriverTripsView 
              driverTrips={driverTrips} 
              selectedRide={selectedRide} 
              setSelectedRide={setSelectedRide}
              handleCancelRide={handleCancelRide}
            />
          </TabsContent>

          {/* PASSENGER TAB */}
          <TabsContent value="passenger">
            <PassengerRidesView 
              passengerRides={passengerRides} 
              selectedRide={selectedRide} 
              setSelectedRide={setSelectedRide}
              handleCancelRide={handleCancelRide}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Helper Components
function RideDetailsPanel({ selectedRide, handleCancelRide }: { selectedRide: SelectedRide; handleCancelRide: (tripId: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'offered':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  if (!selectedRide) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Ride Details</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select a ride from the list to view details and track its status.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedRide.type === 'driver') {
    const ride = selectedRide.data;
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Trip Details</h2>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <span>Trip #{ride.tripId.slice(-8)}</span>
              <Badge className="bg-blue-100 text-blue-800">Driver</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(ride.tripStatus)}>
                {getStatusIcon(ride.tripStatus)}
                <span className="ml-1">{ride.tripStatus}</span>
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">From</label>
                <p className="text-sm">{ride.sourceAddress.placeAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">To</label>
                <p className="text-sm">{ride.destinationAddress.placeAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Departure</label>
                <p className="text-sm">{formatDateTime(ride.tripStartDateTime)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
                <p className="text-sm">{ride.vehicleNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Seats</label>
                <p className="text-sm">{ride.bookedSeats}/{ride.offeredSeat} booked</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Passengers</label>
                <p className="text-sm">{ride.passengers?.length || 0} passengers</p>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              {ride.tripStatus.toLowerCase() !== 'completed' && ride.tripStatus.toLowerCase() !== 'cancelled' && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => handleCancelRide(ride.tripId)}
                >
                  Cancel Trip
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    const ride = selectedRide.data;
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Ride Details</h2>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Ride #{ride.rideId.slice(-8)}</span>
              <Badge className="bg-purple-100 text-purple-800">Passenger</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(ride.rideStatus)}>
                {getStatusIcon(ride.rideStatus)}
                <span className="ml-1">{ride.rideStatus}</span>
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">From</label>
                <p className="text-sm">{ride.pickupLocation.placeAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">To</label>
                <p className="text-sm">{ride.dropoffLocation.placeAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Departure</label>
                <p className="text-sm">{formatDateTime(ride.tripStartDateTime)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
                <p className="text-sm">{ride.vehicleNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Booked Seats</label>
                <p className="text-sm">{ride.bookedSeats} seat(s)</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Driver</label>
                <p className="text-sm">{ride.driverDetails.name} ({ride.driverDetails.rating}⭐)</p>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button className="w-full" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Contact Driver
              </Button>
              {ride.rideStatus.toLowerCase() !== 'completed' && ride.rideStatus.toLowerCase() !== 'cancelled' && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => handleCancelRide(ride.tripId)}
                >
                  Cancel Ride
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function DriverTripsView({ 
  driverTrips, 
  selectedRide, 
  setSelectedRide, 
  handleCancelRide 
}: { 
  driverTrips: DriverUpcomingTripDTO[];
  selectedRide: SelectedRide;
  setSelectedRide: (ride: SelectedRide) => void;
  handleCancelRide: (tripId: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'offered':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {driverTrips.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Driver Trips</h3>
              <p className="text-muted-foreground mb-4">
                You haven't offered any rides yet.
              </p>
              <Button onClick={() => window.location.href = '/offer-ride'}>
                Offer a Ride
              </Button>
            </CardContent>
          </Card>
        ) : (
          driverTrips.map((ride: DriverUpcomingTripDTO) => (
            <Card 
              key={ride.tripId}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRide?.type === 'driver' && selectedRide.data.tripId === ride.tripId ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedRide({ type: 'driver', data: ride })}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Car className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Trip #{ride.tripId.slice(-8)}</h3>
                        <Badge className="bg-blue-100 text-blue-800">Driver</Badge>
                      </div>
                      <Badge className={getStatusColor(ride.tripStatus)}>
                        {getStatusIcon(ride.tripStatus)}
                        <span className="ml-1">{ride.tripStatus}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Car className="h-4 w-4" />
                      <span>{ride.vehicleNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{ride.sourceAddress.placeAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{ride.destinationAddress.placeAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{formatDateTime(ride.tripStartDateTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">{ride.bookedSeats}/{ride.offeredSeat} seats booked</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">View Details</Button>
                  {ride.tripStatus.toLowerCase() !== 'completed' && ride.tripStatus.toLowerCase() !== 'cancelled' && (
                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleCancelRide(ride.tripId); }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <RideDetailsPanel selectedRide={selectedRide} handleCancelRide={handleCancelRide} />
    </div>
  );
}

function PassengerRidesView({ 
  passengerRides, 
  selectedRide, 
  setSelectedRide, 
  handleCancelRide 
}: { 
  passengerRides: PassengerUpcomingRideDTO[];
  selectedRide: SelectedRide;
  setSelectedRide: (ride: SelectedRide) => void;
  handleCancelRide: (tripId: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'offered':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {passengerRides.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Passenger Rides</h3>
              <p className="text-muted-foreground mb-4">
                You haven't booked any rides yet.
              </p>
              <Button onClick={() => window.location.href = '/book-ride'}>
                Book a Ride
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {passengerRides.map((ride: PassengerUpcomingRideDTO) => (
              <Card 
                key={ride.rideId}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedRide?.type === 'passenger' && selectedRide.data.rideId === ride.rideId ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedRide({ type: 'passenger', data: ride })}
              >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Ride #{ride.rideId.slice(-8)}</h3>
                        <Badge className="bg-purple-100 text-purple-800">Passenger</Badge>
                      </div>
                      <Badge className={getStatusColor(ride.rideStatus)}>
                        {getStatusIcon(ride.rideStatus)}
                        <span className="ml-1">{ride.rideStatus}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Car className="h-4 w-4" />
                      <span>{ride.vehicleNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{ride.pickupLocation.placeAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{ride.dropoffLocation.placeAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{formatDateTime(ride.tripStartDateTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">{ride.bookedSeats} seat(s) booked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Driver: {ride.driverDetails.name}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">View Details</Button>
                  {ride.rideStatus.toLowerCase() !== 'completed' && ride.rideStatus.toLowerCase() !== 'cancelled' && (
                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleCancelRide(ride.tripId); }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
      <RideDetailsPanel selectedRide={selectedRide} handleCancelRide={handleCancelRide} />
    </div>
  );
}
