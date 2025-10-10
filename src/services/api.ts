
import { 
  ResponseDTO, 
  ResponseListDTO, 
  RequestDTO, 
  LoginRequestDTO, 
  LoginResponseDTO,
  UserInfoDTO,
  SignUpResponseDTO,
  RideDTO,
  TripBasicInfoDTO,
  JoinRideResponseDTO,
  RideBasicInfoDTO,
  CancelRideRequestDTO,
  CancelRideResponseDTO,
  OfferRideDTO,
  CreateTripResponseDTO,
  VehicleResponseDTO,
  VehicleRegisterRequestDTO
} from '@/types/api';
import { clearAuthData } from '@/lib/auth-utils';



// Force using the environment variable without fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('Using API URL:', API_BASE_URL);

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('carpoolToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT token for authenticated requests
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    // Handle authentication errors - only redirect for critical endpoints
    if (response.status === 401 || response.status === 403) {
      // Only clear auth and redirect for login/signup/user profile endpoints
      const isCriticalEndpoint = 
        endpoint.includes('/api/auth/') || 
        endpoint.includes('/api/users/');
      
      if (isCriticalEndpoint) {
        clearAuthData();
        window.location.href = '/login';
        throw new Error('Authentication failed. Please login again.');
      }
      // For other endpoints, just throw error without redirecting
      throw new Error(`Unauthorized: ${endpoint}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User Authentication
  async login(loginData: LoginRequestDTO): Promise<ResponseDTO<LoginResponseDTO>> {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    }, false);
  }

  async signup(userData: UserInfoDTO): Promise<ResponseDTO<SignUpResponseDTO>> {
    return this.makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  }

  async getUserInfo(userId: string): Promise<ResponseDTO<UserInfoDTO>> {
    return this.makeRequest(`/api/users/${userId}`, {}, true);
  }

  // Ride Finding
  async findRides(userId: string, rideData: RideDTO): Promise<ResponseListDTO<TripBasicInfoDTO>> {
    return this.makeRequest('/api/rides/find-ride', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: rideData }),
    }, true);
  }

  async joinTrip(userId: string, rideData: RideDTO): Promise<ResponseDTO<JoinRideResponseDTO>> {
    return this.makeRequest('/api/rides/join-trip', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: rideData }),
    }, true);
  }

  // My Rides
  async getUpcomingRides(userId: string): Promise<ResponseListDTO<RideBasicInfoDTO>> {
    return this.makeRequest('/api/myrides/upcoming', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: null }),
    }, true);
  }

  async getHistoryRides(userId: string): Promise<ResponseListDTO<RideBasicInfoDTO>> {
    return this.makeRequest('/api/myrides/history', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: null }),
    }, true);
  }

  async cancelRide(userId: string, cancelData: CancelRideRequestDTO): Promise<ResponseDTO<CancelRideResponseDTO>> {
    return this.makeRequest('/api/myrides/cancel', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: cancelData }),
    }, true);
  }

  // Trip Creation
  async createTrip(userId: string, tripData: OfferRideDTO): Promise<ResponseDTO<CreateTripResponseDTO>> {
    return this.makeRequest('/api/ride/create-trip', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: tripData }),
    }, true);
  }

  // Vehicle Management
  async getUserVehicles(userId: string): Promise<ResponseListDTO<VehicleResponseDTO>> {
    return this.makeRequest(`/api/vehicles/${userId}`, {}, true);
  }

  async registerVehicle(userId: string, vehicleData: VehicleRegisterRequestDTO): Promise<ResponseDTO<void>> {
    return this.makeRequest('/api/vehicles/register', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: vehicleData }),
    }, true);
  }
}

export const apiService = new ApiService();
