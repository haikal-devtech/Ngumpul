"use client";

import { useState } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useAppContext } from "@/components/AppContext";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { language, myEvents, joinedEvents } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const t = {
    title: language === "id" ? "Kalender Acara" : "Event Calendar",
    subtitle: language === "id" ? "Lihat semua acara dalam tampilan kalender" : "View all your events in calendar view",
    noEvents: language === "id" ? "Tidak ada acara di tanggal ini" : "No events on this date",
    myEvents: language === "id" ? "Acara Saya" : "My Events",
    joined: language === "id" ? "Acara Bergabung" : "Joined Events",
    today: language === "id" ? "Hari Ini" : "Today",
  };

  const allEvents = [...myEvents, ...joinedEvents];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start with empty slots
  const startPad = getDay(monthStart);
  const paddedDays = Array(startPad).fill(null).concat(days);

  const getEventsForDay = (day: Date) => {
    return allEvents.filter((event) =>
      event.dates.some((d) => isSameDay(new Date(d), day))
    );
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Calendar size={20} />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">{t.title}</h1>
        </div>
        <p className="text-zinc-400 dark:text-zinc-500 ml-13 pl-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
          {/* Month Navigator */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isTodayDay = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all text-sm font-medium",
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                      : isTodayDay
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800"
                  )}
                >
                  {format(day, "d")}
                  {dayEvents.length > 0 && (
                    <div className={cn(
                      "absolute bottom-1.5 flex gap-0.5",
                    )}>
                      {dayEvents.slice(0, 3).map((_, ei) => (
                        <div
                          key={ei}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            isSelected ? "bg-white/70" : "bg-indigo-500 dark:bg-indigo-400"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{language === "id" ? "Ada Acara" : "Has Events"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700" />
              <span>{t.today}</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Events for selected day */}
        <div className="space-y-4">
          {selectedDay && (
            <div>
              <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
                {format(selectedDay, "EEEE, d MMMM yyyy")}
              </h3>

              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                  <Calendar size={36} className="text-zinc-300 dark:text-zinc-600 mb-3" />
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">{t.noEvents}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => {
                    const isOwned = myEvents.some((e) => e.id === event.id);
                    return (
                      <div
                        key={event.id}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight">{event.title}</h4>
                          <span className={cn(
                            "shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full",
                            isOwned
                              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                              : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                          )}>
                            {isOwned ? (language === "id" ? "Milik Saya" : "Mine") : (language === "id" ? "Bergabung" : "Joined")}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {event.location && (
                            <p className="text-xs text-zinc-400 flex items-center gap-1 dark:text-zinc-500">
                              <MapPin size={11} />
                              {event.location}
                            </p>
                          )}
                          <p className="text-xs text-zinc-400 flex items-center gap-1 dark:text-zinc-500">
                            <Clock size={11} />
                            {event.startTime} – {event.endTime}
                          </p>
                          <p className="text-xs text-zinc-400 flex items-center gap-1 dark:text-zinc-500">
                            <Users size={11} />
                            {event.participants.length} {language === "id" ? "peserta" : "participants"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
