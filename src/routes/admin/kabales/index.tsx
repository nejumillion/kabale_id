import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Building2, Eye } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kabales</h1>
            <p className="text-muted-foreground mt-1.5">
              Manage administrative units
            </p>
          </div>
        </div>
        <Link to="/admin/kabales/create">
          <Button className="group">
            <Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
            Create Kabale
          </Button>
        </Link>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            All Kabales
          </CardTitle>
          <CardDescription>
            {kabales.length} Kabale{kabales.length !== 1 ? 's' : ''} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kabales.length === 0 ? (
            <Card className="border-2 border-dashed">
              <Empty>
                <EmptyMedia variant="icon">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-xl">No Kabales found</EmptyTitle>
                  <EmptyDescription className="text-base">
                    Get started by creating the first Kabale in the system.
                  </EmptyDescription>
                </EmptyHeader>
                <Link to="/admin/kabales/create">
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Kabale
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
                    <TableHead className="font-semibold">Address</TableHead>
                    <TableHead className="font-semibold">Admins</TableHead>
                    <TableHead className="font-semibold">Applications</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kabales.map((kabale: (typeof kabales)[0]) => (
                    <TableRow key={kabale.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{kabale.name}</TableCell>
                      <TableCell className="text-muted-foreground">{kabale.address || '-'}</TableCell>
                      <TableCell>{kabale._count.admins}</TableCell>
                      <TableCell>{kabale._count.idApplications}</TableCell>
                      <TableCell className="text-right">
                        <Link to="/admin/kabales/$kabaleId" params={{ kabaleId: kabale.id }}>
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
