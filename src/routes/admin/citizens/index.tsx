import { createFileRoute, Link } from '@tanstack/react-router';
import { UserCheck, Eye } from 'lucide-react';
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
import { getAllCitizensFn } from '@/server/system';

export const Route = createFileRoute('/admin/citizens/')({
  loader: async () => {
    const result = await getAllCitizensFn();
    return { citizens: result.citizens };
  },
  component: CitizensListPage,
});

function CitizensListPage() {
  const { citizens } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <UserCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Citizens</h1>
          <p className="text-muted-foreground mt-1.5">
            View all registered citizens
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            All Citizens
          </CardTitle>
          <CardDescription>
            {citizens.length} citizen{citizens.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {citizens.length === 0 ? (
            <Card className="border-2 border-dashed">
              <Empty>
                <EmptyMedia variant="icon">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <UserCheck className="h-8 w-8 text-primary" />
                  </div>
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-xl">No citizens found</EmptyTitle>
                  <EmptyDescription className="text-base">
                    No citizens have registered yet.
                  </EmptyDescription>
                </EmptyHeader>
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
                    <TableHead className="font-semibold">Date of Birth</TableHead>
                    <TableHead className="font-semibold">Gender</TableHead>
                    <TableHead className="font-semibold">Applications</TableHead>
                    <TableHead className="font-semibold">Digital IDs</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citizens.map((citizen: (typeof citizens)[0]) => (
                    <TableRow key={citizen.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        {citizen.user.firstName} {citizen.user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{citizen.user.email || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{citizen.phone || citizen.user.phone || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(citizen.dateOfBirth).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{citizen.gender || '-'}</TableCell>
                      <TableCell>{citizen._count.idApplications}</TableCell>
                      <TableCell>{citizen._count.digitalIds}</TableCell>
                      <TableCell className="text-right">
                        <Link to="/admin/citizens/$citizenId" params={{ citizenId: citizen.id }}>
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
