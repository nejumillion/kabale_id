import { createFileRoute, Link } from '@tanstack/react-router';
import { 
  Users, 
  Building2, 
  FileText, 
  CreditCard, 
  UserCheck, 
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  ArrowRight
} from 'lucide-react';
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
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">System Dashboard</h1>
            <p className="text-muted-foreground mt-1.5">
              Overview of the Kabale Digital ID Card system
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <CardDescription className="text-xs">All registered users</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2">{stats.totalUsers}</div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {stats.totalSystemAdmins} Admin{stats.totalSystemAdmins !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {stats.totalKabaleAdmins} Kabale Admin{stats.totalKabaleAdmins !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                {stats.totalCitizens} Citizen{stats.totalCitizens !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Kabales</CardTitle>
              <CardDescription className="text-xs">Administrative units</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2">{stats.totalKabales}</div>
            <Link
              to="/admin/kabales"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1 group/link"
            >
              View all Kabales
              <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">ID Applications</CardTitle>
              <CardDescription className="text-xs">Total applications submitted</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2">{stats.totalApplications}</div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stats.applicationsByStatus.pendingVerification} Pending
              </Badge>
              <Badge variant="default" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {stats.applicationsByStatus.approved} Approved
              </Badge>
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
              <CardDescription className="text-xs">Issued digital identity cards</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-2">{stats.totalDigitalIds}</div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="default" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {stats.digitalIdsByStatus.active} Active
              </Badge>
              <Badge variant="destructive" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                {stats.digitalIdsByStatus.revoked} Revoked
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stats.digitalIdsByStatus.expired} Expired
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Application Status Breakdown
          </CardTitle>
          <CardDescription>Current status of all ID applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2 rounded-lg bg-muted/50 p-4 border-2 border-muted/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Draft</div>
              <div className="text-3xl font-bold">{stats.applicationsByStatus.draft}</div>
            </div>
            <div className="space-y-2 rounded-lg bg-blue-500/10 p-4 border-2 border-blue-500/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-500">Submitted</div>
              <div className="text-3xl font-bold">{stats.applicationsByStatus.submitted}</div>
            </div>
              <div className="space-y-2 rounded-lg bg-purple-500/10 p-4 border-2 border-purple-500/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-purple-500">Pending Verification</div>
              <div className="text-3xl font-bold">{stats.applicationsByStatus.pendingVerification}</div>
            </div>
            <div className="space-y-2 rounded-lg bg-primary/10 p-4 border-2 border-primary/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">Approved</div>
              <div className="text-3xl font-bold text-primary">{stats.applicationsByStatus.approved}</div>
            </div>
            <div className="space-y-2 rounded-lg bg-destructive/10 p-4 border-2 border-destructive/20">
              <div className="text-xs font-semibold uppercase tracking-wide text-destructive">Rejected</div>
              <div className="text-3xl font-bold text-destructive">{stats.applicationsByStatus.rejected}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Navigate to system management sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/admin/users"
              className="group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Users</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Manage system users
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
            <Link
              to="/admin/kabales"
              className="group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Kabales</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Manage administrative units
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
            <Link
              to="/admin/citizens"
              className="group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Citizens</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    View citizen profiles
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
            <Link
              to="/admin/digital-ids"
              className="group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Digital IDs</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Manage digital identity cards
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
