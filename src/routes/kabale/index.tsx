import { createFileRoute, Link } from '@tanstack/react-router';
import { Building2, FileText, CreditCard, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getKabaleAdminDashboardFn } from '@/server/kabales';

export const Route = createFileRoute('/kabale/')({
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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{kabale.name} Dashboard</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {kabale.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <CardDescription className="text-xs">All ID applications</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2">{stats.totalApplications}</div>
            <Link
              to="/kabale/applications"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1 group/link"
            >
              View all applications
              <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <CardDescription className="text-xs">Requires your attention</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2 text-primary">
              {stats.applicationsByStatus.pendingVerification}
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stats.applicationsByStatus.submitted} Submitted
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CardDescription className="text-xs">Successfully verified</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2 text-primary">
              {stats.applicationsByStatus.approved}
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="destructive" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                {stats.applicationsByStatus.rejected} Rejected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Digital IDs</CardTitle>
              <CardDescription className="text-xs">Issued identity cards</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2">{stats.totalDigitalIds}</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="default" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {stats.digitalIdsByStatus.active} Active
              </Badge>
              <Badge variant="destructive" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                {stats.digitalIdsByStatus.revoked} Revoked
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Application Status Breakdown
          </CardTitle>
          <CardDescription>Current status of all ID applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Draft</div>
              <div className="text-3xl font-bold">{stats.applicationsByStatus.draft}</div>
            </div>
            <div className="space-y-2 rounded-lg bg-blue-500/10 p-4 border-2 border-blue-500/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-500">Submitted</div>
              <div className="text-3xl font-bold text-blue-500">{stats.applicationsByStatus.submitted}</div>
            </div>
            <div className="space-y-2 rounded-lg bg-purple-500/10 p-4 border-2 border-purple-500/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-purple-500">Pending Verification</div>
              <div className="text-3xl font-bold text-purple-500">
                {stats.applicationsByStatus.pendingVerification}
              </div>
            </div>
            <div className="space-y-2 rounded-lg bg-primary/10 p-4 border-2 border-primary/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Approved</div>
              <div className="text-3xl font-bold text-primary">
                {stats.applicationsByStatus.approved}
              </div>
            </div>
            <div className="space-y-2 rounded-lg bg-destructive/10 p-4 border-2 border-destructive/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-destructive">Rejected</div>
              <div className="text-3xl font-bold text-destructive">
                {stats.applicationsByStatus.rejected}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kabale Information */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Kabale Information
          </CardTitle>
          <CardDescription>Your assigned administrative unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</div>
              <div className="text-lg font-semibold">{kabale.name}</div>
            </div>
            {kabale.address && (
              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Address
                </div>
                <div className="text-lg">{kabale.address}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
