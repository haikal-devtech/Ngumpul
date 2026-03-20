"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function NewEvent() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
  });

  useEffect(() => {
    setDate(new Date());
  }, []);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (step === 1) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location_name: formData.location,
          date_range: date ? format(date, "PPP") : "",
        }),
      });

      if (!response.ok) throw new Error("Failed to create event");

      const event = await response.json();
      router.push(`/event/${event.slug}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-2xl">
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-2xl font-bold">Create Event</h1>
      </header>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2].map((s) => (
          <div 
            key={s} 
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s <= step ? "bg-primary" : "bg-muted"
            )} 
          />
        ))}
      </div>

      <main className="flex-1 space-y-8">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Event Details</label>
              <Input 
                placeholder="What's the occasion?" 
                className="h-16 rounded-2xl border-none bg-white shadow-sm text-xl font-bold px-6"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input 
                placeholder="Description (optional)" 
                className="h-14 rounded-2xl border-none bg-white shadow-sm text-lg px-6"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <Input 
                  placeholder="Add location (optional)" 
                  className="border-none shadow-none focus-visible:ring-0 p-0 text-lg font-medium"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <CalendarIcon size={20} />
                </div>
                <Popover>
                  <PopoverTrigger>
                    <div
                      className={cn(
                        "flex-1 justify-start text-left font-medium text-lg p-0 hover:bg-transparent cursor-pointer",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP") : "Pick a date"}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="rounded-3xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Time Settings</label>
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                <CardContent className="p-6 space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        <span className="font-bold text-lg">Morning (08:00 - 12:00)</span>
                     </div>
                     <input type="checkbox" defaultChecked className="w-6 h-6 rounded-md accent-primary" />
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        <span className="font-bold text-lg">Afternoon (12:00 - 17:00)</span>
                     </div>
                     <input type="checkbox" defaultChecked className="w-6 h-6 rounded-md accent-primary" />
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        <span className="font-bold text-lg">Evening (17:00 - 22:00)</span>
                     </div>
                     <input type="checkbox" defaultChecked className="w-6 h-6 rounded-md accent-primary" />
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer Button */}
      <footer className="mt-auto pt-6">
        <Button 
          className="w-full h-16 rounded-[2rem] text-xl font-bold gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          onClick={handleSubmit}
          disabled={!formData.title || isSubmitting}
        >
          {isSubmitting ? "Creating..." : step === 1 ? "Next Step" : "Create Event"}
          {!isSubmitting && <ArrowRight size={20} strokeWidth={2.5} />}
        </Button>
      </footer>
    </div>
  );
}
