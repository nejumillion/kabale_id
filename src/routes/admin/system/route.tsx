import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { requireAdmin } from '@/server/auth-context';

export const Route = createFileRoute('/admin/system')({
  beforeLoad: async () => {
    await requireAdmin();
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="w-full px-6 flex items-center justify-start gap-4 py-2">
        <Link to="/admin/system" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link to="/admin/system/users" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Users
          </Link>
          <Link to="/admin/system/kabales" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Kabales
          </Link>
          <Link to="/admin/system/citizens" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Citizens
          </Link>
          <Link to="/admin/system/applications" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Applications
          </Link>
          <Link
            to="/admin/system/digital-ids"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            IDs
          </Link>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
