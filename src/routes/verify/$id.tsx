import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { CheckCircle2, Clock, XCircle, Building2, Calendar, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyDigitalIdFn } from '@/server/system';

export const Route = createFileRoute('/verify/$id')({
  loader: async ({ params }) => {
    const result = await verifyDigitalIdFn({ data: { digitalIdId: params.id } });
    if (!result.success) {
      throw new Response(result.error || 'Digital ID not found', { status: 404 });
    }
    return { digitalId: result.digitalId };
  },
  component: VerifyPage,
});

function VerifyPage() {
  const { digitalId } = Route.useLoaderData();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
      ACTIVE: { label: 'Active', variant: 'default', icon: CheckCircle2 },
      REVOKED: { label: 'Revoked', variant: 'destructive', icon: XCircle },
      EXPIRED: { label: 'Expired', variant: 'outline', icon: Clock },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const, icon: CheckCircle2 };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const isActive = digitalId.status === 'ACTIVE';
  const isExpired = digitalId.expiresAt && new Date(digitalId.expiresAt) < new Date();
  const isValid = isActive && !isExpired;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Digital ID Verification</h1>
          <p className="text-muted-foreground">
            Verify the authenticity of a Residential ID Card
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Verification Result
              </CardTitle>
              {getStatusBadge(digitalId.status)}
            </div>
            <CardDescription>
              {isValid
                ? 'This Digital ID is valid and active'
                : digitalId.status === 'REVOKED'
                  ? 'This Digital ID has been revoked'
                  : isExpired
                    ? 'This Digital ID has expired'
                    : 'This Digital ID is not active'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${isValid ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <div className="flex items-center gap-2">
                {isValid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      Verified - This is a valid Digital ID card
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="font-semibold text-red-900 dark:text-red-100">
                      Not Valid - This Digital ID cannot be verified
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ID Card Information</CardTitle>
            <CardDescription>
              Public information from the Digital ID card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Citizen Name</div>
                <div className="text-base font-semibold">{digitalId.citizen.name || 'N/A'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">ID Number</div>
                <div className="text-base font-mono">{digitalId.id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Kabale
                </div>
                <div className="text-base">{digitalId.kabale.name}</div>
                {digitalId.kabale.address && (
                  <div className="text-sm text-muted-foreground">{digitalId.kabale.address}</div>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Issue Date
                </div>
                <div className="text-base">
                  {new Date(digitalId.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {digitalId.expiresAt && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expiry Date
                  </div>
                  <div className="text-base">
                    {new Date(digitalId.expiresAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div>{getStatusBadge(digitalId.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            This verification page confirms the authenticity of the Digital ID card.
            <br />
            For security reasons, only public information is displayed.
          </p>
        </div>
      </div>
    </div>
  );
}

