"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Plus, Users, Calendar, MoreHorizontal, ChevronRight, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 selection:bg-primary/20">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />
      
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-transparent backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Users size={20} />
          </div>
          <span className="text-xl font-bold text-primary">Ngumpul</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-full relative">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-background rounded-full"></span>
          </button>
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <main className="px-6 py-4 space-y-8 relative">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-4"
          >
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent pb-1">Your Events</h1>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <Input 
                placeholder="Search your collective..." 
                className="pl-12 h-14 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm text-lg focus-visible:ring-primary/20 focus-visible:bg-white transition-all"
              />

            </div>
          </div>

          {/* Active Collections */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Active Collections</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full h-6 px-2 text-sm font-bold">
                  {events.length}
                </Badge>
              </div>
              <button className="text-primary font-semibold hover:underline">View All</button>
            </div>

            <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3">
              {loading ? (
                <p className="text-muted-foreground font-medium col-span-full py-8 text-center">Loading events...</p>
              ) : events.length === 0 ? (
                <p className="text-muted-foreground font-medium col-span-full py-8 text-center italic">No active events yet. Create one!</p>
              ) : (
                events.map((event, i) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, ease: "easeOut" }}
                  >
                    <Link href={`/event/${event.slug}`}>
                      <Card className="rounded-[2xl] border border-white/40 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 space-y-4 relative z-10">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 flex gap-1 items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </Badge>
                          <button className="p-1 hover:bg-muted rounded-lg">
                            <MoreHorizontal size={20} className="text-muted-foreground" />
                          </button>
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="text-2xl font-bold leading-tight">{event.title}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar size={16} />
                            <span className="text-sm font-medium">{event.date_range || "Date TBD"}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <Avatar key={i} className="border-2 border-background w-8 h-8">
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${i + 10}`} />
                                <AvatarFallback>A{i}</AvatarFallback>
                              </Avatar>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary">
                              +2
                            </div>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">5 filled</span>
                        </div>
                        </div>
                      </CardContent>
                    </Card>
                    </Link>
                  </motion.div>
                ))
              )}

              {/* Create New Card */}
              <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: events.length * 0.05 + 0.1, ease: "easeOut" }}
                 className="sm:col-span-2 lg:col-span-1"
              >
                <Link href="/event/new" className="block h-full">
                  <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/20 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 h-full">
                    <CardContent className="p-8 space-y-6 flex flex-col items-start min-h-[160px] justify-center relative">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                      <Plus size={28} strokeWidth={3} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold">Create New Collection</h3>
                      <p className="text-primary-foreground/80 font-medium">Organize your next meetup in seconds.</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Past Memories */}
          <section className="space-y-4 pb-8">
            <h2 className="text-2xl font-bold text-foreground/80">Past Memories</h2>
            <div className="space-y-3">
              {[
                { title: "Founders Dinner", date: "Oct 24, 2023", participants: 8, icon: "🍽️" },
                { title: "Sarah's Birthday Bash", date: "Sep 12, 2023", participants: 24, icon: "🎉" }
              ].map((event, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl grayscale overflow-hidden opacity-60">
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{event.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium">{event.date} • {event.participants} Participants</p>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground/40" />
                </div>
              ))}
            </div>
          </section>
        </main>
      </ScrollArea>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t flex items-center justify-around px-4 z-20">
        <Link href="/" className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:bg-emerald-200 transition-colors">
            <Calendar size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Events</span>
        </Link>
        <Link href="/event/new" className="flex flex-col items-center gap-1 group">
          <div className="p-3 text-muted-foreground rounded-2xl group-hover:bg-muted transition-colors">
            <Plus size={24} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Create</span>
        </Link>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-3 text-muted-foreground rounded-2xl group-hover:bg-muted transition-colors">
            <Settings size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Settings</span>
        </button>
      </nav>
    </div>
  );
}
