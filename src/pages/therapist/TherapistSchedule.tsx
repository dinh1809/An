import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views, SlotInfo, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addHours, startOfDay, endOfDay, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Appointment {
  id: string;
  therapist_id: string;
  parent_id: string | null;
  title: string | null;
  start_time: string;
  end_time: string;
  status: "available" | "booked" | "completed" | "cancelled";
  notes: string | null;
}

interface Exercise {
  id: string;
  user_id: string;
  title: string;
  assigned_at: string;
  is_completed: boolean;
  parent_name?: string;
}

interface CalendarEvent extends Event {
  id: string;
  type: "appointment" | "exercise";
  status?: string;
  parent_id?: string | null;
  notes?: string | null;
  parent_name?: string;
}

export default function TherapistSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<typeof Views[keyof typeof Views]>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newStatus, setNewStatus] = useState<"available" | "booked">("available");

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("therapist_id", user.id);
      
      if (appointmentsError) throw appointmentsError;
      
      // Fetch exercises for connected parents
      const { data: connections, error: connectionsError } = await supabase
        .from("connections")
        .select("parent_id")
        .eq("therapist_id", user.id)
        .eq("status", "accepted");
      
      if (connectionsError) throw connectionsError;
      
      const parentIds = connections?.map(c => c.parent_id) || [];
      
      if (parentIds.length > 0) {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from("exercises")
          .select("*")
          .in("user_id", parentIds);
        
        if (exercisesError) throw exercisesError;
        
        // Fetch parent names
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", parentIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        setExercises(
          (exercisesData || []).map(ex => ({
            ...ex,
            parent_name: profileMap.get(ex.user_id) || "Unknown",
          }))
        );
      }
      
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load schedule data",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Convert data to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const appointmentEvents: CalendarEvent[] = appointments.map(apt => ({
      id: apt.id,
      title: apt.title || (apt.status === "available" ? "Available Slot" : "Appointment"),
      start: new Date(apt.start_time),
      end: new Date(apt.end_time),
      type: "appointment" as const,
      status: apt.status,
      parent_id: apt.parent_id,
      notes: apt.notes,
    }));

    const exerciseEvents: CalendarEvent[] = exercises.map(ex => ({
      id: ex.id,
      title: `${ex.parent_name} - ${ex.title}`,
      start: new Date(ex.assigned_at),
      end: addHours(new Date(ex.assigned_at), 24 * 7), // Show as week-long event
      type: "exercise" as const,
      allDay: true,
      parent_name: ex.parent_name,
    }));

    return [...appointmentEvents, ...exerciseEvents];
  }, [appointments, exercises]);

  // Today's agenda
  const todayEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => 
      isSameDay(event.start as Date, today) || 
      ((event.start as Date) <= today && (event.end as Date) >= today)
    ).sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime());
  }, [events]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setNewTitle("");
    setNewNotes("");
    setNewStatus("available");
    setShowCreateDialog(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  }, []);

  const handleCreateAppointment = async () => {
    if (!user || !selectedSlot) return;
    
    try {
      const { error } = await supabase.from("appointments").insert({
        therapist_id: user.id,
        title: newTitle || null,
        start_time: selectedSlot.start.toISOString(),
        end_time: selectedSlot.end.toISOString(),
        status: newStatus,
        notes: newNotes || null,
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Appointment slot created",
      });
      
      setShowCreateDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create appointment",
      });
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedEvent || selectedEvent.type !== "appointment") return;
    
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", selectedEvent.id);
      
      if (error) throw error;
      
      toast({
        title: "Deleted",
        description: "Appointment removed",
      });
      
      setShowEventDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete appointment",
      });
    }
  };

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = "hsl(var(--primary))";
    let borderColor = "hsl(var(--primary))";
    
    if (event.type === "exercise") {
      backgroundColor = "hsl(200, 80%, 50%)";
      borderColor = "hsl(200, 80%, 40%)";
    } else if (event.status === "available") {
      backgroundColor = "hsl(142, 76%, 36%)";
      borderColor = "hsl(142, 76%, 30%)";
    } else if (event.status === "booked") {
      backgroundColor = "hsl(var(--primary))";
      borderColor = "hsl(var(--primary))";
    } else if (event.status === "completed") {
      backgroundColor = "hsl(215, 20%, 50%)";
      borderColor = "hsl(215, 20%, 40%)";
    } else if (event.status === "cancelled") {
      backgroundColor = "hsl(0, 70%, 50%)";
      borderColor = "hsl(0, 70%, 40%)";
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: "2px",
        borderRadius: "8px",
        color: "white",
        fontSize: "12px",
        fontWeight: 500,
      },
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "default",
      booked: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-muted-foreground">Manage your appointments and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-4">
            <div className="calendar-container" style={{ height: "600px" }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={currentView}
                onView={(view) => setCurrentView(view)}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                step={30}
                timeslots={2}
                min={startOfDay(new Date())}
                max={endOfDay(new Date())}
                className="custom-calendar"
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Agenda Sidebar */}
        <Card className="glass-card h-fit lg:sticky lg:top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="material-icons-round text-primary">today</span>
              Today's Agenda
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {todayEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="material-icons-round text-4xl mb-2 block opacity-50">event_available</span>
                  <p className="text-sm">No events scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-1 h-full min-h-[40px] rounded-full"
                          style={{ 
                            backgroundColor: event.type === "exercise" 
                              ? "hsl(200, 80%, 50%)" 
                              : event.status === "available"
                              ? "hsl(142, 76%, 36%)"
                              : "hsl(var(--primary))"
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.allDay 
                              ? "All Day" 
                              : `${format(event.start as Date, "h:mm a")} - ${format(event.end as Date, "h:mm a")}`
                            }
                          </p>
                          {event.type === "appointment" && event.status && (
                            <div className="mt-2">
                              {getStatusBadge(event.status)}
                            </div>
                          )}
                          {event.type === "exercise" && (
                            <Badge variant="outline" className="mt-2 bg-sky-500/10 text-sky-400 border-sky-500/20">
                              Exercise
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Appointment Slot</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  {format(selectedSlot.start, "MMMM d, yyyy")} at{" "}
                  {format(selectedSlot.start, "h:mm a")} -{" "}
                  {format(selectedSlot.end, "h:mm a")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Consultation, Follow-up"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as "available" | "booked")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAppointment}>
              Create Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <>
                  {selectedEvent.allDay ? (
                    "All Day Event"
                  ) : (
                    <>
                      {format(selectedEvent.start as Date, "MMMM d, yyyy")} •{" "}
                      {format(selectedEvent.start as Date, "h:mm a")} -{" "}
                      {format(selectedEvent.end as Date, "h:mm a")}
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedEvent?.type === "appointment" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {selectedEvent.status && getStatusBadge(selectedEvent.status)}
                </div>
                {selectedEvent.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Notes:</span>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedEvent.notes}</p>
                  </div>
                )}
              </>
            )}
            
            {selectedEvent?.type === "exercise" && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/20">
                  <span className="material-icons-round text-sm mr-1">fitness_center</span>
                  Exercise Assignment
                </Badge>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {selectedEvent?.type === "appointment" && (
              <Button variant="destructive" onClick={handleDeleteAppointment}>
                <span className="material-icons-round text-sm mr-1">delete</span>
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Calendar Styles */}
      <style>{`
        .custom-calendar {
          font-family: inherit;
        }
        
        .custom-calendar .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: hsl(var(--muted-foreground));
          background: hsl(var(--muted) / 0.3);
          border-color: hsl(var(--border));
        }
        
        .custom-calendar .rbc-month-view,
        .custom-calendar .rbc-time-view {
          border-color: hsl(var(--border));
          border-radius: 12px;
          overflow: hidden;
        }
        
        .custom-calendar .rbc-day-bg,
        .custom-calendar .rbc-time-content,
        .custom-calendar .rbc-time-header-content {
          border-color: hsl(var(--border));
        }
        
        .custom-calendar .rbc-off-range-bg {
          background: hsl(var(--muted) / 0.2);
        }
        
        .custom-calendar .rbc-today {
          background: hsl(var(--primary) / 0.1);
        }
        
        .custom-calendar .rbc-toolbar {
          margin-bottom: 16px;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .custom-calendar .rbc-toolbar button {
          color: hsl(var(--foreground));
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .custom-calendar .rbc-toolbar button:hover {
          background: hsl(var(--accent));
        }
        
        .custom-calendar .rbc-toolbar button.rbc-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
        }
        
        .custom-calendar .rbc-date-cell {
          padding: 4px 8px;
          text-align: right;
        }
        
        .custom-calendar .rbc-date-cell > a {
          color: hsl(var(--foreground));
          font-size: 13px;
        }
        
        .custom-calendar .rbc-time-slot {
          border-color: hsl(var(--border) / 0.5);
        }
        
        .custom-calendar .rbc-timeslot-group {
          border-color: hsl(var(--border));
        }
        
        .custom-calendar .rbc-time-gutter .rbc-label {
          font-size: 11px;
          color: hsl(var(--muted-foreground));
          padding: 0 8px;
        }
        
        .custom-calendar .rbc-event {
          padding: 4px 8px;
        }
        
        .custom-calendar .rbc-event-label {
          font-size: 11px;
        }
        
        .custom-calendar .rbc-event-content {
          font-size: 12px;
        }
        
        .custom-calendar .rbc-show-more {
          color: hsl(var(--primary));
          font-size: 12px;
          font-weight: 500;
        }
        
        .custom-calendar .rbc-current-time-indicator {
          background: hsl(var(--destructive));
          height: 2px;
        }
      `}</style>
    </div>
  );
}
