import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
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
  created_at: string;
}

const categories = ['workshop', 'symposium', 'cultural', 'sports', 'seminar', 'hackathon'];

export default function AdminEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'workshop', venue: '', start_date: '', end_date: '', max_participants: '' });
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});

  const loadEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('start_date', { ascending: false });
    if (data) {
      setEvents(data);
      // Fetch registration counts
      const counts: Record<string, number> = {};
      for (const ev of data) {
        const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('event_id', ev.id);
        counts[ev.id] = count ?? 0;
      }
      setRegCounts(counts);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'workshop', venue: '', start_date: '', end_date: '', max_participants: '' });
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.title || !form.start_date || !form.end_date) {
      toast.error('Please fill required fields');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      venue: form.venue,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      created_by: user!.id,
    };

    if (editing) {
      const { error } = await supabase.from('events').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Event updated');
    } else {
      const { error } = await supabase.from('events').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Event created');
    }

    setOpen(false);
    resetForm();
    loadEvents();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Event deleted');
    loadEvents();
  };

  const openEdit = (ev: EventRow) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description,
      category: ev.category,
      venue: ev.venue,
      start_date: ev.start_date.slice(0, 16),
      end_date: ev.end_date.slice(0, 16),
      max_participants: ev.max_participants?.toString() ?? '',
    });
    setOpen(true);
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Events</h1>
            <p className="text-muted-foreground mt-1">Create and manage college events.</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />New Event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Event' : 'Create Event'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input value={form.venue} onChange={(e) => setForm(f => ({ ...f, venue: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Max Participants (optional)</Label>
                  <Input type="number" value={form.max_participants} onChange={(e) => setForm(f => ({ ...f, max_participants: e.target.value }))} />
                </div>
                <Button onClick={handleSave} className="w-full">{editing ? 'Update Event' : 'Create Event'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {events.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No events yet. Create your first event!</CardContent></Card>
          )}
          {events.map((ev) => (
            <Card key={ev.id} className="animate-fade-in">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{ev.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{ev.category} • {ev.venue}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(ev)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ev.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{ev.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{format(new Date(ev.start_date), 'MMM d, yyyy h:mm a')}</span>
                  <span>→</span>
                  <span>{format(new Date(ev.end_date), 'MMM d, yyyy h:mm a')}</span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Users className="w-3 h-3" />
                    {regCounts[ev.id] ?? 0}{ev.max_participants ? ` / ${ev.max_participants}` : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
