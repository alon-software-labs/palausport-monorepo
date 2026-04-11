import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { createSupabaseJsClient } from "@repo/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import HeroBanner from "@/components/HeroBanner";
import { Navbar } from "@/components/Navbar";
import { ClientRouteGuard } from "@/components/ClientRouteGuard";
import { Anchor, ArrowLeft, Paperclip, X, ImageIcon, Loader2 } from "lucide-react";
import {
  resolveReservationRouteParam,
  validateChatReservationRows,
  type ReservationChatLookupRow,
} from "@/lib/reservation-grouping";
import { toast } from "sonner";

interface ChatMessage {
  id: number;
  reservation_id: number;
  reservation_group_id: string;
  sender_id: string;
  sender_role: "client" | "employee";
  sender_name: string;
  content: string;
  created_at: string;
  image_urls?: string[];
}

interface ReservationRow {
  id: number;
  reservation_group_id: string;
  event_id: number;
  cabin_ids: string[];
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
  
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingFiles]);

  useEffect(() => {
    const urls = pendingFiles.map((file) => URL.createObjectURL(file));
    setPendingPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingFiles]);

  const fetchReservation = useCallback(async () => {
    if (!id || !currentUser?.email) return;
    const supabase = createSupabaseJsClient();
    // `/reservations/:id/chat` accepts either a legacy numeric row id or a reservation_group_id UUID.
    const routeParam = resolveReservationRouteParam(id);
    const query = supabase
      .from("reservations")
      .select("id, reservation_group_id, event_id, cabin_id, customer_email, status, cruise_events(name, date)");

    const { data, error: err } = routeParam.groupId
      ? await query.eq("reservation_group_id", routeParam.groupId).order("id", { ascending: true })
      : await query.eq("id", routeParam.rowId as number).limit(1);

    if (err || !data || data.length === 0) {
      setError("Reservation not found");
      setReservation(null);
      return;
    }

    const rows = data as unknown as Array<ReservationChatLookupRow & {
      id: number;
      cruise_events: { name: string; date: string } | { name: string; date: string }[] | null;
    }>;
    const rowSet = routeParam.groupId
      ? rows
      : await supabase
          .from("reservations")
          .select("id, reservation_group_id, event_id, cabin_id, customer_email, status, cruise_events(name, date)")
          .eq("reservation_group_id", rows[0].reservation_group_id)
          .order("id", { ascending: true })
          .then((result) => (result.data as typeof rows) ?? []);

    const validation = validateChatReservationRows(rowSet, currentUser.email);
    if (validation.ok === false) {
      setError(validation.error);
      setReservation(null);
      return;
    }

    const primary = rowSet[0];
    setError(null);
    const events = primary.cruise_events;
    const cruiseEvent =
      Array.isArray(events) ? events[0] ?? null : events;
    setReservation({
      id: primary.id,
      reservation_group_id: primary.reservation_group_id,
      event_id: primary.event_id,
      cabin_ids: rowSet.map((row) => row.cabin_id),
      cruise_events: cruiseEvent,
    });
  }, [id, currentUser?.email]);

  const fetchMessages = useCallback(async (reservationGroupId: string) => {
    const supabase = createSupabaseJsClient();
    const { data, error: fetchError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("reservation_group_id", reservationGroupId)
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
    const groupId = reservation.reservation_group_id;
    fetchMessages(groupId);

    const supabase = createSupabaseJsClient();
    let isCleanedUp = false;
    let channel: RealtimeChannel | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const clearReconnectTimer = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const detachChannel = () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };

    const scheduleReconnect = () => {
      if (isCleanedUp || reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (!isCleanedUp) {
          attachChannel();
        }
      }, 1000);
    };

    const attachChannel = () => {
      detachChannel();
      channel = supabase
        .channel(`chat-${groupId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
          },
          (payload) => {
            const msg = payload.new as ChatMessage;
            if (msg.reservation_group_id !== groupId) return;
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          }
        )
        .subscribe((status) => {
          if (isCleanedUp) return;
          if (status === "SUBSCRIBED") {
            // Re-sync in case messages arrived while channel was reconnecting.
            void fetchMessages(groupId);
            return;
          }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            void fetchMessages(groupId);
            scheduleReconnect();
          }
        });
    };

    attachChannel();

    return () => {
      isCleanedUp = true;
      clearReconnectTimer();
      detachChannel();
    };
  }, [reservation, id, fetchMessages]);

  const handleSend = async () => {
    if (!reservation || !id || !currentUser || (!inputValue.trim() && pendingFiles.length === 0)) return;
    setIsSending(true);
    const content = inputValue.trim();
    const senderName = currentUser.name || currentUser.email.split("@")[0];
    
    const supabase = createSupabaseJsClient();
    const uploadedUrls: string[] = [];

    if (pendingFiles.length > 0) {
      for (const file of pendingFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${reservation.reservation_group_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`, {
            description: uploadError.message,
          });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('chat-images')
          .getPublicUrl(filePath);

        if (publicUrlData.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }
    }

    if (pendingFiles.length > 0 && uploadedUrls.length === 0) {
      setIsSending(false);
      toast.error("Could not upload images. Please try again.");
      return;
    }

    const { data: newMsg, error: err } = await supabase
      .from("chat_messages")
      .insert({
        reservation_id: reservation.id,
        reservation_group_id: reservation.reservation_group_id,
        sender_id: currentUser.id,
        sender_role: "client",
        sender_name: senderName,
        content,
        image_urls: uploadedUrls,
      })
      .select()
      .single();
      
    setIsSending(false);
    if (err) {
      toast.error("Could not send message", { description: err.message });
      return;
    }
    if (newMsg) {
      setInputValue("");
      setPendingFiles([]);
      setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg as ChatMessage]);
    }
  };

  const addFiles = (files: File[]) => {
    setPendingFiles((prev) => {
      const newFiles = [...prev, ...files];
      if (newFiles.length > 5) return newFiles.slice(0, 5);
      return newFiles.filter(file => file.size <= 10 * 1024 * 1024);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')));
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
        <div 
          className="border rounded-lg overflow-hidden relative"
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-[2px] flex items-center justify-center border-4 border-dashed border-primary">
              <div className="bg-background px-6 py-4 rounded-xl font-semibold text-lg text-primary shadow-lg pointer-events-none flex items-center gap-2">
                <ImageIcon className="size-6" /> Drop images here to attach
              </div>
            </div>
          )}
          
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-semibold">Chat Support</h2>
            <p className="text-sm text-muted-foreground">
              {reservation.cruise_events?.name ?? `Event #${reservation.event_id}`} • Cabin{" "}
              {reservation.cabin_ids.join(", ")}
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
                      className={`max-w-[80%] rounded-xl ${
                        m.image_urls && m.image_urls.length > 0 ? 'p-1.5' : 'px-3 py-2.5'
                      } ${
                        m.sender_role === "client" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {/* Name Header */}
                      <p className={`text-[11px] uppercase tracking-wide opacity-70 font-semibold mb-1.5 ${m.image_urls && m.image_urls.length > 0 ? 'px-2 pt-1' : ''}`}>
                        {m.sender_name}
                      </p>
                      
                      {/* Images */}
                      {m.image_urls && m.image_urls.length > 0 && (
                        <div className={`grid gap-1.5 ${m.content ? 'mb-2' : ''} ${m.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {m.image_urls.map((url, i) => (
                            <button 
                              key={i} 
                              type="button"
                              onClick={() => setLightboxUrl(url)}
                              className="relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity border border-black/5"
                            >
                              <img
                                src={url}
                                alt="Attached"
                                className="object-cover w-full h-full aspect-square"
                                loading="lazy"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Content & Timestamp */}
                      {(m.content || (!m.content && m.created_at)) && (
                        <div className={`flex flex-col ${m.image_urls && m.image_urls.length > 0 ? 'px-1.5 pb-0.5' : ''}`}>
                          {m.content && <p className="text-[14px] leading-snug break-words mb-1">{m.content}</p>}
                          <p className="text-[10px] opacity-60 self-end mt-0.5">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="flex flex-col border-t bg-background relative transition-all">
            {pendingPreviews.length > 0 && (
              <div className="flex p-3 gap-2 overflow-x-auto border-b bg-muted/20 items-center">
                <span className="text-xs font-semibold uppercase text-muted-foreground ml-1 mr-2 px-1 shrink-0 whitespace-nowrap">
                  <ImageIcon className="inline-block size-3 mr-1" />
                  {pendingPreviews.length} / 5
                </span>
                {pendingPreviews.map((url, i) => (
                  <div key={url} className="relative shrink-0 size-14 border rounded-md overflow-hidden group">
                    <img src={url} alt="Preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 flex gap-2 shrink-0">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                type="button" 
                className="shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={pendingFiles.length >= 5}
              >
                <Paperclip className="size-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={inputValue}
                className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-2"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              />
              <Button onClick={handleSend} disabled={isSending || (!inputValue.trim() && pendingFiles.length === 0)} className="shrink-0 px-6 rounded-full font-medium shadow-sm transition-all">
                {isSending ? <Loader2 className="size-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 text-center">
        <div className="flex justify-center gap-2 text-sm text-muted-foreground">
          <Anchor className="w-4 h-4" />
          <span>Cruise Reservation System</span>
        </div>
      </footer>

      {/* Lightbox for images */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          <button 
            type="button"
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="size-8" />
          </button>
          <img 
            src={lightboxUrl} 
            alt="Expanded view" 
            className="max-w-full max-h-full object-contain rounded-md"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
