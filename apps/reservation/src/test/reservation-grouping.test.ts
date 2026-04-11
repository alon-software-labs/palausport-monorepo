import { describe, expect, it } from "vitest";
import {
  getReservationGroupKey,
  resolveReservationRouteParam,
  validateChatReservationRows,
} from "../lib/reservation-grouping";

describe("resolveReservationRouteParam", () => {
  it("treats all-digit params as legacy row ids", () => {
    expect(resolveReservationRouteParam("550")).toEqual({ rowId: 550, groupId: null });
  });

  it("treats UUID-like params as reservation group ids", () => {
    expect(resolveReservationRouteParam("550e8400-e29b-41d4-a716-446655440000")).toEqual({
      rowId: null,
      groupId: "550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("treats non-numeric values as group ids", () => {
    expect(resolveReservationRouteParam("not-a-number")).toEqual({
      rowId: null,
      groupId: "not-a-number",
    });
  });
});

describe("getReservationGroupKey", () => {
  it("uses reservation_group_id when available", () => {
    expect(getReservationGroupKey({ id: 10, reservation_group_id: "group-123" })).toBe("group-123");
  });

  it("falls back to legacy id key for missing group ids", () => {
    expect(getReservationGroupKey({ id: 77, reservation_group_id: null })).toBe("legacy-77");
  });
});

describe("validateChatReservationRows", () => {
  const baseRow = {
    id: 1,
    reservation_group_id: "group-1",
    event_id: 100,
    cabin_id: "A1",
    customer_email: "client@example.com",
    status: "PENDING",
  };

  it("allows rows from same customer and event with active status", () => {
    expect(
      validateChatReservationRows(
        [
          baseRow,
          { ...baseRow, id: 2, cabin_id: "A2", status: "CANCELLED" },
        ],
        "client@example.com"
      )
    ).toEqual({ ok: true });
  });

  it("rejects rows with mismatched customer emails", () => {
    expect(
      validateChatReservationRows(
        [baseRow, { ...baseRow, id: 2, customer_email: "other@example.com" }],
        "client@example.com"
      )
    ).toEqual({ ok: false, error: "You do not have access to this reservation" });
  });

  it("rejects rows with inconsistent event ids", () => {
    expect(
      validateChatReservationRows(
        [baseRow, { ...baseRow, id: 2, event_id: 200 }],
        "client@example.com"
      )
    ).toEqual({ ok: false, error: "Reservation data is inconsistent. Contact support." });
  });

  it("rejects groups with no active rows", () => {
    expect(
      validateChatReservationRows(
        [{ ...baseRow, status: "COMPLETED" }, { ...baseRow, id: 2, status: "CANCELLED" }],
        "client@example.com"
      )
    ).toEqual({ ok: false, error: "Chat is only available for active reservations" });
  });
});
