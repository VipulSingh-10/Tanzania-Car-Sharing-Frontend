
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Clock, Car, X } from 'lucide-react';
import { RideBasicInfoDTO } from '@/types/api';

export default function MyRides() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState('');
  const [selectedRide, setSelectedRide] = useState<RideBasicInfoDTO | null>(null);

  const { data: upcomingRides, isLoading: upcomingLoading } = useQuery({
    queryKey: ['upcomingRides', userId],
    queryFn: () => apiService.getUpcomingRides(userId!),
    enabled: !!userId,
  });

  const { data: historyRides, isLoading: historyLoading } = useQuery({
    queryKey: ['historyRides', userId],
    queryFn: () => apiService.getHistoryRides(userId!),
    enabled: !!userId,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ rideId, reason }: { rideId: string; reason?: string }) => 
      apiService.cancelRide(userId!, { rideId, reason }),
    onSuccess: (response) => {
      if (response.success && response.responseContent?.rideCancelled) {
        toast({
          title: 'Ride cancelled',
          description: 'Your ride has been cancelled successfully.',
        });
        queryClient.invalidateQueries({ queryKey: ['upcomingRides'] });
        queryClient.invalidateQueries({ queryKey: ['historyRides'] });
        setSelectedRide(null);
        setCancelReason('');
      } else {
        toast({
          title: 'Cancellation failed',
          description: response.responseContent?.errMsg || 'Could not cancel the ride',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel ride. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCancelRide = () => {
    if (selectedRide) {
      cancelMutation.mutate({
        rideId: selectedRide.rideId,
        reason: cancelReason.trim() || undefined,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('confirmed') || statusLower.includes('booked')) {
      return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
    }
    if (statusLower.includes('pending')) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    if (statusLower.includes('cancelled')) {
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    }
    if (statusLower.includes('completed')) {
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const RideCard = ({ ride, showCancelButton = false }: { ride: RideBasicInfoDTO; showCancelButton?: boolean }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{ride.sourceLocation}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{ride.destinationLocation}</span>
              </div>
              {getStatusBadge(ride.status)}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(ride.departureTime).toLocaleString()}</span>
              </div>
              {ride.vehicleInfo && (
                <div className="flex items-center space-x-1">
                  <Car className="h-4 w-4" />
                  <span>{ride.vehicleInfo}</span>
                </div>
              )}
            </div>
            
            {ride.driverName && (
              <div className="text-sm">
                <span className="font-medium">Driver:</span> {ride.driverName}
              </div>
            )}
            
            {ride.seatsBooked && (
              <div className="text-sm">
                <span className="font-medium">Seats booked:</span> {ride.seatsBooked}
              </div>
            )}
          </div>
          
          {showCancelButton && ride.status.toLowerCase() !== 'cancelled' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedRide(ride)}
                  className="ml-4"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Ride</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this ride? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for cancellation (optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a reason for cancelling..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedRide(null);
                      setCancelReason('');
                    }}
                  >
                    Keep Ride
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelRide}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Ride'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const upcomingRidesData = upcomingRides?.responseContent || [];
  const historyRidesData = historyRides?.responseContent || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Rides</h1>
          <p className="text-muted-foreground">Manage your upcoming and past rides</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Upcoming ({upcomingRidesData.length})</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>History ({historyRidesData.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingLoading ? (
              <div className="text-center py-8">Loading upcoming rides...</div>
            ) : upcomingRidesData.length > 0 ? (
              <div className="space-y-4">
                {upcomingRidesData.map((ride) => (
                  <RideCard key={ride.rideId} ride={ride} showCancelButton={true} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming rides</h3>
                  <p className="text-muted-foreground">You don't have any upcoming rides scheduled.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {historyLoading ? (
              <div className="text-center py-8">Loading ride history...</div>
            ) : historyRidesData.length > 0 ? (
              <div className="space-y-4">
                {historyRidesData.map((ride) => (
                  <RideCard key={ride.rideId} ride={ride} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No ride history</h3>
                  <p className="text-muted-foreground">Your completed and cancelled rides will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
