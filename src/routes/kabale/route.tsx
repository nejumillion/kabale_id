import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, FileText, CreditCard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { requireKabaleAdmin } from '@/server/auth-context';

export const Route = createFileRoute('/kabale')({
  beforeLoad: async () => {
    await requireKabaleAdmin();
  },
  component: KabaleAdminLayout,
});

function KabaleAdminLayout() {
  const location = useLocation();
  
  const navItems = [
    { to: '/kabale', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/kabale/applications', label: 'Applications', icon: FileText },
    { to: '/kabale/digital-ids', label: 'Digital IDs', icon: CreditCard },
    { to: '/kabale/citizens', label: 'Citizens', icon: Users },
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
                  (item.to !== '/kabale' && location.pathname.startsWith(item.to));
                
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
