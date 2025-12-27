import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Users as UsersIcon, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllUsersFn } from '@/server/system';

export const Route = createFileRoute('/admin/users/')({
  loader: async () => {
    const result = await getAllUsersFn();
    return { users: result.users };
  },
  component: UsersListPage,
});

function UsersListPage() {
  const { users } = Route.useLoaderData();

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <UsersIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Users</h1>
            <p className="text-muted-foreground mt-1.5">
              Manage all system users
            </p>
          </div>
        </div>
        <Link to="/admin/users/create">
          <Button className="group">
            <Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
            Create User
          </Button>
        </Link>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            All Users
          </CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? 's' : ''} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <Card className="border-2 border-dashed">
              <Empty>
                <EmptyMedia variant="icon">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <UsersIcon className="h-8 w-8 text-primary" />
                  </div>
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-xl">No users found</EmptyTitle>
                  <EmptyDescription className="text-base">
                    Get started by creating the first user in the system.
                  </EmptyDescription>
                </EmptyHeader>
                <Link to="/admin/users/create">
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First User
                  </Button>
                </Link>
              </Empty>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Kabale</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: (typeof users)[0]) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.kabaleAdminProfile?.kabale ? (
                          <Link
                            to="/admin/kabales/$kabaleId"
                            params={{ kabaleId: user.kabaleAdminProfile.kabale.id }}
                            className="text-primary hover:underline font-medium transition-colors"
                          >
                            {user.kabaleAdminProfile.kabale.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to="/admin/users/$userId" params={{ userId: user.id }}>
                          <Button variant="ghost" size="sm" className="group">
                            <Eye className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
