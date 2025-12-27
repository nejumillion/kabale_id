import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCheck, 
  FileText, 
  CreditCard, 
  Palette,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { requireAdmin } from '@/server/auth-context';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    await requireAdmin();
  },
  component: AdminLayout,
});

function AdminLayout() {
  const location = useLocation();
  
  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/kabales', label: 'Kabales', icon: Building2 },
    { to: '/admin/citizens', label: 'Citizens', icon: UserCheck },
    { to: '/admin/applications', label: 'Applications', icon: FileText },
    { to: '/admin/digital-ids', label: 'Digital IDs', icon: CreditCard },
    { to: '/admin/id-design', label: 'ID Design', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || 
                  (item.to !== '/admin' && location.pathname.startsWith(item.to));
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
