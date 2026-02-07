import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return (
    <div className="min-h-screen gradient-hero text-primary-foreground">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-warm flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-display text-lg font-bold">EventConnect</span>
        </div>
        <Link to="/auth">
          <Button variant="secondary" size="sm">Sign In</Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl font-display font-bold leading-tight mb-6">
            College Events,{' '}
            <span className="text-secondary">Simplified.</span>
          </h1>
          <p className="text-lg opacity-80 mb-10 max-w-lg mx-auto">
            Discover, register, and manage college events in one place. From workshops to cultural fests — never miss what matters.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto">
          {[
            { icon: Calendar, title: 'Browse Events', desc: 'Explore workshops, symposiums, cultural programs and sports events.' },
            { icon: Zap, title: 'Instant Registration', desc: 'Register with one click. Real-time updates keep you informed.' },
            { icon: Users, title: 'Admin Dashboard', desc: 'Create events, track registrations, and manage everything effortlessly.' },
          ].map((f, i) => (
            <div key={i} className="glass rounded-xl p-6 text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-12 h-12 rounded-lg gradient-warm flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm opacity-70">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
