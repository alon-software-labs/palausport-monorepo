import { useEffect, useState, useCallback, useMemo } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Ship } from "lucide-react";

interface ReservationRow {
  id: number;
  reservation_group_id: string;
  event_id: number;
  cabin_id: string;
  cabin_type: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total_guests: number;
  total_price: number;
  created_at: string;
  cruise_events: { name: string; date: string } | null;
}

/** One logical booking: multiple DB rows (cabins) share reservation_group_id */
interface GroupedReservation {
  chatReservationId: number;
  cabinLabels: string;
  status: string;
  total_guests: number;
  total_price: number;
  created_at: string;
  cruise_events: { name: string; date: string } | null;
  event_id: number;
}

interface LastMessage {
  reservation_id: number;
  content: string;
  created_at: string;
}

function statusToBadgeVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "CONFIRMED") return "default";
  if (status === "PENDING") return "secondary";
  return "outline";
}

export function MyReservations() {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<number, LastMessage>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(() => {
    if (!currentUser?.email) {
      setReservations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createSupabaseClient();
    supabase
      .from("reservations")
      .select("id, reservation_group_id, event_id, cabin_id, cabin_type, customer_name, customer_email, status, total_guests, total_price, created_at, cruise_events(name, date)")
      .eq("customer_email", currentUser.email)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message);
          return;
        }
        setReservations((data as ReservationRow[]) ?? []);
      });
  }, [currentUser?.email]);

  const fetchLastMessages = useCallback(
    (reservationIds: number[]) => {
      if (reservationIds.length === 0) return;
      const supabase = createSupabaseClient();
      supabase
        .from("chat_messages")
        .select("reservation_id, content, created_at")
        .in("reservation_id", reservationIds)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          const byRes: Record<number, LastMessage> = {};
          (data ?? []).forEach((row: LastMessage) => {
            if (!byRes[row.reservation_id]) byRes[row.reservation_id] = row;
          });
          setLastMessages(byRes);
        });
    },
    []
  );

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const groupedReservations = useMemo((): GroupedReservation[] => {
    const byGroup = new Map<string, ReservationRow[]>();
    for (const r of reservations) {
      const gid = r.reservation_group_id ?? `legacy-${r.id}`;
      const list = byGroup.get(gid) ?? [];
      list.push(r);
      byGroup.set(gid, list);
    }
    return Array.from(byGroup.values())
      .map((rows) => {
        const sorted = [...rows].sort((a, b) => a.id - b.id);
        const primary = sorted[0];
        const cabinLabels = sorted.map((x) => x.cabin_id).join(", ");
        return {
          chatReservationId: primary.id,
          cabinLabels,
          status: primary.status,
          total_guests: primary.total_guests,
          total_price: primary.total_price,
          created_at: primary.created_at,
          cruise_events: primary.cruise_events,
          event_id: primary.event_id,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reservations]);

  useEffect(() => {
    const active = groupedReservations.filter(
      (r) => r.status === "PENDING" || r.status === "CONFIRMED"
    );
    if (active.length > 0) {
      fetchLastMessages(active.map((r) => r.chatReservationId));
    } else {
      setLastMessages({});
    }
  }, [groupedReservations, fetchLastMessages]);

  useEffect(() => {
    const handler = () => fetchReservations();
    window.addEventListener("reservation-created", handler);
    return () => window.removeEventListener("reservation-created", handler);
  }, [fetchReservations]);

  if (loading) {
    return (
      <div className="section-card">
        <h2 className="section-title mb-4">My Reservations</h2>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-card">
        <h2 className="section-title mb-4">My Reservations</h2>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (groupedReservations.length === 0) {
    return (
      <div className="section-card">
        <h2 className="section-title mb-4">My Reservations</h2>
        <p className="text-muted-foreground text-sm mb-4">You have no reservations yet.</p>
        <Button asChild>
          <Link to="/reservations/new">Create your first reservation</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="section-title mb-4">My Reservations</h2>
      <div className="space-y-4">
        {groupedReservations.map((r) => (
          <Card key={`${r.chatReservationId}-${r.event_id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Ship className="w-4 h-4" />
                  {r.cruise_events?.name ?? `Event #${r.event_id}`}
                </CardTitle>
                <Badge variant={statusToBadgeVariant(r.status)}>
                  {r.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {r.cruise_events?.date ? new Date(r.cruise_events.date).toLocaleDateString() : "—"} • Cabin{r.cabinLabels.includes(",") ? "s" : ""} {r.cabinLabels} • {r.total_guests} guest{r.total_guests !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  Booked on {new Date(r.created_at).toLocaleDateString()}
                  {r.total_price > 0 && ` • ${r.total_price.toLocaleString()} total`}
                </span>
                {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/reservations/${r.chatReservationId}/chat`} className="flex items-center gap-2">
                      {lastMessages[r.chatReservationId] && (
                        <span className="size-2 rounded-full bg-primary shrink-0" aria-label="New messages" />
                      )}
                      <MessageSquare className="w-4 h-4" />
                      Chat Support
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
