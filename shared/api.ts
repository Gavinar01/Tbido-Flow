// Demo endpoint response (existing)
export interface DemoResponse {
  message: string;
}

// Authentication types
export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organization?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    organization?: string;
    isAdmin: boolean;
  };
}

// Reservation types
export interface CreateReservationRequest {
  venue: string;
  purpose: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  participantCount: number;
  participantNames?: string[]; // Array of participant names
  organizerName: string;
  organizerOrganization?: string;
}

export interface ReservationResponse {
  _id: string;
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    organization?: string;
  };
  venue: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  participantNames?: string[]; // Array of participant names
  organizerName: string;
  organizerOrganization?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface GetReservationsResponse {
  reservations: ReservationResponse[];
}

export interface CreateReservationResponse {
  message: string;
  reservation: ReservationResponse;
}

// Error response
export interface ErrorResponse {
  error: string;
}

// Available venues (can be expanded later)
export const AVAILABLE_VENUES = [
  '4th Flr. NALLRC Office'
] as const;

export type VenueType = typeof AVAILABLE_VENUES[number];

// Venue availability types
export interface VenueAvailability {
  venue: string;
  status: 'available' | 'occupied';
  nextAvailable: string | null;
  currentReservation: {
    purpose: string;
    organizer: string;
    endTime: string;
  } | null;
  reservations: Array<{
    startTime: string;
    endTime: string;
    purpose: string;
    organizer: string;
  }>;
}

export interface VenueAvailabilityResponse {
  date: string;
  venues: VenueAvailability[];
  totalVenues: number;
  availableVenues: number;
}

export interface VenueScheduleResponse {
  venue: string;
  date: string;
  reservations: Array<{
    id: string;
    startTime: string;
    endTime: string;
    purpose: string;
    organizer: string;
    organization?: string;
    participantCount: number;
    user: any;
  }>;
}
