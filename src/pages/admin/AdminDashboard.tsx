import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, students: 0, registrations: 0 });

  useEffect(() => {
    async function load() {
      const [{ count: events }, { count: students }, { count: registrations }] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        events: events ?? 0,
        students: students ?? 0,
        registrations: registrations ?? 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: 'Total Events', value: stats.events, icon: Calendar, gradient: 'gradient-primary' },
    { label: 'Students', value: stats.students, icon: Users, gradient: 'gradient-warm' },
    { label: 'Registrations', value: stats.registrations, icon: TrendingUp, gradient: 'gradient-primary' },
  ];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your college events.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Card key={c.label} className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <div className={`w-9 h-9 rounded-lg ${c.gradient} flex items-center justify-center`}>
                  <c.icon className="w-4 h-4 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display font-bold">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
