
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
import { User, Mail, Phone, Building, Briefcase, Save } from 'lucide-react';
import { UserInfoDTO } from '@/types/api';

export default function Profile() {
  const { user, userId, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserInfoDTO>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    department: user?.department || '',
    designation: user?.designation || '',
  });

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['userInfo', userId],
    queryFn: () => apiService.getUserInfo(userId!),
    enabled: !!userId,
  });

  // Update local state when user data changes
  React.useEffect(() => {
    if (userInfo?.responseContent) {
      setProfileData(userInfo.responseContent);
    }
  }, [userInfo]);

  const handleSave = () => {
    // Since there's no update endpoint in the API, we'll just show a message
    // In a real implementation, you would call an update user endpoint
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been saved.',
    });
    setIsEditing(false);
    
    // Update the auth context with new user info
    login(userId!, profileData);
  };

  const currentUser = userInfo?.responseContent || user;

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              'Edit Profile'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle>{currentUser?.firstName} {currentUser?.lastName}</CardTitle>
              <CardDescription>{currentUser?.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentUser?.department && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{currentUser.department}</span>
                  </div>
                )}
                {currentUser?.designation && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{currentUser.designation}</span>
                  </div>
                )}
                {currentUser?.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{currentUser.phoneNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditing ? 'Update your personal details' : 'Your account information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="department"
                      value={profileData.department || ''}
                      onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="designation"
                      value={profileData.designation || ''}
                      onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        firstName: currentUser?.firstName || '',
                        lastName: currentUser?.lastName || '',
                        email: currentUser?.email || '',
                        phoneNumber: currentUser?.phoneNumber || '',
                        department: currentUser?.department || '',
                        designation: currentUser?.designation || '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
