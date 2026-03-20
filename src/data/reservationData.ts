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
