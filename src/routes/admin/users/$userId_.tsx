import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon, EditIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/users">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground mt-2">User Details</p>
          </div>
        </div>
        <Link to="/admin/users/$userId/edit" params={{ userId: user.id }}>
          <Button>
            <EditIcon className="size-4" />
            Edit User
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>User account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="text-lg font-medium">
                {user.firstName} {user.lastName}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-lg">{user.email || '-'}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="text-lg">{user.phone || '-'}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Role</div>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="text-lg">
                {new Date(user.createdAt).toLocaleString()}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-lg">
                {new Date(user.updatedAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {user.kabaleAdminProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Kabale Admin Profile</CardTitle>
              <CardDescription>Kabale assignment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Kabale</div>
                <div className="text-lg font-medium">
                  {user.kabaleAdminProfile.kabale.name}
                </div>
              </div>
              {user.kabaleAdminProfile.kabale.address && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div className="text-lg">
                      {user.kabaleAdminProfile.kabale.address}
                    </div>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Assigned</div>
                <div className="text-lg">
                  {new Date(user.kabaleAdminProfile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user.citizenProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Citizen Profile</CardTitle>
              <CardDescription>Citizen information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Date of Birth</div>
                <div className="text-lg">
                  {new Date(user.citizenProfile.dateOfBirth).toLocaleDateString()}
                </div>
              </div>
              {user.citizenProfile.gender && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Gender</div>
                    <div className="text-lg">{user.citizenProfile.gender}</div>
                  </div>
                </>
              )}
              {user.citizenProfile.address && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div className="text-lg">{user.citizenProfile.address}</div>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Profile Created</div>
                <div className="text-lg">
                  {new Date(user.citizenProfile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>User activity statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
              <div className="text-lg font-medium">{user._count.sessions}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Verification Logs</div>
              <div className="text-lg font-medium">{user._count.verificationLogs}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {user.citizenProfile && (
        <div className="grid gap-6 md:grid-cols-2">
          {user.citizenProfile.idApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest ID applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.citizenProfile.idApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <Badge variant="outline">{app.status.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {user.citizenProfile.digitalIds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Digital IDs</CardTitle>
                <CardDescription>Issued digital identity cards</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Issued</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.citizenProfile.digitalIds.map((id) => (
                      <TableRow key={id.id}>
                        <TableCell>
                          <Badge
                            variant={
                              id.status === 'ACTIVE'
                                ? 'default'
                                : id.status === 'REVOKED'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {id.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(id.issuedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
