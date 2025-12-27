import { createFileRoute, Link } from '@tanstack/react-router';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Citizens</h1>
        <p className="text-muted-foreground mt-2">
          View all registered citizens
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Citizens</CardTitle>
          <CardDescription>
            {citizens.length} citizen{citizens.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {citizens.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No citizens found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Digital IDs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens.map((citizen: (typeof citizens)[0]) => (
                  <TableRow key={citizen.id}>
                    <TableCell className="font-medium">
                      {citizen.user.firstName} {citizen.user.lastName}
                    </TableCell>
                    <TableCell>{citizen.user.email || '-'}</TableCell>
                    <TableCell>{citizen.phone || citizen.user.phone || '-'}</TableCell>
                    <TableCell>
                      {new Date(citizen.dateOfBirth).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{citizen.gender || '-'}</TableCell>
                    <TableCell>{citizen._count.idApplications}</TableCell>
                    <TableCell>{citizen._count.digitalIds}</TableCell>
                    <TableCell className="text-right">
                      <Link to="/admin/citizens/$citizenId" params={{ citizenId: citizen.id }}>
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
