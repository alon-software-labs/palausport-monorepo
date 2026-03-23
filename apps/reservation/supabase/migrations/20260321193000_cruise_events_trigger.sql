CREATE OR REPLACE FUNCTION update_cruise_event_bookings()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE cruise_events
    SET current_bookings = COALESCE((
      SELECT COALESCE(SUM(grp_guests), 0)
      FROM (
        SELECT DISTINCT reservation_group_id, total_guests as grp_guests
        FROM reservations
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
          AND status = 'CONFIRMED'
      ) AS unique_groups
    ), 0)
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cruise_event_bookings ON reservations;

CREATE TRIGGER trigger_update_cruise_event_bookings
AFTER INSERT OR UPDATE OR DELETE ON reservations
FOR EACH ROW
EXECUTE PROCEDURE update_cruise_event_bookings();
