"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Share2, Users, Calendar as CalendarIcon, MapPin, Info, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { format, startOfDay, addHours } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function EventDetail() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"input" | "heatmap">("input");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const toggleSlot = (day: string, time: string) => {
    const slotId = `${day}-${time}`;
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slotId)) newSelected.delete(slotId);
    else newSelected.add(slotId);
    setSelectedSlots(newSelected);
  };

  const handleSave = async () => {
    if (!guestName) {
      alert("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    try {
      // For simplicity, we'll just send strings like "2023-11-14T09:00:00Z"
      // In a real app, we'd calculate the actual Date objects based on event's start date
      const mockStartDate = new Date(2023, 10, 14, 9, 0, 0); // Nov 14, 2023
      const slots = Array.from(selectedSlots).map(slotId => {
        const [day, time] = slotId.split("-");
        const dayIdx = DAYS.indexOf(day);
        const hour = parseInt(time.split(":")[0]);
        const date = new Date(mockStartDate);
        date.setDate(date.getDate() + dayIdx);
        date.setHours(hour);
        return date.toISOString();
      });

      const res = await fetch(`/api/events/${slug}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_name: guestName, slots }),
      });

      if (!res.ok) throw new Error("Failed to save availability");
      
      alert("Availability saved!");
      setView("heatmap");
      // Refresh event data to show updated heatmap if needed
      const updatedRes = await fetch(`/api/events/${slug}`);
      const updatedData = await updatedRes.json();
      setEvent(updatedData);
    } catch (err) {
      console.error(err);
      alert("Error saving availability");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </motion.div>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 text-center">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl font-black text-primary/20"
        >
          404
        </motion.h1>
        <p className="text-muted-foreground font-medium max-w-[240px]">Sorry, we couldn't find that collection. It might have been deleted or moved.</p>
        <Button onClick={() => router.push("/")} className="rounded-2xl h-16 px-8 font-bold text-lg shadow-lg">Back to Dashboard</Button>
      </div>
    );
  }

  // Calculate heatmap counts
  const heatmapData: Record<string, number> = {};
  event.participants?.forEach((p: any) => {
    p.availabilities?.forEach((a: any) => {
      const date = new Date(a.slot_datetime);
      const dayName = format(date, "EEE"); // "Mon", "Tue"...
      const timeStr = format(date, "HH:00");
      const slotId = `${dayName}-${timeStr}`;
      heatmapData[slotId] = (heatmapData[slotId] || 0) + 1;
    });
  });

  const totalParticipants = event.participants?.length || 0;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-2xl shrink-0">
          <ChevronLeft size={24} />
        </Button>
        <div className="flex-1 px-4 truncate">
          <h1 className="font-bold truncate text-lg tracking-tight">{event.title}</h1>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleShare}
          className="rounded-2xl border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
        >
          <Share2 size={20} />
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <main className="p-6 space-y-8">
          {/* View Toggle */}
          <div className="flex p-1.5 bg-muted rounded-[1.5rem] relative overflow-hidden">
            <motion.div 
               className="absolute inset-y-1.5 rounded-2xl bg-white shadow-sm"
               initial={false}
               animate={{ 
                 left: view === "input" ? "6px" : "calc(50% + 3px)",
                 width: "calc(50% - 9px)"
               }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
              onClick={() => setView("input")}
              className={cn(
                "flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-colors z-10",
                view === "input" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              My Availability
            </button>
            <button 
              onClick={() => setView("heatmap")}
              className={cn(
                "flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-colors z-10",
                view === "heatmap" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Group Heatmap
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-8"
            >
              {view === "input" && (
                <section className="space-y-4">
                   <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-emerald-100/50 text-emerald-700 px-3 py-1 rounded-full font-bold border-none">
                        ACTIVE
                      </Badge>
                      <Badge variant="outline" className="flex gap-1.5 items-center px-3 py-1 rounded-full text-muted-foreground border-muted/50 bg-muted/20">
                        <Users size={14} />
                        {totalParticipants} joined
                      </Badge>
                   </div>
                   
                   <div className="space-y-4">
                     <p className="text-muted-foreground font-medium leading-relaxed">{event.description}</p>
                     <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3 text-primary font-bold bg-primary/5 p-3 rounded-2xl w-fit pr-6">
                          <CalendarIcon size={18} />
                          <span>{event.date_range}</span>
                       </div>
                       <div className="flex items-center gap-3 text-muted-foreground font-medium p-1">
                          <MapPin size={18} className="text-muted-foreground/40" />
                          <span>{event.location_name || "Location TBD"}</span>
                       </div>
                     </div>
                   </div>

                    <div className="space-y-3 pt-4 border-t border-dashed">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Your Identity</label>
                      <Input 
                        placeholder="What should we call you?" 
                        className="h-16 rounded-2xl border-none bg-white shadow-sm text-lg font-bold px-6 focus-visible:ring-primary/20"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>
                </section>
              )}

              {/* Grid Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                    <Info size={14} className="text-primary/40" />
                    {view === "input" ? "Tap to select slots" : "Collective match"}
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary-foreground/60">
                    {view === "input" ? `${selectedSlots.size} slots` : `${totalParticipants} active`}
                  </Badge>
                </div>

                <div className="relative overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar">
                  <div className="min-w-[440px]">
                    {/* Header Days */}
                    <div className="grid grid-cols-6 mb-4">
                      <div className="col-span-1"></div>
                      {DAYS.map((day) => (
                        <div key={day} className="text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Time Rows */}
                    <div className="space-y-2">
                      {TIMES.map((time, rowIdx) => (
                        <div key={time} className="grid grid-cols-6 items-center">
                          <div className="text-[10px] font-bold text-muted-foreground/50 pr-4 text-right tabular-nums">
                            {time}
                          </div>
                          {DAYS.map((day, colIdx) => {
                            const slotId = `${day}-${time}`;
                            const isSelected = selectedSlots.has(slotId);
                            const count = heatmapData[slotId] || 0;
                            const ratio = totalParticipants > 0 ? count / totalParticipants : 0;
                            
                            return (
                              <motion.div 
                                key={`${day}-${time}`} 
                                className="aspect-square p-0.5"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: (rowIdx * 0.02) + (colIdx * 0.01) }}
                              >
                                <motion.div 
                                  onClick={() => view === "input" && toggleSlot(day, time)}
                                  whileHover={{ scale: view === "input" ? 1.05 : 1 }}
                                  whileTap={{ scale: view === "input" ? 0.9 : 1 }}
                                  className={cn(
                                    "w-full h-full rounded-[0.6rem] transition-colors cursor-pointer relative overflow-hidden group/slot",
                                    view === "input" 
                                      ? isSelected 
                                        ? "bg-primary shadow-lg ring-4 ring-primary/10" 
                                        : "bg-white border-2 border-muted/30 hover:border-primary/30"
                                      : ratio > 0.8 
                                        ? "bg-primary" 
                                        : ratio > 0.5 
                                          ? "bg-primary/60" 
                                          : ratio > 0.2 
                                            ? "bg-primary/30" 
                                            : ratio > 0
                                              ? "bg-primary/10"
                                              : "bg-white border-2 border-muted/20"
                                  )}
                                >
                                  {view === "input" && isSelected && (
                                    <motion.div 
                                      initial={{ scale: 0, rotate: -45 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      className="flex items-center justify-center h-full text-white"
                                    >
                                      <Check size={14} strokeWidth={4} />
                                    </motion.div>
                                  )}
                                  {view === "heatmap" && count > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-overlay opacity-0 group-hover/slot:opacity-100 transition-opacity">
                                      {count}
                                    </div>
                                  )}
                                </motion.div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Legend (only for Heatmap) */}
              {view === "heatmap" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-8 pt-6 border-t border-muted/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md bg-primary/20" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Few</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-primary scale-110">
                    <div className="w-5 h-5 rounded-md bg-primary/60 shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Popular</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md bg-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-primary">All</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </ScrollArea>

      {/* Floating Action Bar */}
      {view === "input" && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent z-10">
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <Button 
              onClick={handleSave}
              disabled={isSubmitting || selectedSlots.size === 0 || !guestName}
              className="w-full h-18 rounded-[2.2rem] text-xl font-black gap-3 shadow-2xl shadow-primary/30 transition-all hover:translate-y-[-2px] active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10">{isSubmitting ? "Syncing..." : "Lock In Availability"}</span>
              {!isSubmitting && <Check size={26} strokeWidth={4} className="relative z-10" />}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
