import { createFileRoute } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllDigitalIdsFn } from '@/server/system';

export const Route = createFileRoute('/admin/system/digital-ids/')({
  loader: async () => {
    const result = await getAllDigitalIdsFn();
    if (!result.success) {
      throw new Response('Failed to load digital IDs', { status: 500 });
    }
    return { digitalIds: result.digitalIds };
  },
  component: DigitalIdsPage,
});

function DigitalIdsPage() {
  const { digitalIds } = Route.useLoaderData();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'REVOKED':
        return 'destructive';
      case 'EXPIRED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Digital IDs</h1>
        <p className="text-muted-foreground mt-2">
          View all digital IDs across all Kabales
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Digital IDs</CardTitle>
          <CardDescription>
            {digitalIds.length} digital ID{digitalIds.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {digitalIds.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No digital IDs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Kabale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {digitalIds.map((digitalId) => (
                  <TableRow key={digitalId.id}>
                    <TableCell className="font-medium">
                      {digitalId.citizen.user.firstName || ''}{' '}
                      {digitalId.citizen.user.lastName || ''}
                    </TableCell>
                    <TableCell>
                      {digitalId.citizen.user.email || '-'}
                    </TableCell>
                    <TableCell>
                      {digitalId.citizen.phone ||
                        digitalId.citizen.user.phone ||
                        '-'}
                    </TableCell>
                    <TableCell>
                      {digitalId.application.kabale.name}
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
                        : 'Never'}
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
