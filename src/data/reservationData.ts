// Trip schedule data with availability
export interface TripSchedule {
  id: string;
  label: string;
  dateRange: string;
  slotsAvailable: number;
  totalSlots: number;
}

export interface CabinType {
  id: string;
  label: string;
  description: string;
  capacity: string;
  totalInventory: number;
  booked: number;
  priceLabel: string;
}

export const TRIP_SCHEDULES: TripSchedule[] = [
  { id: "trip-1", label: "Voyage 1", dateRange: "March 15 – March 20, 2026", slotsAvailable: 14, totalSlots: 22 },
  { id: "trip-2", label: "Voyage 2", dateRange: "April 5 – April 10, 2026", slotsAvailable: 8, totalSlots: 22 },
  { id: "trip-3", label: "Voyage 3", dateRange: "April 26 – May 1, 2026", slotsAvailable: 20, totalSlots: 22 },
  { id: "trip-4", label: "Voyage 4", dateRange: "May 17 – May 22, 2026", slotsAvailable: 22, totalSlots: 22 },
  { id: "trip-5", label: "Voyage 5", dateRange: "June 7 – June 12, 2026", slotsAvailable: 5, totalSlots: 22 },
];

export const TRIP_TYPES = [
  { id: "regular", label: "Regular", description: "Standard full itinerary cruise" },
  { id: "transition-1", label: "Transition 1", description: "Modified itinerary with different ports" },
] as const;

export const CABIN_TYPES: CabinType[] = [
  {
    id: "twin-solo",
    label: "Twin Berth Cabin (Solo)",
    description: "Bunk-style cabin for solo use — full privacy.",
    capacity: "1 pax",
    totalInventory: 9,
    booked: 3,
    priceLabel: "Solo Rate",
  },
  {
    id: "twin-sharing",
    label: "Twin Berth Cabin (Sharing)",
    description: "Bunk-style cabin shared with another guest.",
    capacity: "2 pax",
    totalInventory: 9,
    booked: 3,
    priceLabel: "Per Person",
  },
  {
    id: "queen-solo",
    label: "Queen Suite Cabin (Solo)",
    description: "Spacious queen-size suite for solo occupancy.",
    capacity: "1 pax",
    totalInventory: 4,
    booked: 1,
    priceLabel: "Solo Rate",
  },
  {
    id: "queen-couple",
    label: "Queen Suite Cabin (Couples / Sharing)",
    description: "Ideal for couples or two guests sharing a queen suite.",
    capacity: "2 pax",
    totalInventory: 4,
    booked: 1,
    priceLabel: "Per Person",
  },
];

export const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"] as const;

export const BOOKING_METHODS = [
  { id: "direct", label: "Direct Booking" },
  { id: "agent", label: "Through Booking Agent" },
] as const;
