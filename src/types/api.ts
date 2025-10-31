
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

// Geometry Type for Route (GeoJSON LineString)
export interface Geometry {
  type: string; // "LineString"
  coordinates: number[][]; // [[lon, lat], [lon, lat], ...]
}

// User Types
export interface UserInfoDTO {
  fullName: string;
  emailId: string;
  userId?: string;
  phoneNumber: string;
  password?: string; // Only used during signup, not returned from backend
  age?: number;
  dob?: Date;
  empId?: string;
  organisationName?: string;
  profilePicUrl?: string;
}

export interface LoginRequestDTO {
  emailId: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  emailId: string;
}

export interface SignUpResponseDTO {
  token: string;
  emailId: string;
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
  userId?: string;
  driverId?: string; // Alternative field name from backend
  tripId: string;
  tripStatus?: string;
  profilePic?: string;
  fullName?: string;
  vehicleNumber?: string;
  pickupPoint?: Points;
  destinationPoint?: Points;
  sourceAddress?: Points; // Alternative field name from backend
  destinationAddress?: Points; // Alternative field name from backend
  sourceLocation?: { x: number; y: number }; // Backend GIS format
  destinationLocation?: { x: number; y: number }; // Backend GIS format
  tripStartTime?: string;
  tripStartDateTimeUTC?: string; // Alternative field name from backend
  tripTimezone?: string;
  availableSeats?: number;
  offeredSeat?: number; // Alternative field name from backend
  currSeats?: number;
  phoneNumber?: string;
  requestedSeats?: number;
  // OSRM Route information
  routeGeometry?: Geometry;
  routeDistance?: number;
  routeDuration?: number;
  pricePerKm?: number;
  joinedRidersId?: string[] | null;
  createdDate?: string;
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
  tripStartTime: string; // ISO-8601 format with timezone: yyyy-MM-dd'T'HH:mm:ssXXX
  offeredSeats: number;
}

export interface CreateTripResponseDTO {
  tripId?: string;
  vehicleNumber?: string;
  sourceAddress?: Points; // Updated from pickupPoint to match backend
  destinationAddress?: Points; // Updated from destinationPoint to match backend
  tripStartDateTime?: string; // Updated field name to match backend
  tripTimezone?: string; // IANA timezone ID (e.g., "Asia/Kolkata")
  
  // NEW: Route information from OSRM
  routeGeometry?: Geometry; // Full route path as GeoJSON LineString
  routeDistanceInMeters?: number; // Distance in meters (e.g., 150000.0)
  routeDistanceInKm?: number; // Distance in kilometers (e.g., 150.0)
  routeDurationInSeconds?: number; // Duration in seconds (e.g., 7200.0)
  routeDurationInMinutes?: number; // Duration in minutes (e.g., 120.0)
  
  tripCreated: boolean;
  errorMessage?: string; // Updated from errMsg to match backend
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

// Passenger Details in Driver's Trip
export interface PassengerDetails {
  userId: string;
  bookedSeats: number;
  pickupLocation: Points;
  dropoffLocation: Points;
}

// Driver's Upcoming Trip DTO (for drivers viewing their trips)
export interface DriverUpcomingTripDTO {
  tripId: string;
  driverId: string;
  vehicleNumber: string;
  tripStatus: string; // "OFFERED", "IN_PROGRESS", "COMPLETED", "CANCELLED"
  sourceAddress: Points;
  destinationAddress: Points;
  tripStartDateTime: string; // ISO-8601 with timezone
  tripTimezone: string; // IANA timezone (e.g., "Europe/Berlin", "Asia/Kolkata")
  offeredSeat: number;
  availableSeats: number;
  bookedSeats: number;
  passengers: PassengerDetails[]; // List of passengers who booked this trip
  routeDistanceInKm: number;
  routeDurationInMinutes: number;
  pricePerKm: number;
  estimatedEarnings: number;
}

// Driver Details in Passenger's Ride
export interface DriverDetails {
  name: string;
  rating: number;
  totalTrips: number;
}

// Passenger's Upcoming Ride DTO (for passengers viewing their rides)
export interface PassengerUpcomingRideDTO {
  rideId: string;
  tripId: string;
  driverId: string;
  vehicleNumber: string;
  rideStatus: string; // "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"
  pickupLocation: Points;
  dropoffLocation: Points;
  tripStartDateTime: string; // ISO-8601 with timezone
  tripTimezone: string; // IANA timezone
  bookedSeats: number;
  rideDistanceInKm: number;
  rideDurationInMinutes: number;
  pricePerKm: number;
  estimatedFare: number;
  driverDetails: DriverDetails;
}

// Trip Search Result (for search endpoints)
export interface TripSearchResultDTO {
  tripId: string;
  tripStatus: string; // "OFFERED"
  driverId: string;
  vehicleNumber: string;
  sourceAddress: Points;
  destinationAddress: Points;
  tripStartDateTimeUTC: string; // UTC time
  tripTimezone: string;
  offeredSeat: number;
  currSeats: number;
  pricePerKm: number;
  routeDistance: number; // in meters
  routeDuration: number; // in seconds
}
