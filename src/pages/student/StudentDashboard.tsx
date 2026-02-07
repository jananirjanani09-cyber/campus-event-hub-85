import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface EventRow {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  start_date: string;
  end_date: string;
  max_participants: number | null;
}

const categoryColors: Record<string, string> = {
  workshop: 'bg-primary/10 text-primary',
  symposium: 'bg-secondary/10 text-secondary',
  cultural: 'bg-accent/10 text-accent',
  sports: 'bg-success/10 text-success',
  seminar: 'bg-warning/10 text-warning',
  hackathon: 'bg-destructive/10 text-destructive',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Set<string>>(new Set());
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [registering, setRegistering] = useState<string | null>(null);

  const loadData = async () => {
    const [{ data: evs }, { data: regs }] = await Promise.all([
      supabase.from('events').select('*').gte('end_date', new Date().toISOString()).order('start_date'),
      supabase.from('registrations').select('event_id').eq('student_id', user!.id),
    ]);
    if (evs) {
      setEvents(evs);
      const counts: Record<string, number> = {};
      for (const ev of evs) {
        const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('event_id', ev.id);
        counts[ev.id] = count ?? 0;
      }
      setRegCounts(counts);
    }
    if (regs) setMyRegistrations(new Set(regs.map(r => r.event_id)));
  };

  useEffect(() => {
    loadData();

    // Real-time registration updates
    const channel = supabase
      .channel('registrations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    const { error } = await supabase.from('registrations').insert({ event_id: eventId, student_id: user!.id });
    if (error) {
      if (error.message.includes('duplicate')) toast.error('Already registered for this event');
      else toast.error(error.message);
    } else {
      toast.success('Successfully registered!');
      loadData();
    }
    setRegistering(null);
  };

  const handleUnregister = async (eventId: string) => {
    const { error } = await supabase.from('registrations').delete().eq('event_id', eventId).eq('student_id', user!.id);
    if (error) toast.error(error.message);
    else { toast.success('Unregistered'); loadData(); }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground mt-1">Browse and register for college events.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {events.length === 0 && (
            <Card className="md:col-span-2"><CardContent className="p-8 text-center text-muted-foreground">No upcoming events right now.</CardContent></Card>
          )}
          {events.map((ev) => {
            const isRegistered = myRegistrations.has(ev.id);
            const isFull = ev.max_participants ? (regCounts[ev.id] ?? 0) >= ev.max_participants : false;

            return (
              <Card key={ev.id} className="animate-fade-in overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{ev.title}</CardTitle>
                    <Badge className={`capitalize ${categoryColors[ev.category] || ''}`} variant="outline">
                      {ev.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{ev.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(ev.start_date), 'MMM d, h:mm a')}</span>
                    {ev.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.venue}</span>}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {regCounts[ev.id] ?? 0}{ev.max_participants ? ` / ${ev.max_participants}` : ''}
                    </span>
                  </div>
                  {isRegistered ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-sm text-success"><CheckCircle2 className="w-4 h-4" />Registered</span>
                      <Button variant="ghost" size="sm" onClick={() => handleUnregister(ev.id)} className="ml-auto text-xs">
                        Unregister
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={isFull || registering === ev.id}
                      onClick={() => handleRegister(ev.id)}
                    >
                      {isFull ? 'Event Full' : registering === ev.id ? 'Registering...' : 'Register Now'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
