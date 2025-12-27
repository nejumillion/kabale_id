import { createFileRoute, Link } from '@tanstack/react-router';
import { CreditCard, User, Mail, Phone, Building2, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { getAllDigitalIdsFn } from '@/server/system';

export const Route = createFileRoute('/admin/digital-ids/')({
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return CheckCircle2;
      case 'REVOKED':
        return XCircle;
      case 'EXPIRED':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Digital IDs</h1>
          <p className="text-muted-foreground mt-1.5">
            View all digital IDs across all Kabales
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            All Digital IDs
          </CardTitle>
          <CardDescription>
            {digitalIds.length} digital ID{digitalIds.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {digitalIds.length === 0 ? (
            <Card className="border-2 border-dashed">
              <Empty>
                <EmptyMedia variant="icon">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-xl">No digital IDs found</EmptyTitle>
                  <EmptyDescription className="text-base">
                    No digital IDs have been issued yet.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Citizen</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Kabale</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Issued</TableHead>
                    <TableHead className="font-semibold">Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {digitalIds.map((digitalId) => {
                    const StatusIcon = getStatusIcon(digitalId.status);
                    return (
                      <TableRow key={digitalId.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <Link
                            to="/admin/citizens/$citizenId"
                            params={{ citizenId: digitalId.citizen.id }}
                            className="flex items-center gap-2 text-primary hover:underline transition-colors"
                          >
                            <User className="h-4 w-4" />
                            {digitalId.citizen.user.firstName || ''}{' '}
                            {digitalId.citizen.user.lastName || ''}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            {digitalId.citizen.user.email || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            {digitalId.citizen.phone ||
                              digitalId.citizen.user.phone ||
                              '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/admin/kabales/$kabaleId"
                            params={{ kabaleId: digitalId.application.kabale.id }}
                            className="flex items-center gap-2 text-primary hover:underline font-medium transition-colors"
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            {digitalId.application.kabale.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(digitalId.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {digitalId.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(digitalId.issuedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            {digitalId.expiresAt
                              ? new Date(digitalId.expiresAt).toLocaleDateString()
                              : 'Never'}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
