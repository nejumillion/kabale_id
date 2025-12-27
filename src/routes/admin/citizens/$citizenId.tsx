import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCitizenByIdFn } from '@/server/system';

export const Route = createFileRoute('/admin/citizens/$citizenId')({
  loader: async ({ params }) => {
    const result = await getCitizenByIdFn({ data: { citizenId: params.citizenId } });
    if (!result.success) {
      throw new Response('Citizen not found', { status: 404 });
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/citizens">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {citizen.user.firstName} {citizen.user.lastName}
          </h1>
          <p className="text-muted-foreground mt-2">Citizen Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Citizen profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Full Name</div>
              <div className="text-lg font-medium">
                {citizen.user.firstName} {citizen.user.lastName}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-lg">{citizen.user.email || '-'}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="text-lg">{citizen.phone || citizen.user.phone || '-'}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Date of Birth</div>
              <div className="text-lg">
                {new Date(citizen.dateOfBirth).toLocaleDateString()}
              </div>
            </div>
            {citizen.gender && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground">Gender</div>
                  <div className="text-lg">{citizen.gender}</div>
                </div>
              </>
            )}
            {citizen.address && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="text-lg">{citizen.address}</div>
                </div>
              </>
            )}
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Profile Created</div>
              <div className="text-lg">
                {new Date(citizen.createdAt).toLocaleString()}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-lg">
                {new Date(citizen.updatedAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>User account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">User ID</div>
              <div className="text-lg font-mono text-sm">{citizen.user.id}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Account Created</div>
              <div className="text-lg">
                {new Date(citizen.user.createdAt).toLocaleString()}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Role</div>
              <div className="mt-1">
                <Badge variant="secondary">Citizen</Badge>
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">View User Account</div>
              <div className="mt-2">
                <Link to="/admin/users/$userId" params={{ userId: citizen.userId }}>
                  <Button variant="outline" size="sm">
                    View User
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Citizen activity metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Applications</div>
              <div className="text-lg font-medium">{citizen._count.idApplications}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Digital IDs Issued</div>
              <div className="text-lg font-medium">{citizen._count.digitalIds}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {citizen.idApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ID Applications</CardTitle>
            <CardDescription>
              All ID applications submitted by this citizen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kabale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Digital ID</TableHead>
                  <TableHead>Verifications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizen.idApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link
                        to="/admin/kabales/$kabaleId"
                        params={{ kabaleId: app.kabale.id }}
                        className="text-primary hover:underline"
                      >
                        {app.kabale.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(app.status)}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : new Date(app.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {app.digitalId ? (
                        <Badge
                          variant={getStatusBadgeVariant(app.digitalId.status)}
                        >
                          {app.digitalId.status}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{app._count.verificationLogs}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {citizen.digitalIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Digital IDs</CardTitle>
            <CardDescription>
              All digital identity cards issued to this citizen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kabale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizen.digitalIds.map((digitalId) => (
                  <TableRow key={digitalId.id}>
                    <TableCell>
                      <Link
                        to="/admin/kabales/$kabaleId"
                        params={{ kabaleId: digitalId.application.kabale.id }}
                        className="text-primary hover:underline"
                      >
                        {digitalId.application.kabale.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(digitalId.status)}>
                        {digitalId.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(digitalId.issuedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {digitalId.expiresAt
                        ? new Date(digitalId.expiresAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
