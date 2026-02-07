import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface RegEvent {
  id: string;
  title: string;
  category: string;
  start_date: string;
  registered_at: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [regEvents, setRegEvents] = useState<RegEvent[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setStudents(data);
    });
  }, []);

  const openStudent = async (s: Student) => {
    setSelected(s);
    const { data } = await supabase
      .from('registrations')
      .select('id, registered_at, events(id, title, category, start_date)')
      .eq('student_id', s.id);
    if (data) {
      setRegEvents(data.map((r: any) => ({
        id: r.events.id,
        title: r.events.title,
        category: r.events.category,
        start_date: r.events.start_date,
        registered_at: r.registered_at,
      })));
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Students</h1>
          <p className="text-muted-foreground mt-1">View registered students and their events.</p>
        </div>

        <div className="grid gap-3">
          {students.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No students registered yet.</CardContent></Card>
          )}
          {students.map((s) => (
            <Card
              key={s.id}
              className="cursor-pointer hover:border-primary/30 transition-colors animate-fade-in"
              onClick={() => openStudent(s)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{s.full_name || 'Unnamed'}</p>
                  <p className="text-sm text-muted-foreground">{s.email}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected?.full_name || 'Student'}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">{selected?.email}</p>
            <h4 className="font-display font-semibold mb-3">Registered Events ({regEvents.length})</h4>
            {regEvents.length === 0 && <p className="text-sm text-muted-foreground">No registrations yet.</p>}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {regEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ev.start_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs">{ev.category}</Badge>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
