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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { reviewApplicationFn } from '@/server/kabales';
import { getAllApplicationsFn } from '@/server/system';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/applications/')({
  loader: async () => {
    // Load applications via server function (Kabale admin access enforced in server function)
    const result = await getAllApplicationsFn();

    if (!result.success) {
      return { applications: [] };
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
        toast.success(`Application ${selectedApplication.action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ID Applications</h1>
          <p className="text-muted-foreground mt-1.5">Manage all ID applications across the system</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            All Applications
          </CardTitle>
          <CardDescription>
            {applications.length} application{applications.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <Card className="border-2 border-dashed">
              <Empty>
                <EmptyMedia variant="icon">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-xl">No applications found</EmptyTitle>
                  <EmptyDescription className="text-base">No ID applications have been submitted yet.</EmptyDescription>
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
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Submitted</TableHead>
                    <TableHead className="font-semibold">Digital ID</TableHead>
                    <TableHead className="font-semibold">Verifications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {application.citizenProfile.user.firstName || ''}{' '}
                          {application.citizenProfile.user.lastName || ''}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          {application.citizenProfile.user.email || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {application.citizenProfile.phone || application.citizenProfile.user.phone || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(application.status)}>
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {application.submittedAt
                            ? new Date(application.submittedAt).toLocaleDateString()
                            : new Date(application.createdAt).toLocaleDateString()}
                        </div>
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
                            <CreditCard className="h-3 w-3 mr-1" />
                            {application.digitalId.status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          {application._count.verificationLogs}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {selectedApplication?.action === 'APPROVE' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Approve Application
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  Reject Application
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedApplication?.action === 'APPROVE'
                ? 'Are you sure you want to approve this application? This will create an active Digital ID for the citizen.'
                : 'Are you sure you want to reject this application? Please provide a reason.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-base">
                {selectedApplication?.action === 'APPROVE' ? 'Notes (Optional)' : 'Reason for Rejection *'}
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
                className="min-h-[100px]"
              />
              {selectedApplication?.action === 'REJECT' && (
                <p className="text-xs text-muted-foreground">A reason is required when rejecting an application.</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setReviewNotes('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={selectedApplication?.action === 'APPROVE' ? 'default' : 'destructive'}
              onClick={handleSubmitReview}
              disabled={isSubmitting || (selectedApplication?.action === 'REJECT' && !reviewNotes.trim())}
              className="group"
            >
              {isSubmitting ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : selectedApplication?.action === 'APPROVE' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Application
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
