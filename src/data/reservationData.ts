export interface TripDestination {
  id: string;
  label: string;
}

export const TRIP_DESTINATIONS: TripDestination[] = [
  { id: "dest-tubbataha-2026", label: "Tubbataha 2026" },
  { id: "dest-tubbataha-2027", label: "Tubbataha 2027" },
  { id: "dest-apo-coron-el-nido", label: "Apo, Coron, El Nido 2026-2027" }
];

export interface TripSchedule {
  id: string;
  destinationId: string;
  label: string;
  dateRange: string;
  slotsAvailable: number;
  totalSlots: number;
}

export const TRIP_SCHEDULES: TripSchedule[] = [
  // Tubbataha 2026
  { id: "trip-101", destinationId: "dest-tubbataha-2026", label: "March 18-26, 2026", dateRange: "March 18-26, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-102", destinationId: "dest-tubbataha-2026", label: "March 28-April 3, 2026", dateRange: "March 28-April 3, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-103", destinationId: "dest-tubbataha-2026", label: "April 4-10, 2026", dateRange: "April 4-10, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-104", destinationId: "dest-tubbataha-2026", label: "April 11-17, 2026", dateRange: "April 11-17, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-105", destinationId: "dest-tubbataha-2026", label: "April 18-24, 2026", dateRange: "April 18-24, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-106", destinationId: "dest-tubbataha-2026", label: "April 25 - May 1, 2026", dateRange: "April 25 - May 1, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-107", destinationId: "dest-tubbataha-2026", label: "May 2-8, 2026", dateRange: "May 2-8, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-108", destinationId: "dest-tubbataha-2026", label: "May 9-15, 2026", dateRange: "May 9-15, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-109", destinationId: "dest-tubbataha-2026", label: "May 16-22, 2026", dateRange: "May 16-22, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-110", destinationId: "dest-tubbataha-2026", label: "May 23-29, 2026", dateRange: "May 23-29, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-111", destinationId: "dest-tubbataha-2026", label: "May 30-June 5, 2026", dateRange: "May 30-June 5, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-112", destinationId: "dest-tubbataha-2026", label: "June 6-12, 2026", dateRange: "June 6-12, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-113", destinationId: "dest-tubbataha-2026", label: "June 13-19, 2026", dateRange: "June 13-19, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-114", destinationId: "dest-tubbataha-2026", label: "June 20-26, 2026", dateRange: "June 20-26, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-115", destinationId: "dest-tubbataha-2026", label: "June 27- July 3, 2026", dateRange: "June 27- July 3, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-116", destinationId: "dest-tubbataha-2026", label: "July 04-10, 2026", dateRange: "July 04-10, 2026", slotsAvailable: 24, totalSlots: 24 },

  // Tubbataha 2027
  { id: "trip-201", destinationId: "dest-tubbataha-2027", label: "March 17-25, 2027", dateRange: "March 17-25, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-202", destinationId: "dest-tubbataha-2027", label: "March 27-April 2, 2027", dateRange: "March 27-April 2, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-203", destinationId: "dest-tubbataha-2027", label: "April 3-9, 2027", dateRange: "April 3-9, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-204", destinationId: "dest-tubbataha-2027", label: "April 10-16, 2027", dateRange: "April 10-16, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-205", destinationId: "dest-tubbataha-2027", label: "April 17-23, 2027", dateRange: "April 17-23, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-206", destinationId: "dest-tubbataha-2027", label: "April 24 - 30, 2027", dateRange: "April 24 - 30, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-207", destinationId: "dest-tubbataha-2027", label: "May 1-7, 2027", dateRange: "May 1-7, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-208", destinationId: "dest-tubbataha-2027", label: "May 8-14, 2027", dateRange: "May 8-14, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-209", destinationId: "dest-tubbataha-2027", label: "May 15-21, 2027", dateRange: "May 15-21, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-210", destinationId: "dest-tubbataha-2027", label: "May 22-28, 2027", dateRange: "May 22-28, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-211", destinationId: "dest-tubbataha-2027", label: "May 29-June 4, 2027", dateRange: "May 29-June 4, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-212", destinationId: "dest-tubbataha-2027", label: "June 5-11, 2027", dateRange: "June 5-11, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-213", destinationId: "dest-tubbataha-2027", label: "June 12-18, 2027", dateRange: "June 12-18, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-214", destinationId: "dest-tubbataha-2027", label: "June 19-27, 2027", dateRange: "June 19-27, 2027", slotsAvailable: 24, totalSlots: 24 },

  // Apo, Coron, El Nido 2026-2027
  { id: "trip-301", destinationId: "dest-apo-coron-el-nido", label: "October 2-14, 2026", dateRange: "October 2-14, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-302", destinationId: "dest-apo-coron-el-nido", label: "October 16-25, 2026", dateRange: "October 16-25, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-303", destinationId: "dest-apo-coron-el-nido", label: "October 30-November 8, 2026", dateRange: "October 30-November 8, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-304", destinationId: "dest-apo-coron-el-nido", label: "November 13-22, 2026", dateRange: "November 13-22, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-305", destinationId: "dest-apo-coron-el-nido", label: "November 27-December 6, 2026", dateRange: "November 27-December 6, 2026", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-306", destinationId: "dest-apo-coron-el-nido", label: "December 11-20, 2025", dateRange: "December 11-20, 2025", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-307", destinationId: "dest-apo-coron-el-nido", label: "January 8-17, 2027", dateRange: "January 8-17, 2027", slotsAvailable: 24, totalSlots: 24 },
  { id: "trip-308", destinationId: "dest-apo-coron-el-nido", label: "January 22-31, 2027", dateRange: "January 22-31, 2027", slotsAvailable: 24, totalSlots: 24 },
];

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
