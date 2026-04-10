'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '@/lib/context';
import { createNextBrowserSupabaseClient } from '@repo/supabase';
import { Reservation, ReservationStatus } from '@/lib/types';
import { ReservationModal } from '@/components/reservation-modal';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Loader2, Paperclip, X, ImageIcon, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatMessage {
  id: number;
  reservation_id: number;
  reservation_group_id: string;
  sender_id: string;
  sender_role: 'client' | 'employee';
  sender_name: string;
  content: string;
  created_at: string;
  image_urls?: string[];
}

interface LastMessage {
  reservation_group_id: string;
  content: string;
  image_urls?: string[];
  created_at: string;
}

interface ThreadRead {
  reservation_group_id: string;
  read_at: string;
}

interface ReservationThread {
  groupId: string;
  primary: Reservation;
  cabinSummary: string;
}

const FILTER_STATUSES: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED'];

export default function ChatPage() {
  const { reservations, currentUser, userRole, getEvent, updateReservation } = useAppContext();
  const [activeFilters, setActiveFilters] = useState<ReservationStatus[]>(['PENDING', 'CONFIRMED']);
  const [selectedThread, setSelectedThread] = useState<ReservationThread | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const update = () => setIsSmallScreen(mql.matches);
    mql.addEventListener('change', update);
    update();
    return () => mql.removeEventListener('change', update);
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [lastMessages, setLastMessages] = useState<Record<string, LastMessage>>({});
  const [threadReads, setThreadReads] = useState<Record<string, string>>({});
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedThread]);

  useEffect(() => {
    const urls = pendingFiles.map((file) => URL.createObjectURL(file));
    setPendingPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingFiles]);

  const groupedThreads = useMemo((): ReservationThread[] => {
    const byGroup = new Map<string, Reservation[]>();
    for (const row of reservations) {
      const groupId = row.reservationGroupId || `legacy-${row.id}`;
      const list = byGroup.get(groupId) ?? [];
      list.push(row);
      byGroup.set(groupId, list);
    }

    return Array.from(byGroup.entries()).map(([groupId, rows]) => {
      const sortedRows = [...rows].sort((a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10));
      const primary = sortedRows[0];
      return {
        groupId,
        primary,
        cabinSummary: sortedRows.map((r) => r.cabinId).join(', '),
      };
    });
  }, [reservations]);

  const filteredThreads = useMemo(
    () => groupedThreads.filter((thread) => activeFilters.includes(thread.primary.status)),
    [groupedThreads, activeFilters]
  );

  const toggleFilter = (status: ReservationStatus) => {
    setActiveFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const sortedReservations = useMemo(() => {
    return [...filteredThreads].sort((a, b) => {
      const lastA = lastMessages[a.groupId]?.created_at ?? a.primary.createdAt;
      const lastB = lastMessages[b.groupId]?.created_at ?? b.primary.createdAt;
      return new Date(lastB).getTime() - new Date(lastA).getTime();
    });
  }, [filteredThreads, lastMessages]);

  useEffect(() => {
    // On small screens we start on the list view, so don't auto-select
    if (!selectedThread && sortedReservations.length > 0 && !isSmallScreen) {
      setTimeout(() => setSelectedThread(sortedReservations[0]), 0);
    }
  }, [sortedReservations, selectedThread, isSmallScreen]);

  useEffect(() => {
    if (filteredThreads.length === 0 || !currentUser?.id) return;
    let discarded = false;
    const supabase = createNextBrowserSupabaseClient();
    const groupIds = filteredThreads.map((thread) => thread.groupId);

    Promise.all([
      supabase
        .from('chat_messages')
        .select('reservation_group_id, content, image_urls, created_at')
        .in('reservation_group_id', groupIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('chat_thread_reads')
        .select('reservation_group_id, read_at')
        .eq('user_id', currentUser.id)
        .in('reservation_group_id', groupIds),
    ]).then(([msgRes, readRes]) => {
      if (discarded) return;
      const lastByRes: Record<string, LastMessage> = {};
      (msgRes.data ?? []).forEach((row: LastMessage) => {
        const key = row.reservation_group_id;
        if (!lastByRes[key]) lastByRes[key] = row;
      });
      setLastMessages(lastByRes);
      const readsByRes: Record<string, string> = {};
      (readRes.data ?? []).forEach((row: ThreadRead) => {
        readsByRes[row.reservation_group_id] = row.read_at;
      });
      setThreadReads(readsByRes);
    });

    return () => {
      discarded = true;
    };
  }, [filteredThreads, currentUser]);

  useEffect(() => {
    if (!selectedThread) return;
    const reservationId = selectedThread.primary.id;
    const groupId = selectedThread.groupId;
    let discarded = false;
    const supabase = createNextBrowserSupabaseClient();

    supabase
      .from('chat_messages')
      .select('*')
      .eq('reservation_group_id', groupId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (discarded) return;
        if (error) {
          console.error('Failed to fetch messages:', error);
          setMessages([]);
          return;
        }
        setMessages((data as ChatMessage[]) ?? []);
      });

    if (currentUser?.id) {
      supabase
        .from('chat_thread_reads')
        .upsert(
          {
            user_id: currentUser.id,
            reservation_id: parseInt(reservationId, 10),
            reservation_group_id: groupId,
            read_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,reservation_group_id' }
        )
        .then(() => {
          if (!discarded) {
            setThreadReads((prev) => ({ ...prev, [groupId]: new Date().toISOString() }));
          }
        });
    }

    const channel = supabase
      .channel(`chat-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `reservation_group_id=eq.${groupId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
          setLastMessages((prev) => ({
            ...prev,
            [groupId]: {
              reservation_group_id: groupId,
              content: newMsg.content,
              image_urls: newMsg.image_urls,
              created_at: newMsg.created_at,
            },
          }));
        }
      )
      .subscribe();

    return () => {
      discarded = true;
      supabase.removeChannel(channel);
    };
  }, [selectedThread, currentUser]);

  const handleSend = async () => {
    if (!selectedThread || !currentUser?.id || (!inputValue.trim() && pendingFiles.length === 0)) return;
    setIsSending(true);
    const supabase = createNextBrowserSupabaseClient();
    const primaryReservationId = parseInt(selectedThread.primary.id, 10);
    
    const uploadedUrls: string[] = [];

    // Upload files if any
    if (pendingFiles.length > 0) {
      for (const file of pendingFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${selectedThread.groupId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
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
    
    const { data: insertedMsg, error } = await supabase.from('chat_messages').insert({
      reservation_id: primaryReservationId,
      reservation_group_id: selectedThread.groupId,
      sender_id: currentUser.id,
      sender_role: userRole || 'client',
      sender_name: currentUser.name || currentUser.email.split('@')[0],
      content: inputValue.trim(),
      image_urls: uploadedUrls,
    }).select().single();
    
    setIsSending(false);
    if (!error && insertedMsg) {
      setInputValue('');
      setPendingFiles([]);
      setMessages((prev) => prev.some((m) => m.id === insertedMsg.id) ? prev : [...prev, insertedMsg as ChatMessage]);
      setLastMessages((prev) => ({
        ...prev,
        [selectedThread.groupId]: {
          reservation_group_id: selectedThread.groupId,
          content: insertedMsg.content,
          image_urls: insertedMsg.image_urls,
          created_at: insertedMsg.created_at,
        },
      }));
    } else if (error) {
      toast.error('Failed to send message');
    }
  };

  const addFiles = (files: File[]) => {
    setPendingFiles((prev) => {
      const newFiles = [...prev, ...files];
      if (newFiles.length > 5) {
        toast.error('Maximum 5 images allowed per message.');
        return newFiles.slice(0, 5);
      }
      const validFiles = newFiles.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit.`);
          return false;
        }
        return true;
      });
      return validFiles;
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

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Do not set false immediately if dragging over children. We leave it true until drop or leaving entire window.
    // For simplicity, we can let it be, but setting to false causes flicker.
    // Actually, setting false on dragLeave the pane is what we want, but since it bubbles we check relatedTarget
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')));
    }
  };

  const handleStatusUpdate = async (newStatus: ReservationStatus) => {
    if (!selectedThread) return;

    setIsUpdatingStatus(true);
    const { success, error } = await updateReservation({
      ...selectedThread.primary,
      status: newStatus,
    });

    setIsUpdatingStatus(false);

    if (success) {
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      setSelectedThread((prev) => (prev ? { ...prev, primary: { ...prev.primary, status: newStatus } } : null));
    } else {
      toast.error(error || 'Failed to update status');
    }
  };

  const isMobile = useIsMobile();
  const isTablet = isMobile; // Unified 1024px breakpoint

  const chatList = (
    <div className="flex flex-col h-full min-h-0 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {FILTER_STATUSES.map((status) => (
          <Button
            key={status}
            variant={activeFilters.includes(status) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter(status)}
            className="rounded-full h-7 text-[0.65rem] font-medium px-2.5 uppercase tracking-wider whitespace-nowrap min-w-max"
          >
            {status.replace('_', ' ')}
          </Button>
        ))}
      </div>
      <ScrollArea className="flex-1 min-h-0 pr-2">
        <div className="space-y-1">
          {sortedReservations.map((r) => {
            const event = getEvent(r.primary.eventId);
            const isSelected = selectedThread?.groupId === r.groupId;
            const lastMsg = lastMessages[r.groupId];
            const readAt = threadReads[r.groupId];
            const isUnread =
              lastMsg &&
              (!readAt || new Date(lastMsg.created_at) > new Date(readAt));
            return (
              <button
                key={r.groupId}
                type="button"
                onClick={() => { setSelectedThread(r); if (isSmallScreen) setMobileView('chat'); }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isUnread
                    ? 'hover:bg-muted'
                    : 'opacity-70 hover:opacity-90 hover:bg-muted/50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 size-2 rounded-full ${isUnread
                      ? isSelected
                        ? 'bg-primary-foreground'
                        : 'bg-primary'
                      : 'invisible'
                      }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <p className="font-medium text-sm min-w-0 leading-snug">
                        {r.primary.customerName}
                        <span className="max-[900px]:hidden"> • {event?.name}</span>
                        <span className="opacity-60 text-xs"> · Cabins {r.cabinSummary}</span>
                      </p>
                      <span
                        className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 whitespace-nowrap ${r.primary.status === 'PENDING'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : r.primary.status === 'CONFIRMED'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : r.primary.status === 'COMPLETED'
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}
                      >
                        {r.primary.status.replace('_', ' ')}
                      </span>
                    </div>
                    {lastMsg ? (
                      <div
                        className={`flex items-center justify-between gap-2 mt-1 text-xs ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}
                      >
                        <span className="truncate min-w-0">
                          {lastMsg.content || (lastMsg.image_urls?.length ? `📷 ${lastMsg.image_urls.length} image${lastMsg.image_urls.length > 1 ? 's' : ''}` : 'No messages yet')}
                        </span>
                        <span className="shrink-0 whitespace-nowrap opacity-60">
                          {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <p className={`text-xs mt-1 ${isSelected ? 'opacity-70' : 'text-muted-foreground'}`}>
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  const chatPane = (
    <div 
      className="flex flex-col h-full min-h-0 overflow-hidden bg-muted/5 relative w-full"
      onDragOver={selectedThread ? onDragOver : undefined}
      onDragEnter={selectedThread ? onDragEnter : undefined}
      onDragLeave={selectedThread ? onDragLeave : undefined}
      onDrop={selectedThread ? onDrop : undefined}
    >
      {isDragging && selectedThread && (
         <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-[2px] flex items-center justify-center border-4 border-dashed border-primary">
           <div className="bg-background px-6 py-4 rounded-xl font-semibold text-lg text-primary shadow-lg pointer-events-none flex items-center gap-2">
             <ImageIcon className="size-6" /> Drop images here to attach
           </div>
         </div>
      )}
      
      {selectedThread ? (
        <>
          {/* Chat header — stacks cleanly on iPhone SE (375px) */}
          <div className="p-2.5 sm:p-4 border-b shrink-0 bg-background/50 backdrop-blur-sm">
            {/* Row 1: back + name/ref + view-details */}
            <div className="flex items-start gap-1.5">
              {isSmallScreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 mt-0.5 -ml-0.5"
                  onClick={() => setMobileView('list')}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="font-semibold text-sm sm:text-base leading-tight truncate max-w-[180px] sm:max-w-none">
                        {selectedThread.primary.customerName}
                        <span className="hidden xs:inline"> • {getEvent(selectedThread.primary.eventId)?.destination}</span>
                      </h2>
                      <span className="shrink-0 px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-mono font-bold tracking-wider">
                        #{selectedThread.groupId.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
                      {getEvent(selectedThread.primary.eventId)?.name} • Cabins {selectedThread.cabinSummary}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 sm:h-7 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider shrink-0 cursor-pointer px-2"
                    onClick={() => setIsDetailsModalOpen(true)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </div>
            {/* Row 2: status controls (employee only) */}
            {userRole === 'employee' && (
              <div className="flex items-center gap-2 mt-2 pl-0 sm:pl-0">
                <Select
                  value={selectedThread.primary.status}
                  onValueChange={(value) => handleStatusUpdate(value as ReservationStatus)}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="h-8 text-xs flex-1 sm:flex-none sm:w-[160px]">
                    {isUpdatingStatus ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <SelectValue placeholder="Change Status" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <ScrollArea className="flex-1 min-h-0 p-3 sm:p-4 pt-4 sm:pt-6">
            <div className="space-y-3 sm:space-y-4 pb-2">
              <div className="flex justify-center mb-3 sm:mb-6">
                <div className="bg-muted/30 border rounded-xl p-3 sm:p-4 w-full shadow-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3 text-center opacity-70">Booking</p>
                  <div className="grid grid-cols-[auto_1fr] gap-y-1.5 gap-x-3 text-[12px]">
                    <div className="text-muted-foreground">Ref</div>
                    <div className="font-mono font-medium">{selectedThread.groupId.slice(0, 8).toUpperCase()}</div>
                    <div className="text-muted-foreground">To</div>
                    <div className="font-medium truncate">{getEvent(selectedThread.primary.eventId)?.destination || 'Palau Route'}</div>
                    <div className="text-muted-foreground">Departs</div>
                    <div className="font-medium">{getEvent(selectedThread.primary.eventId) ? new Date(getEvent(selectedThread.primary.eventId)!.date).toLocaleDateString() : 'TBD'}</div>
                    <div className="text-muted-foreground">Cabin</div>
                    <div className="font-medium truncate">{selectedThread.cabinSummary}</div>
                    <div className="text-muted-foreground">Guests</div>
                    <div className="font-medium">{selectedThread.primary.totalGuests} Pax / {selectedThread.primary.passengers?.length || 0} Listed</div>
                  </div>
                </div>
              </div>

              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  You have no messages yet. Chat securely with support here.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_role === 'employee' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl flex flex-col ${
                        m.image_urls && m.image_urls.length > 0 ? 'p-1.5' : 'px-4 py-2.5'
                      } ${m.sender_role === 'employee'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/80 backdrop-blur-sm'
                        }`}
                    >
                      {m.image_urls && m.image_urls.length > 0 && (
                        <div className={`grid gap-1.5 ${m.content ? 'mb-2' : ''} ${m.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {m.image_urls.map((url, i) => (
                            <button 
                              key={i} 
                              type="button"
                              onClick={() => setLightboxUrl(url)}
                              className="relative overflow-hidden rounded-[10px] border border-black/5 hover:opacity-90 transition-opacity"
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
                      
                      <div className={`flex flex-row items-baseline justify-between gap-2 ${m.image_urls && m.image_urls.length > 0 ? 'px-2 pb-1 pt-1' : ''}`}>
                        {m.content && <p className="text-sm flex-1 min-w-0 wrap-break-word">{m.content}</p>}
                        <span className="text-[10px] opacity-70 shrink-0 whitespace-nowrap self-end">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>
          <div className="flex flex-col border-t bg-background relative transition-all shrink-0">
            {pendingPreviews.length > 0 && (
              <div className="flex p-2 gap-2 overflow-x-auto border-b bg-muted/20 items-center">
                <span className="text-xs font-semibold uppercase text-muted-foreground ml-1 mr-1 px-1 shrink-0 whitespace-nowrap">
                  <ImageIcon className="inline-block size-3 mr-1" />
                  {pendingPreviews.length}/5
                </span>
                {pendingPreviews.map((url, i) => (
                  <div key={url} className="relative shrink-0 size-12 border rounded-md overflow-hidden">
                    <img src={url} alt="Preview" className="object-cover w-full h-full" />
                    {/* Always visible on touch; hover on desktop */}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="px-2 py-2 sm:p-3 flex items-center gap-1.5 sm:gap-2">
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
                className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={pendingFiles.length >= 5}
              >
                <Paperclip className="size-4" />
              </Button>
              <Input
                placeholder="Message..."
                value={inputValue}
                className="flex-1 min-w-0 h-9 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-1 text-sm"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <Button
                onClick={handleSend}
                disabled={isSending || (!inputValue.trim() && pendingFiles.length === 0)}
                size="icon"
                className="shrink-0 h-9 w-9 rounded-full shadow-sm transition-all sm:hidden"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" /> : <ArrowLeft className="size-4 rotate-180" />}
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || (!inputValue.trim() && pendingFiles.length === 0)}
                className="shrink-0 h-9 px-4 rounded-full font-medium shadow-sm transition-all hidden sm:flex"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" /> : 'Send'}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <MessageSquare className="size-16 mb-4 opacity-50" />
          <p>Select a reservation to view and reply to messages</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100svh-7rem)] sm:h-[calc(100svh-8rem)] w-full max-w-full min-h-0 overflow-hidden animate-in fade-in duration-300 gap-2 sm:gap-4">
      {/* Header: hide on small screens when showing chat to save vertical space */}
      {!(isSmallScreen && mobileView === 'chat') && (
        <div className="shrink-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Chat Support</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Message customers about their reservations
          </p>
        </div>
      )}

      {isSmallScreen ? (
        /* ── Mobile: single-panel stacked navigation ── */
        <div className="flex flex-1 min-h-0 rounded-lg border overflow-hidden shadow-sm bg-background">
          {mobileView === 'list' ? (
            <div className="w-full">{chatList}</div>
          ) : (
            <div className="w-full">{chatPane}</div>
          )}
        </div>
      ) : isTablet ? (
        /* ── Tablet: fixed split layout ── */
        <div className="flex flex-1 min-h-0 rounded-lg border mt-4 overflow-hidden shadow-sm bg-background">
          <div className="w-[clamp(240px,35%,320px)] border-r bg-muted/10">
            {chatList}
          </div>
          <div className="flex-1">
            {chatPane}
          </div>
        </div>
      ) : (
        /* ── Desktop: resizable split ── */
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 min-h-0 rounded-lg border mt-4"
        >
          <ResizablePanel defaultSize={30} minSize={20}>
            {chatList}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} minSize={40}>
            {chatPane}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      {selectedThread && (
        <ReservationModal
          reservation={isDetailsModalOpen ? selectedThread.primary : null}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

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
