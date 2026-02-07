import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface MyEvent {
  id: string;
  registered_at: string;
  event: {
    id: string;
    title: string;
    category: string;
    venue: string;
    start_date: string;
    end_date: string;
  };
}

export default function StudentMyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<MyEvent[]>([]);

  useEffect(() => {
    supabase
      .from('registrations')
      .select('id, registered_at, events(id, title, category, venue, start_date, end_date)')
      .eq('student_id', user!.id)
      .order('registered_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setEvents(data.map((r: any) => ({ id: r.id, registered_at: r.registered_at, event: r.events })));
        }
      });
  }, [user]);

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">My Events</h1>
          <p className="text-muted-foreground mt-1">Events you've registered for.</p>
        </div>

        <div className="grid gap-3">
          {events.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">You haven't registered for any events yet.</CardContent></Card>
          )}
          {events.map((item) => {
            const isPast = new Date(item.event.end_date) < new Date();
            return (
              <Card key={item.id} className={`animate-fade-in ${isPast ? 'opacity-60' : ''}`}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{item.event.title}</p>
                      <Badge variant="outline" className="capitalize text-xs shrink-0">{item.event.category}</Badge>
                      {isPast && <Badge variant="secondary" className="text-xs shrink-0">Past</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(item.event.start_date), 'MMM d, yyyy h:mm a')}</span>
                      {item.event.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.event.venue}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
