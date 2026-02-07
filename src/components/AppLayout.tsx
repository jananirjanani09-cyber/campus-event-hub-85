import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, LayoutDashboard, Calendar, Users, LogOut } from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/students', label: 'Students', icon: Users },
];

const studentLinks = [
  { to: '/student', label: 'Events', icon: Calendar },
  { to: '/student/my-events', label: 'My Events', icon: LayoutDashboard },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, signOut, user } = useAuth();
  const location = useLocation();
  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg gradient-warm flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display font-bold">EventConnect</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 mb-2 truncate">{user?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sidebar-primary" />
            <span className="font-display font-bold text-sm">EventConnect</span>
          </div>
          <div className="flex items-center gap-2">
            {links.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 h-8 w-8">
                  <link.icon className="w-4 h-4" />
                </Button>
              </Link>
            ))}
            <Button variant="ghost" size="icon" onClick={signOut} className="text-sidebar-foreground/70 h-8 w-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
