/**
 * Static mapping between reservation-ui form values and PalauSport DB schema.
 * trip-1..5 map to cruise_events.id 1..5. Cabin types map to cabin_type enum.
 */

export const TRIP_SCHEDULE_TO_EVENT_ID: Record<string, number> = {
  // Tubbataha 2026 starts at event id 101, etc.
  "trip-101": 101, "trip-102": 102, "trip-103": 103, "trip-104": 104,
  "trip-105": 105, "trip-106": 106, "trip-107": 107, "trip-108": 108,
  "trip-109": 109, "trip-110": 110, "trip-111": 111, "trip-112": 112,
  "trip-113": 113, "trip-114": 114, "trip-115": 115, "trip-116": 116,
  
  // Tubbataha 2027
  "trip-201": 201, "trip-202": 202, "trip-203": 203, "trip-204": 204,
  "trip-205": 205, "trip-206": 206, "trip-207": 207, "trip-208": 208,
  "trip-209": 209, "trip-210": 210, "trip-211": 211, "trip-212": 212,
  "trip-213": 213, "trip-214": 214,

  // Apo, Coron, El Nido 2026-2027
  "trip-301": 301, "trip-302": 302, "trip-303": 303, "trip-304": 304,
  "trip-305": 305, "trip-306": 306, "trip-307": 307, "trip-308": 308,
};

/** Map form cabin type ID (preferredCabin) to DB cabin_type enum */
export function cabinTypeIdToDb(cabinTypeId: string): "BUNK" | "QUEEN_SUITE" {
  if (cabinTypeId.startsWith("queen")) return "QUEEN_SUITE";
  return "BUNK";
}

/** Get event_id from trip schedule ID */
export function getEventId(tripScheduleId: string): number | null {
  return TRIP_SCHEDULE_TO_EVENT_ID[tripScheduleId] ?? null;
}
