/**
 * Static mapping between reservation-ui form values and PalauSport DB schema.
 * trip-1..5 map to cruise_events.id 1..5. Cabin types map to cabin_type enum.
 */

export const TRIP_SCHEDULE_TO_EVENT_ID: Record<string, number> = {
  "trip-1": 1,
  "trip-2": 2,
  "trip-3": 3,
  "trip-4": 4,
  "trip-5": 5,
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
