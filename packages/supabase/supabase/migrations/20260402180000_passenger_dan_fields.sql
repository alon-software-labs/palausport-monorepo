/*
 * Migration: Passenger Divers Alert Network (DAN) Fields
 *
 * The `passengers` column in the `reservations` table is a JSONB array.
 * Each passenger object now includes the following DAN-related fields:
 *
 *   {
 *     "fullName":        string,   -- required
 *     "cabinType":       string,   -- required
 *     "foodAllergies":   string | undefined,
 *     "danId":           string | undefined,  -- NEW: DAN membership ID number
 *     "buyDanInsurance": boolean              -- NEW: true if purchasing DAN insurance via Palau Sport
 *   }
 *
 * Business rules (enforced at the application layer):
 *   - Each passenger must EITHER supply a non-empty `danId`
 *     OR set `buyDanInsurance = true`.
 *   - Both fields cannot be empty / false at the same time.
 *
 * No structural column changes are required because the shape is schema-less JSONB.
 * This migration adds a descriptive comment to the column so the intent is
 * captured at the database level.
 */

COMMENT ON COLUMN public.reservations.passengers IS
  'JSONB array of passenger objects. Each object: { fullName, cabinType, foodAllergies?, danId?, buyDanInsurance }. '
  'Either danId (DAN membership number) or buyDanInsurance=true is required per passenger.';
