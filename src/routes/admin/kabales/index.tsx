import { createFileRoute, Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllKabalesFn } from '@/server/kabales';

export const Route = createFileRoute('/admin/kabales/')({
  loader: async () => {
    // Load all Kabales via server function (system admin access enforced in server function)
    const result = await getAllKabalesFn();

    return { kabales: result.kabales };
  },
  component: SystemKabalesPage,
});

function SystemKabalesPage() {
  const { kabales } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kabales</h1>
          <p className="text-muted-foreground mt-2">
            Manage administrative units
          </p>
        </div>
        <Link to="/admin/kabales/create">
          <Button>
            <PlusIcon className="size-4" />
            Create Kabale
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Kabales</CardTitle>
          <CardDescription>
            {kabales.length} Kabale{kabales.length !== 1 ? 's' : ''} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kabales.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No Kabales found</p>
              <Link to="/admin/kabales/create">
                <Button variant="outline" className="mt-4">
                  Create First Kabale
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Admins</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kabales.map((kabale: (typeof kabales)[0]) => (
                  <TableRow key={kabale.id}>
                    <TableCell className="font-medium">{kabale.name}</TableCell>
                    <TableCell>{kabale.address || '-'}</TableCell>
                    <TableCell>{kabale._count.admins}</TableCell>
                    <TableCell>{kabale._count.idApplications}</TableCell>
                    <TableCell className="text-right">
                      <Link to="/admin/kabales/$kabaleId" params={{ kabaleId: kabale.id }}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
