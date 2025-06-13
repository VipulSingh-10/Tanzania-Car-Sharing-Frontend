
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

// Points/Location Type
export interface Points {
  latitude: number;
  longitude: number;
  placeId?: string;
  placeAddress?: string;
}

// User Types
export interface UserInfoDTO {
  fullName: string;
  emailId: string;
  userId?: string;
  phoneNumber: string;
  password?: string;
  age?: number;
  dob?: string;
  empId?: string;
  organisationName?: string;
  profilePicUrl?: string;
  userCars?: Vehicles[];
}

export interface LoginRequestDTO {
  emailId: string;
  password: string;
}

export interface LoginResponseDTO {
  username?: string;
  userId?: string;
  loginSuccess: boolean;
  errMsg?: string;
}

export interface SignUpResponseDTO {
  userId?: string;
  username?: string;
  signUpSuccess: boolean;
}

// Ride Types
export interface RideDTO {
  userId?: string;
  tripId?: string;
  pickupPoint: Points;
  destinationPoint: Points;
  rideStartTime: string;
  requestedSeats: number;
  tripStatus?: string;
  rideStatus?: string;
}

export interface TripBasicInfoDTO {
  userId: string;
  tripId: string;
  profilePic?: string;
  fullName: string;
  vehicleNumber: string;
  pickupPoint: Points;
  destinationPoint: Points;
  tripStartTime: string;
  availableSeats: number;
  phoneNumber: string;
  requestedSeats: number;
}

export interface RideBasicInfoDTO {
  userId: string;
  tripId: string;
  pickupPoint: Points;
  destinationPoint: Points;
  rideStartTime: string;
  seats: string;
  tripStatus: string;
  vehicleNumber: string;
}

export interface JoinRideResponseDTO {
  rideJoined: boolean;
  errMsg?: string;
}

export interface CancelRideRequestDTO {
  tripId: string;
  cancellationReason?: string;
}

export interface CancelRideResponseDTO {
  rideCancelled: boolean;
  errMsg?: string;
}

// Trip Creation Types
export interface OfferRideDTO {
  vehicleNumber: string;
  pickupPoint: Points;
  destinationPoint: Points;
  tripStartTime: string;
  offeredSeats: number;
}

export interface CreateTripResponseDTO {
  tripId?: string;
  vehicleNumber?: string;
  pickupPoint?: Points;
  destinationPoint?: Points;
  tripStartTime?: string;
  tripCreated: boolean;
  errMsg?: string;
}

// Vehicle Types
export interface Vehicles {
  userId: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleName?: string;
  vehicleColor?: string;
}

export interface VehicleResponseDTO {
  value: string; // vehicle number
  text: string; // vehicle name + color
  seatingCapacity?: string;
}

export interface VehicleRegisterRequestDTO {
  vehicleName: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleColor: string;
  seatingCapacity?: string;
}
