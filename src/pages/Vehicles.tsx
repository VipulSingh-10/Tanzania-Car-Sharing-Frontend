
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Car, Plus, Users } from 'lucide-react';
import { VehicleRegisterRequestDTO } from '@/types/api';

export default function Vehicles() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleRegisterRequestDTO>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    seatingCapacity: 4,
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => apiService.getUserVehicles(userId!),
    enabled: !!userId,
  });

  const registerMutation = useMutation({
    mutationFn: (data: VehicleRegisterRequestDTO) => apiService.registerVehicle(userId!, data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Vehicle registered successfully!',
          description: 'Your vehicle has been added to your account.',
        });
        setVehicleData({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
          licensePlate: '',
          seatingCapacity: 4,
        });
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast({
          title: 'Registration failed',
          description: response.errorMessage || 'Could not register vehicle',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to register vehicle. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleData.make || !vehicleData.model || !vehicleData.licensePlate || !vehicleData.color) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    registerMutation.mutate(vehicleData);
  };

  const vehiclesData = vehicles?.responseContent || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Vehicles</h1>
            <p className="text-muted-foreground">Manage your registered vehicles</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register New Vehicle</DialogTitle>
                <DialogDescription>
                  Add a new vehicle to your account to offer rides.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      placeholder="Toyota, Honda, etc."
                      value={vehicleData.make}
                      onChange={(e) => setVehicleData({...vehicleData, make: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      placeholder="Camry, Civic, etc."
                      value={vehicleData.model}
                      onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={vehicleData.year}
                      onChange={(e) => setVehicleData({...vehicleData, year: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color *</Label>
                    <Input
                      id="color"
                      placeholder="Red, Blue, etc."
                      value={vehicleData.color}
                      onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="licensePlate">License Plate *</Label>
                  <Input
                    id="licensePlate"
                    placeholder="ABC-1234"
                    value={vehicleData.licensePlate}
                    onChange={(e) => setVehicleData({...vehicleData, licensePlate: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seatingCapacity">Seating Capacity *</Label>
                  <Input
                    id="seatingCapacity"
                    type="number"
                    min="2"
                    max="8"
                    value={vehicleData.seatingCapacity}
                    onChange={(e) => setVehicleData({...vehicleData, seatingCapacity: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Registering...' : 'Register Vehicle'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading vehicles...</div>
        ) : vehiclesData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiclesData.map((vehicle) => (
              <Card key={vehicle.vehicleId}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span>{vehicle.make} {vehicle.model}</span>
                  </CardTitle>
                  <CardDescription>
                    {vehicle.year} • {vehicle.color}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">License Plate:</span>
                      <span className="text-sm">{vehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Capacity:</span>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span className="text-sm">{vehicle.seatingCapacity} seats</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No vehicles registered</h3>
              <p className="text-muted-foreground mb-4">
                Add your first vehicle to start offering rides to others.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
