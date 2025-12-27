import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Shield, FileText, CreditCard, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getKabaleAdminCitizenByIdFn } from '@/server/kabales';

export const Route = createFileRoute('/kabale/citizens/$citizenId')({
  loader: async ({ params }) => {
    const result = await getKabaleAdminCitizenByIdFn({ data: { citizenId: params.citizenId } });
    if (!result.success) {
      throw new Response(result.error || 'Citizen not found', { status: 404 });
    }
    return { citizen: result.citizen };
  },
  component: CitizenDetailsPage,
});

function CitizenDetailsPage() {
  const { citizen } = Route.useLoaderData();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'default';
      case 'REJECTED':
      case 'REVOKED':
        return 'destructive';
      case 'PENDING_VERIFICATION':
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
          <Link to="/kabale/citizens">
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
                {citizen.user.firstName} {citizen.user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-xs">Citizen</Badge>
                <span className="text-muted-foreground text-sm">Citizen Details</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Personal Info & Account */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
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
                      {citizen.user.firstName} {citizen.user.lastName}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </div>
                    <div className="text-lg">{citizen.user.email || '-'}</div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      Phone
                    </div>
                    <div className="text-lg">{citizen.phone || citizen.user.phone || '-'}</div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Date of Birth
                    </div>
                    <div className="text-lg">
                      {new Date(citizen.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                  {citizen.gender && (
                    <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gender</div>
                      <div className="text-lg">{citizen.gender}</div>
                    </div>
                  )}
                  {citizen.address && (
                    <div className="space-y-2 rounded-lg bg-muted/50 p-4 sm:col-span-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        Address
                      </div>
                      <div className="text-lg">{citizen.address}</div>
                    </div>
                  )}
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Profile Created
                    </div>
                    <div className="text-lg">
                      {new Date(citizen.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Last Updated
                    </div>
                    <div className="text-lg">
                      {new Date(citizen.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Information Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account Information
            </h2>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User ID</div>
                    <div className="text-sm font-mono">{citizen.user.id}</div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Account Created
                    </div>
                    <div className="text-lg">
                      {new Date(citizen.user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      Role
                    </div>
                    <div className="mt-1">
                      <Badge variant="secondary">Citizen</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Statistics
            </h2>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-2 border-primary/20">
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-2 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Applications to This Kabale
                    </div>
                    <div className="text-3xl font-bold text-primary">{citizen._count.idApplications}</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 border-2 border-secondary/20">
                    <div className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground mb-2 flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5" />
                      Digital IDs from This Kabale
                    </div>
                    <div className="text-3xl font-bold text-secondary-foreground">{citizen._count.digitalIds}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Applications & Digital IDs Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Applications & Digital IDs
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {citizen.idApplications.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  ID Applications
                </CardTitle>
                <CardDescription className="text-xs">
                  {citizen.idApplications.length} application{citizen.idApplications.length !== 1 ? 's' : ''} to this Kabale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                        <TableHead className="font-semibold text-xs">Submitted</TableHead>
                        <TableHead className="font-semibold text-xs">Digital ID</TableHead>
                        <TableHead className="font-semibold text-xs">Verifications</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {citizen.idApplications.map((app) => (
                        <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="py-2">
                            <Badge variant={getStatusBadgeVariant(app.status)} className="text-xs">
                              {app.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs py-2">
                            {app.submittedAt
                              ? new Date(app.submittedAt).toLocaleDateString()
                              : new Date(app.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-2">
                            {app.digitalId ? (
                              <Badge
                                variant={getStatusBadgeVariant(app.digitalId.status)}
                                className="text-xs"
                              >
                                {app.digitalId.status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs py-2">
                            {app._count.verificationLogs}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {citizen.digitalIds.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Digital IDs
                </CardTitle>
                <CardDescription className="text-xs">
                  {citizen.digitalIds.length} digital ID{citizen.digitalIds.length !== 1 ? 's' : ''} from this Kabale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                        <TableHead className="font-semibold text-xs">Issued</TableHead>
                        <TableHead className="font-semibold text-xs">Expires</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {citizen.digitalIds.map((digitalId) => (
                        <TableRow key={digitalId.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="py-2">
                            <Badge variant={getStatusBadgeVariant(digitalId.status)} className="text-xs">
                              {digitalId.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs py-2">
                            {new Date(digitalId.issuedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs py-2">
                            {digitalId.expiresAt
                              ? new Date(digitalId.expiresAt).toLocaleDateString()
                              : '-'}
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
    </div>
  );
}
