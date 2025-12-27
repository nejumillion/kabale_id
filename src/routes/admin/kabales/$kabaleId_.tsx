import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon, EditIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getKabaleByIdFn } from '@/server/kabales';

export const Route = createFileRoute('/admin/kabales/$kabaleId_')({
  loader: async ({ params }) => {
    const result = await getKabaleByIdFn({ data: { kabaleId: params.kabaleId } });
    if (!result.success) {
      throw new Response('Kabale not found', { status: 404 });
    }
    return { kabale: result.kabale };
  },
  component: KabaleDetailsPage,
});

function KabaleDetailsPage() {
  const { kabale } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link to="/admin/kabales">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{kabale.name}</h1>
            <p className="text-muted-foreground mt-2">Kabale Details</p>
          </div>
        </div>
        <Link
          to="/admin/kabales/$kabaleId/edit"
          params={{ kabaleId: kabale.id }}
        >
          <Button>
            <EditIcon className="size-4" />
            Edit Kabale
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Kabale details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="text-lg font-medium">{kabale.name}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="text-lg">{kabale.address}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="text-lg">
                {new Date(kabale.createdAt).toLocaleString()}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-lg">
                {new Date(kabale.updatedAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Kabale activity metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Administrators</div>
              <div className="text-lg font-medium">
                {'admins' in kabale._count ? kabale._count.admins : kabale.admins.length}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">ID Applications</div>
              <div className="text-lg font-medium">{kabale._count.idApplications}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {kabale.admins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>
              Users assigned as administrators for this Kabale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kabale.admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/admin/users/$userId"
                        params={{ userId: admin.userId }}
                        className="text-primary hover:underline"
                      >
                        {admin.user.email || admin.user.phone || 'N/A'}
                      </Link>
                    </TableCell>
                    <TableCell>{admin.user.email || '-'}</TableCell>
                    <TableCell>{admin.user.phone || '-'}</TableCell>
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
