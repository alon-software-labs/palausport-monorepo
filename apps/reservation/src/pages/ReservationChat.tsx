import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import HeroBanner from "@/components/HeroBanner";
import { Navbar } from "@/components/Navbar";
import { ClientRouteGuard } from "@/components/ClientRouteGuard";
import { Anchor, ArrowLeft } from "lucide-react";

interface ChatMessage {
  id: number;
  reservation_id: number;
  sender_id: string;
  sender_role: "client" | "employee";
  sender_name: string;
  content: string;
  created_at: string;
}

interface ReservationRow {
  id: number;
  event_id: number;
  cabin_id: string;
  cruise_events: { name: string; date: string } | null;
}

export default function ReservationChat() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userRole, isLoading } = useAuth();
  const [reservation, setReservation] = useState<ReservationRow | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchReservation = useCallback(async () => {
    if (!id || !currentUser?.email) return;
    const supabase = createSupabaseClient();
    const { data, error: err } = await supabase
      .from("reservations")
      .select("id, event_id, cabin_id, customer_email, status, cruise_events(name, date)")
      .eq("id", parseInt(id, 10))
      .single();

    if (err || !data) {
      setError("Reservation not found");
      setReservation(null);
      return;
    }

    const row = data as unknown as {
      id: number;
      event_id: number;
      cabin_id: string;
      customer_email: string;
      status: string;
      cruise_events: { name: string; date: string } | { name: string; date: string }[] | null;
    };
    if (row.customer_email !== currentUser.email) {
      setError("You do not have access to this reservation");
      setReservation(null);
      return;
    }

    if (row.status !== "PENDING" && row.status !== "CONFIRMED") {
      setError("Chat is only available for active reservations");
      setReservation(null);
      return;
    }

    setError(null);
    const events = row.cruise_events;
    const cruiseEvent =
      Array.isArray(events) ? events[0] ?? null : events;
    setReservation({
      id: row.id,
      event_id: row.event_id,
      cabin_id: row.cabin_id,
      cruise_events: cruiseEvent,
    });
  }, [id, currentUser?.email]);

  const fetchMessages = useCallback(async (reservationId: number) => {
    const supabase = createSupabaseClient();
    const { data, error: fetchError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      setMessages([]);
      return;
    }
    setMessages((data as ChatMessage[]) ?? []);
  }, []);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

  useEffect(() => {
    if (!reservation || !id) return;
    fetchMessages(parseInt(id, 10));

    const supabase = createSupabaseClient();
    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `reservation_id=eq.${id}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reservation?.id, id, fetchMessages]);

  const handleSend = async () => {
    if (!id || !currentUser || !inputValue.trim()) return;
    setIsSending(true);
    const content = inputValue.trim();
    const senderName = currentUser.name || currentUser.email.split("@")[0];
    setInputValue("");
    const supabase = createSupabaseClient();
    const { data: newMsg, error: err } = await supabase
      .from("chat_messages")
      .insert({
        reservation_id: parseInt(id, 10),
        sender_id: currentUser.id,
        sender_role: "client",
        sender_name: senderName,
        content,
      })
      .select()
      .single();
    setIsSending(false);
    if (err) {
      setInputValue(content);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (userRole === "employee") {
    return <ClientRouteGuard requireAuth={false}>{null}</ClientRouteGuard>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">Sign in to access chat support.</p>
        <Button asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={currentUser} />
        <HeroBanner />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" asChild>
            <Link to="/reservations">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Reservations
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading reservation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={currentUser} />
      <HeroBanner />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reservations" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to My Reservations
            </Link>
          </Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-semibold">Chat Support</h2>
            <p className="text-sm text-muted-foreground">
              {reservation.cruise_events?.name ?? `Event #${reservation.event_id}`} • Cabin{" "}
              {reservation.cabin_id}
            </p>
          </div>
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No messages yet. Start the conversation.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender_role === "client" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        m.sender_role === "client" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-xs opacity-80">{m.sender_name}</p>
                      <p className="text-sm">{m.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t flex gap-2">
            <Input
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <Button onClick={handleSend} disabled={isSending || !inputValue.trim()}>
              Send
            </Button>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 text-center">
        <div className="flex justify-center gap-2 text-sm text-muted-foreground">
          <Anchor className="w-4 h-4" />
          <span>Cruise Reservation System</span>
        </div>
      </footer>
    </div>
  );
}
