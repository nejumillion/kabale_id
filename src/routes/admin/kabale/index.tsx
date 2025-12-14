import { createFileRoute, Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getKabaleAdminDashboardFn } from '@/server/kabales';

export const Route = createFileRoute('/admin/kabale/')({
  loader: async () => {
    const result = await getKabaleAdminDashboardFn();
    if (!result.success) {
      throw new Response(result.error || 'Failed to load dashboard', { status: 500 });
    }
    return { kabale: result.kabale, stats: result.stats };
  },
  component: KabaleAdminDashboard,
});

function KabaleAdminDashboard() {
  const { kabale, stats } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{kabale.name} Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Code: <code className="bg-muted px-1 py-0.5 rounded text-sm">{kabale.code}</code>
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <CardDescription>All ID applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <Link
              to="/admin/kabale/applications"
              className="mt-2 text-xs text-primary hover:underline"
            >
              View all applications →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <CardDescription>Requires your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.applicationsByStatus.pendingVerification}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {stats.applicationsByStatus.submitted} Submitted
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CardDescription>Successfully verified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.applicationsByStatus.approved}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {stats.applicationsByStatus.rejected} Rejected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Digital IDs</CardTitle>
            <CardDescription>Issued identity cards</CardDescription>
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
              <div className="text-2xl font-bold text-orange-600">
                {stats.applicationsByStatus.pendingVerification}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Approved</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.applicationsByStatus.approved}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Rejected</div>
              <div className="text-2xl font-bold text-red-600">
                {stats.applicationsByStatus.rejected}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kabale Information */}
      <Card>
        <CardHeader>
          <CardTitle>Kabale Information</CardTitle>
          <CardDescription>Your assigned administrative unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="text-lg font-medium">{kabale.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Code</div>
              <div className="text-lg">
                <code className="bg-muted px-2 py-1 rounded text-sm">{kabale.code}</code>
              </div>
            </div>
            {kabale.address && (
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="text-lg">{kabale.address}</div>
              </div>
            )}
            {kabale.phone && (
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="text-lg">{kabale.phone}</div>
              </div>
            )}
            {kabale.email && (
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-lg">{kabale.email}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
