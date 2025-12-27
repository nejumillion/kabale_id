import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Edit, User, Mail, Phone, Shield, Calendar, Building2, MapPin, Activity, FileText, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserByIdFn } from '@/server/system';

export const Route = createFileRoute('/admin/users/$userId_')({
  loader: async ({ params }) => {
    const result = await getUserByIdFn({ data: { userId: params.userId } });
    if (!result.success) {
      throw new Response('User not found', { status: 404 });
    }
    return { user: result.user };
  },
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { user } = Route.useLoaderData();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'destructive';
      case 'KABALE_ADMIN':
        return 'default';
      case 'CITIZEN':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                  {user.role.replace('_', ' ')}
                </Badge>
                <span className="text-muted-foreground text-sm">User Details</span>
              </div>
            </div>
          </div>
        </div>
        <Link to="/admin/users/$userId/edit" params={{ userId: user.id }}>
          <Button className="group">
            <Edit className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
            Edit User
          </Button>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Info & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Information
            </h2>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Full Name
                    </div>
                    <div className="text-lg font-semibold">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      Role
                    </div>
                    <div className="mt-1">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </div>
                    <div className="text-lg">{user.email || '-'}</div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      Phone
                    </div>
                    <div className="text-lg">{user.phone || '-'}</div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Created
                    </div>
                    <div className="text-lg">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Last Updated
                    </div>
                    <div className="text-lg">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Role-Specific Profiles */}
          {(user.kabaleAdminProfile || user.citizenProfile) && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Role-Specific Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {user.kabaleAdminProfile && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Kabale Admin
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Kabale</div>
                        <div className="text-base font-semibold">
                          {user.kabaleAdminProfile.kabale.name}
                        </div>
                      </div>
                      {user.kabaleAdminProfile.kabale.address && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Address
                          </div>
                          <div className="text-sm">{user.kabaleAdminProfile.kabale.address}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Assigned</div>
                        <div className="text-sm">
                          {new Date(user.kabaleAdminProfile.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.citizenProfile && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Citizen Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Date of Birth</div>
                        <div className="text-base">
                          {new Date(user.citizenProfile.dateOfBirth).toLocaleDateString()}
                        </div>
                      </div>
                      {user.citizenProfile.gender && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Gender</div>
                          <div className="text-base">{user.citizenProfile.gender}</div>
                        </div>
                      )}
                      {user.citizenProfile.address && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Address
                          </div>
                          <div className="text-sm">{user.citizenProfile.address}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Profile Created</div>
                        <div className="text-sm">
                          {new Date(user.citizenProfile.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Citizen Applications & Digital IDs */}
          {user.citizenProfile && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Applications & Digital IDs
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {user.citizenProfile.idApplications.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Applications
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {user.citizenProfile.idApplications.length} total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="font-semibold text-xs">Status</TableHead>
                              <TableHead className="font-semibold text-xs">Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {user.citizenProfile.idApplications.slice(0, 5).map((app) => (
                              <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="py-2">
                                  <Badge variant="outline" className="text-xs">
                                    {app.status.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs py-2">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.citizenProfile.digitalIds.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Digital IDs
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {user.citizenProfile.digitalIds.length} total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="font-semibold text-xs">Status</TableHead>
                              <TableHead className="font-semibold text-xs">Issued</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {user.citizenProfile.digitalIds.slice(0, 5).map((id) => (
                              <TableRow key={id.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="py-2">
                                  <Badge
                                    variant={
                                      id.status === 'ACTIVE'
                                        ? 'default'
                                        : id.status === 'REVOKED'
                                          ? 'destructive'
                                          : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {id.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs py-2">
                                  {new Date(id.issuedAt).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activity Stats */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activity Statistics
            </h2>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-2 border-primary/20">
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">Active Sessions</div>
                    <div className="text-3xl font-bold text-primary">{user._count.sessions}</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 border-2 border-secondary/20">
                    <div className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground mb-2">Verification Logs</div>
                    <div className="text-3xl font-bold text-secondary-foreground">{user._count.verificationLogs}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}
