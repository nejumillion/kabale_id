import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { requireKabaleAdmin } from '@/server/auth-context';

export const Route = createFileRoute('/admin/kabale')({
  beforeLoad: async () => {
    await requireKabaleAdmin();
  },
  component: KabaleAdminLayout,
});

function KabaleAdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="w-full px-6 flex items-center justify-start gap-4 py-2">
          <Link
            to="/admin/kabale"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/kabale/applications"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Applications
          </Link>
          <Link
            to="/admin/kabale/digital-ids"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Digital IDs
          </Link>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
