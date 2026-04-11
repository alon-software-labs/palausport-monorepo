export interface ReservationGroupRow {
  id: number;
  reservation_group_id: string | null;
}

export interface ReservationChatLookupRow {
  id: number;
  reservation_group_id: string;
  event_id: number;
  cabin_id: string;
  customer_email: string;
  status: string;
}

export function getReservationGroupKey(row: ReservationGroupRow): string {
  const groupId = row.reservation_group_id?.trim();
  return groupId && groupId.length > 0 ? groupId : `legacy-${row.id}`;
}

export function resolveReservationRouteParam(id: string): { rowId: number | null; groupId: string | null } {
  const isNumericReservationId = /^\d+$/.test(id);
  return {
    rowId: isNumericReservationId ? Number.parseInt(id, 10) : null,
    groupId: isNumericReservationId ? null : id,
  };
}

export function validateChatReservationRows(
  rows: ReservationChatLookupRow[],
  currentUserEmail: string
): { ok: true } | { ok: false; error: string } {
  if (rows.length === 0) return { ok: false, error: "Reservation not found" };

  if (rows.some((row) => row.customer_email !== currentUserEmail)) {
    return { ok: false, error: "You do not have access to this reservation" };
  }

  const eventId = rows[0].event_id;
  if (rows.some((row) => row.event_id !== eventId)) {
    return { ok: false, error: "Reservation data is inconsistent. Contact support." };
  }

  const hasActiveRow = rows.some((row) => row.status === "PENDING" || row.status === "CONFIRMED");
  if (!hasActiveRow) {
    return { ok: false, error: "Chat is only available for active reservations" };
  }

  return { ok: true };
}
