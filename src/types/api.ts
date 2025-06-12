
// API Response Types
export interface ResponseDTO<T> {
  success: boolean;
  errorMessage: string | null;
  responseContent: T | null;
}

export interface ResponseListDTO<T> {
  success: boolean;
  errorMessage: string | null;
  responseContent: T[] | null;
}

export interface RequestDTO<T> {
  userId: string;
  requestContent: T;
}

// User Types
export interface UserInfoDTO {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department?: string;
  designation?: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  loginSuccess: boolean;
  userId?: string;
  userInfo?: UserInfoDTO;
  errMsg?: string;
}

export interface SignUpResponseDTO {
  signUpSuccess: boolean;
  userId?: string;
  errMsg?: string;
}

// Ride Types
export interface RideDTO {
  tripId?: string;
  sourceLocation: string;
  destinationLocation: string;
  departureTime: string;
  seatsRequired?: number;
  vehicleId?: string;
  notes?: string;
}

export interface TripBasicInfoDTO {
  tripId: string;
  driverName: string;
  sourceLocation: string;
  destinationLocation: string;
  departureTime: string;
  availableSeats: number;
  vehicleInfo: string;
  estimatedFare?: number;
  distance?: string;
  duration?: string;
}

export interface RideBasicInfoDTO {
  rideId: string;
  tripId: string;
  sourceLocation: string;
  destinationLocation: string;
  departureTime: string;
  status: string;
  driverName?: string;
  vehicleInfo?: string;
  seatsBooked?: number;
}

export interface JoinRideResponseDTO {
  rideJoined: boolean;
  rideId?: string;
  errMsg?: string;
}

export interface CancelRideRequestDTO {
  rideId: string;
  reason?: string;
}

export interface CancelRideResponseDTO {
  rideCancelled: boolean;
  errMsg?: string;
}

// Trip Creation Types
export interface OfferRideDTO {
  sourceLocation: string;
  destinationLocation: string;
  departureTime: string;
  availableSeats: number;
  vehicleId: string;
  estimatedFare?: number;
  notes?: string;
}

export interface CreateTripResponseDTO {
  tripCreated: boolean;
  tripId?: string;
  errMsg?: string;
}

// Vehicle Types
export interface VehicleResponseDTO {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  seatingCapacity: number;
}

export interface VehicleRegisterRequestDTO {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  seatingCapacity: number;
}
