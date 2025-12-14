import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { getKabaleAdminApplicationsFn, reviewApplicationFn } from '@/server/kabales';

export const Route = createFileRoute('/admin/kabale/applications')({
  loader: async () => {
    // Load applications via server function (Kabale admin access enforced in server function)
    const result = await getKabaleAdminApplicationsFn();

    if (!result.success) {
      throw new Response(
        'error' in result ? result.error : 'Failed to load applications',
        { status: 500 }
      );
    }

    return { applications: result.applications };
  },
  component: KabaleApplicationsPage,
});

function KabaleApplicationsPage() {
  const { applications } = Route.useLoaderData();
  const router = useRouter();
  const reviewApplication = useServerFn(reviewApplicationFn);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<{
    id: string;
    action: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewClick = (id: string, action: 'APPROVE' | 'REJECT') => {
    setSelectedApplication({ id, action });
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApplication) return;

    setIsSubmitting(true);
    try {
      const result = await reviewApplication({
        data: {
          applicationId: selectedApplication.id,
          action: selectedApplication.action,
          notes: reviewNotes,
        },
      });

      if (result.success) {
        toast.success(
          `Application ${selectedApplication.action === 'APPROVE' ? 'approved' : 'rejected'} successfully`
        );
        setReviewDialogOpen(false);
        router.invalidate();
      } else {
        toast.error(result.error || 'Failed to review application');
      }
    } catch (error) {
      toast.error('An error occurred while reviewing the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING_VERIFICATION':
        return 'secondary';
      case 'SUBMITTED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ID Applications</h1>
        <p className="text-muted-foreground mt-2">
          Manage ID applications for your Kabale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            {applications.length} application{applications.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No applications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Digital ID</TableHead>
                  <TableHead>Verifications</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.citizenProfile.user.firstName || ''}{' '}
                      {application.citizenProfile.user.lastName || ''}
                    </TableCell>
                    <TableCell>
                      {application.citizenProfile.user.email || '-'}
                    </TableCell>
                    <TableCell>
                      {application.citizenProfile.phone ||
                        application.citizenProfile.user.phone ||
                        '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {application.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString()
                        : new Date(application.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {application.digitalId ? (
                        <Badge
                          variant={
                            application.digitalId.status === 'ACTIVE'
                              ? 'default'
                              : application.digitalId.status === 'REVOKED'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {application.digitalId.status}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{application._count.verificationLogs}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {(application.status === 'SUBMITTED' ||
                        application.status === 'PENDING_VERIFICATION') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleReviewClick(application.id, 'APPROVE')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReviewClick(application.id, 'REJECT')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" disabled>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedApplication?.action === 'APPROVE'
                ? 'Approve Application'
                : 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {selectedApplication?.action === 'APPROVE'
                ? 'Are you sure you want to approve this application? This will create an active Digital ID for the citizen.'
                : 'Are you sure you want to reject this application? Please provide a reason.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">
                {selectedApplication?.action === 'APPROVE'
                  ? 'Notes (Optional)'
                  : 'Reason for Rejection'}
              </Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  selectedApplication?.action === 'APPROVE'
                    ? 'Add any internal notes...'
                    : 'Please explain why this application is being rejected...'
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={
                selectedApplication?.action === 'APPROVE' ? 'default' : 'destructive'
              }
              onClick={handleSubmitReview}
              disabled={
                isSubmitting ||
                (selectedApplication?.action === 'REJECT' && !reviewNotes.trim())
              }
            >
              {isSubmitting
                ? 'Processing...'
                : selectedApplication?.action === 'APPROVE'
                  ? 'Approve Application'
                  : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
