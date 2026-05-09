export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'qris' | 'cash';
export type ScheduleStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';

// ── Plain DB row types (no joined relations) ──────────────────────────────────

export interface Route {
  id: string;
  from_city: string;
  to_city: string;
  duration: string;
  base_price: number;
  schedule: string[];
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface BusClass {
  id: string;
  name: string;
  seats_count: number;
  seat_config: string; // "2-2" | "2-1" | "1-1"
  features: string[];
  price_multiplier: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  route_id: string;
  bus_class_id: string;
  departure_time: string; // "HH:MM" text stored in DB
  arrival_time: string;   // "HH:MM:SS" text stored in DB
  date: string;           // ISO date "YYYY-MM-DD"
  available_seats: number;
  total_seats: number;
  price: number;
  status: ScheduleStatus;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  schedule_id: string; // UUID FK → schedules.id
  booking_code: string;
  total_passengers: number;
  total_price: number;
  status: BookingStatus;
  payment_method: PaymentMethod | null;
  paid_at: string | null;
  created_at: string;
}

export interface BookingPassenger {
  id: string;
  booking_id: string;
  seat_number: string;
  passenger_name: string;
  passenger_phone: string;
}

export interface Testimonial {
  id: string;
  user_id: string;
  booking_id: string | null;
  rating: number; // 1–5
  content: string;
  is_approved: boolean;
  created_at: string;
}

// ── Extended types with joined relations (used in components) ─────────────────

export interface ScheduleWithRelations extends Schedule {
  route?: Route;
  bus_class?: BusClass;
}

export interface BookingWithRelations extends Booking {
  schedule?: ScheduleWithRelations | null;
  passengers?: BookingPassenger[];
}

export interface TestimonialWithProfile extends Testimonial {
  profile?: Profile | null;
}

// ── Supabase Database type definition ─────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      routes: {
        Row: Route;
        Insert: Omit<Route, 'id' | 'created_at'>;
        Update: Partial<Omit<Route, 'id' | 'created_at'>>;
        Relationships: [];
      };
      bus_classes: {
        Row: BusClass;
        Insert: Omit<BusClass, 'id' | 'created_at'>;
        Update: Partial<Omit<BusClass, 'id' | 'created_at'>>;
        Relationships: [];
      };
      schedules: {
        Row: Schedule;
        Insert: Omit<Schedule, 'id' | 'created_at'>;
        Update: Partial<Omit<Schedule, 'id' | 'created_at'>>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'booking_code'>;
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>;
        Relationships: [];
      };
      booking_passengers: {
        Row: BookingPassenger;
        Insert: Omit<BookingPassenger, 'id'>;
        Update: Partial<Omit<BookingPassenger, 'id'>>;
        Relationships: [];
      };
      testimonials: {
        Row: Testimonial;
        Insert: Omit<Testimonial, 'id' | 'created_at'>;
        Update: Partial<Omit<Testimonial, 'id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      booking_status: BookingStatus;
      payment_method: PaymentMethod;
      schedule_status: ScheduleStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
