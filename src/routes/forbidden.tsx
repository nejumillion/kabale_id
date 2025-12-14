import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon, HomeIcon, LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/forbidden')({
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <LockIcon className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-4xl font-bold">403</CardTitle>
          <CardDescription className="text-lg">Forbidden</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            You don't have permission to access this resource.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your system administrator.
          </p>
          <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-center">
            <Link to="/">
              <Button>
                <HomeIcon className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                window.history.back();
              }}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

