import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Edit, Building2, MapPin, Calendar, Users, FileText, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const adminCount = 'admins' in kabale._count ? kabale._count.admins : kabale.admins.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/kabales">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{kabale.name}</h1>
              <p className="text-muted-foreground mt-1.5">Kabale Details</p>
            </div>
          </div>
        </div>
        <Link
          to="/admin/kabales/$kabaleId/edit"
          params={{ kabaleId: kabale.id }}
        >
          <Button className="group">
            <Edit className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
            Edit Kabale
          </Button>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Info & Administrators */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Basic Information
            </h2>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</div>
                    <div className="text-lg font-semibold">{kabale.name}</div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      Address
                    </div>
                    <div className="text-lg">{kabale.address || '-'}</div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Created
                    </div>
                    <div className="text-lg">
                      {new Date(kabale.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Last Updated
                    </div>
                    <div className="text-lg">
                      {new Date(kabale.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Administrators Section */}
          {kabale.admins.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Administrators
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({adminCount} {adminCount === 1 ? 'admin' : 'admins'})
                </span>
              </h2>
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kabale.admins.map((admin) => (
                          <TableRow key={admin.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">
                              <Link
                                to="/admin/users/$userId"
                                params={{ userId: admin.userId }}
                                className="text-primary hover:underline font-medium transition-colors"
                              >
                                {admin.user.firstName} {admin.user.lastName}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{admin.user.email || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{admin.user.phone || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Statistics
            </h2>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-2 border-primary/20">
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-2 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      Administrators
                    </div>
                    <div className="text-3xl font-bold text-primary">{adminCount}</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 border-2 border-secondary/20">
                    <div className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      ID Applications
                    </div>
                    <div className="text-3xl font-bold text-secondary-foreground">{kabale._count.idApplications}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
