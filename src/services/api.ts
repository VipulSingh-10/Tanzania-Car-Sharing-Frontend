
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
  VehicleRegisterRequestDTO,
  DriverUpcomingTripDTO,
  PassengerUpcomingRideDTO,
  TripSearchResultDTO
} from '@/types/api';
import { clearAuthData } from '@/lib/auth-utils';



// Force using the environment variable without fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('Using API URL:', API_BASE_URL);

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('carpoolToken');
  }

  private getUserId(): string | null {
    return localStorage.getItem('carpoolUserId');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false,
    includeUserId: boolean = false
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

    // Add X-User-Id header if requested
    if (includeUserId) {
      const userId = this.getUserId();
      if (userId) {
        headers['X-User-Id'] = userId;
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

  // My Rides - UPDATED for new backend endpoints
  
  // Get upcoming trips for drivers (rides they're offering)
  async getUpcomingRides(userId: string): Promise<ResponseDTO<DriverUpcomingTripDTO[]>> {
    return this.makeRequest(`/api/trips/my-trips/upcoming`, {
      method: 'GET',
    }, true, true); // requiresAuth = true, includeUserId = true
  }

  // Get upcoming rides for passengers (rides they've booked)
  async getMyUpcomingRidesAsPassenger(userId: string): Promise<ResponseDTO<PassengerUpcomingRideDTO[]>> {
    return this.makeRequest(`/api/trips/my-rides/upcoming`, {
      method: 'GET',
    }, true, true); // requiresAuth = true, includeUserId = true
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

  // Trip Creation (Offer Ride)
  async createTrip(userId: string, tripData: OfferRideDTO): Promise<ResponseDTO<CreateTripResponseDTO>> {
    // Map frontend field names to backend field names
    const requestData = {
      userId,
      requestContent: {
        vehicleNumber: tripData.vehicleNumber, // Backend now accepts camelCase
        sourceAddress: tripData.pickupPoint,
        destinationAddress: tripData.destinationPoint,
        tripStartDateTime: tripData.tripStartTime,
        offeredSeat: tripData.offeredSeats
      }
    };
    
    return this.makeRequest('/api/trips/offer', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }, true);
  }

  // Trip Search Endpoints (NEW)
  
  // Find trips starting near a specific location
  async searchTripsNearSource(latitude: number, longitude: number, radiusKm: number = 5): Promise<TripSearchResultDTO[]> {
    return this.makeRequest(
      `/api/trips/search/near-source?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
      { method: 'GET' },
      true
    );
  }

  // Find trips ending near a specific location
  async searchTripsNearDestination(latitude: number, longitude: number, radiusKm: number = 5): Promise<TripSearchResultDTO[]> {
    return this.makeRequest(
      `/api/trips/search/near-destination?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
      { method: 'GET' },
      true
    );
  }

  // Find trips matching both source and destination
  async searchTripsMatchingRoute(
    sourceLat: number,
    sourceLon: number,
    destLat: number,
    destLon: number,
    sourceRadiusKm: number = 5,
    destRadiusKm: number = 5
  ): Promise<TripSearchResultDTO[]> {
    return this.makeRequest(
      `/api/trips/search/matching-route?sourceLat=${sourceLat}&sourceLon=${sourceLon}&sourceRadiusKm=${sourceRadiusKm}&destLat=${destLat}&destLon=${destLon}&destRadiusKm=${destRadiusKm}`,
      { method: 'GET' },
      true
    );
  }

  // Find trips in a bounding box area
  async searchTripsInArea(
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon: number
  ): Promise<TripSearchResultDTO[]> {
    return this.makeRequest(
      `/api/trips/search/in-area?minLat=${minLat}&minLon=${minLon}&maxLat=${maxLat}&maxLon=${maxLon}`,
      { method: 'GET' },
      true
    );
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
