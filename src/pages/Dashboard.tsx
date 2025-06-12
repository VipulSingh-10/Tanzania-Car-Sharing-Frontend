
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Car, Search, Plus, Calendar, MapPin, Clock } from 'lucide-react';

export default function Dashboard() {
  const { userId } = useAuth();

  const { data: upcomingRides } = useQuery({
    queryKey: ['upcomingRides', userId],
    queryFn: () => apiService.getUpcomingRides(userId!),
    enabled: !!userId,
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => apiService.getUserVehicles(userId!),
    enabled: !!userId,
  });

  const upcomingRidesData = upcomingRides?.responseContent || [];
  const vehiclesData = vehicles?.responseContent || [];
  const nextRide = upcomingRidesData[0];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your carpool dashboard</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Find Rides</h3>
                  <p className="text-sm text-muted-foreground">Search for available rides</p>
                </div>
              </div>
              <Button asChild className="w-full mt-4">
                <Link to="/find-rides">Find Rides</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Create Trip</h3>
                  <p className="text-sm text-muted-foreground">Offer a ride to others</p>
                </div>
              </div>
              <Button asChild className="w-full mt-4" variant="secondary">
                <Link to="/create-trip">Create Trip</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Rides</h3>
                  <p className="text-sm text-muted-foreground">View your rides</p>
                </div>
              </div>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link to="/my-rides">View Rides</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Ride */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Next Ride</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextRide ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{nextRide.sourceLocation}</p>
                      <p className="text-sm text-muted-foreground">to {nextRide.destinationLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(nextRide.departureTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{nextRide.vehicleInfo}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Status: {nextRide.status}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming rides</p>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>Your Vehicles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehiclesData.length > 0 ? (
                <div className="space-y-3">
                  {vehiclesData.slice(0, 3).map((vehicle) => (
                    <div key={vehicle.vehicleId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{vehicle.seatingCapacity} seats</span>
                    </div>
                  ))}
                  {vehiclesData.length > 3 && (
                    <p className="text-sm text-muted-foreground">+{vehiclesData.length - 3} more vehicles</p>
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/vehicles">Manage Vehicles</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No vehicles registered</p>
                  <Button asChild size="sm">
                    <Link to="/vehicles">Add Vehicle</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{upcomingRidesData.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Rides</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{vehiclesData.length}</p>
                <p className="text-sm text-muted-foreground">Registered Vehicles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-muted-foreground">Completed Rides</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">0</p>
                <p className="text-sm text-muted-foreground">Created Trips</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
