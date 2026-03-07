import { useEffect, useState, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ship } from "lucide-react";

interface ReservationRow {
  id: number;
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

function statusToBadgeVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "CONFIRMED") return "default";
  if (status === "PENDING") return "secondary";
  return "outline";
}

export function MyReservations() {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
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
      .select("id, event_id, cabin_id, cabin_type, customer_name, customer_email, status, total_guests, total_price, created_at, cruise_events(name, date)")
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

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

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

  if (reservations.length === 0) {
    return (
      <div className="section-card">
        <h2 className="section-title mb-4">My Reservations</h2>
        <p className="text-muted-foreground text-sm">You have no reservations yet. Create one using the form below.</p>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="section-title mb-4">My Reservations</h2>
      <div className="space-y-4">
        {reservations.map((r) => (
          <Card key={r.id}>
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
                {r.cruise_events?.date ? new Date(r.cruise_events.date).toLocaleDateString() : "—"} • Cabin {r.cabin_id} • {r.total_guests} guest{r.total_guests !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              Booked on {new Date(r.created_at).toLocaleDateString()}
              {r.total_price > 0 && ` • ${r.total_price.toLocaleString()} total`}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
