import { createFileRoute, Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSystemStatsFn } from '@/server/system';

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const result = await getSystemStatsFn();
    return { stats: result.stats };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { stats } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of the Kabale Digital ID system
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
              <span>{stats.totalSystemAdmins} System Admin{stats.totalSystemAdmins !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{stats.totalKabaleAdmins} Kabale Admin{stats.totalKabaleAdmins !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{stats.totalCitizens} Citizen{stats.totalCitizens !== 1 ? 's' : ''}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Kabales</CardTitle>
            <CardDescription>Administrative units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKabales}</div>
            <Link
              to="/admin/kabales"
              className="mt-2 text-xs text-primary hover:underline"
            >
              View all Kabales →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">ID Applications</CardTitle>
            <CardDescription>Total applications submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {stats.applicationsByStatus.pendingVerification} Pending
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.applicationsByStatus.approved} Approved
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.applicationsByStatus.rejected} Rejected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Digital IDs</CardTitle>
            <CardDescription>Issued digital identity cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDigitalIds}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {stats.digitalIdsByStatus.active} Active
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.digitalIdsByStatus.revoked} Revoked
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.digitalIdsByStatus.expired} Expired
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Breakdown</CardTitle>
          <CardDescription>Current status of all ID applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Draft</div>
              <div className="text-2xl font-bold">{stats.applicationsByStatus.draft}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Submitted</div>
              <div className="text-2xl font-bold">{stats.applicationsByStatus.submitted}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Pending Verification</div>
              <div className="text-2xl font-bold">{stats.applicationsByStatus.pendingVerification}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Approved</div>
              <div className="text-2xl font-bold text-green-600">{stats.applicationsByStatus.approved}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{stats.applicationsByStatus.rejected}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to system management sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/admin/users"
              className="rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="font-medium">Users</div>
              <div className="text-sm text-muted-foreground mt-1">
                Manage system users
              </div>
            </Link>
            <Link
              to="/admin/kabales"
              className="rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="font-medium">Kabales</div>
              <div className="text-sm text-muted-foreground mt-1">
                Manage administrative units
              </div>
            </Link>
            <Link
              to="/admin/citizens"
              className="rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="font-medium">Citizens</div>
              <div className="text-sm text-muted-foreground mt-1">
                View citizen profiles
              </div>
            </Link>
            <Link
              to="/admin/digital-ids"
              className="rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="font-medium">Digital IDs</div>
              <div className="text-sm text-muted-foreground mt-1">
                Manage digital identity cards
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
