import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { 
	AlertCircle,
	Building2, 
	Calendar,
	CheckCircle2,
	Clock,
	CreditCard, 
	Download,
	FileText, 
	IdCard, 
	MapPin,
	Phone,
	Plus,
	User, 
	XCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { requireCitizen, requireCitizenProfile } from '@/server/auth-context'
import { getCitizenDashboardFn, downloadDigitalIdPdfFn } from '@/server/citizen'
import { toast } from 'sonner'

export const Route = createFileRoute('/citizen/')({
	beforeLoad: async () => {
		await requireCitizenProfile()
	},
	loader: async () => {
		const user = await requireCitizen()
	
		const result = await getCitizenDashboardFn()

		if (!result.success) {
			throw new Response(result.error || 'Failed to load dashboard data', {
				status: 404,
			})
		}

		return {
			user: user,
			profile: result.profile,
			applications: result.applications,
			digitalIds: result.digitalIds,
		}
	},
	component: CitizenDashboardPage,
})

function CitizenDashboardPage() {
	const { user, profile, applications, digitalIds } = Route.useLoaderData()
	const [downloadingId, setDownloadingId] = useState<string | null>(null)
	const downloadPdfFn = useServerFn(downloadDigitalIdPdfFn)

	const activeDigitalIds = digitalIds.filter(id => id.status === 'ACTIVE').length
	const pendingApplications = applications.filter(
		app => app.status === 'PENDING_VERIFICATION' || app.status === 'SUBMITTED'
	).length

	const handleDownloadPdf = async (digitalIdId: string) => {
		setDownloadingId(digitalIdId)
		try {
			const result = await downloadPdfFn({ data: { digitalIdId } })
			
			if (result.success && result.pdf && result.filename) {
				// Convert base64 to blob and download
				const byteCharacters = atob(result.pdf)
				const byteNumbers = new Array(byteCharacters.length)
				for (let i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters.charCodeAt(i)
				}
				const byteArray = new Uint8Array(byteNumbers)
				const blob = new Blob([byteArray], { type: 'application/pdf' })
				
				const url = URL.createObjectURL(blob)
				const link = document.createElement('a')
				link.href = url
				link.download = result.filename
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				URL.revokeObjectURL(url)
				
				toast.success('PDF downloaded successfully')
			} else {
				toast.error(result.error || 'Failed to download PDF')
			}
		} catch (error) {
			console.error('Download error:', error)
			toast.error('An error occurred while downloading the PDF')
		} finally {
			setDownloadingId(null)
		}
	}

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
			DRAFT: { label: 'Draft', variant: 'outline', icon: FileText },
			SUBMITTED: { label: 'Submitted', variant: 'secondary', icon: Clock },
			PENDING_VERIFICATION: { label: 'Pending Verification', variant: 'secondary', icon: AlertCircle },
			APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
			REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
			ACTIVE: { label: 'Active', variant: 'default', icon: CheckCircle2 },
			REVOKED: { label: 'Revoked', variant: 'destructive', icon: XCircle },
			EXPIRED: { label: 'Expired', variant: 'outline', icon: Clock },
		}

		const config = statusConfig[status] || { label: status, variant: 'outline' as const, icon: AlertCircle }
		const Icon = config.icon

		return (
			<Badge variant={config.variant} className="gap-1">
				<Icon className="h-3 w-3" />
				{config.label}
			</Badge>
		)
	}

	return (
		<div className="container mx-auto space-y-8 p-4 md:p-6 lg:p-8">
			{/* Header */}
			<div className="space-y-3">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<User className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
						<p className="text-muted-foreground mt-1">
							Welcome back, <span className="font-semibold text-foreground">{user.name}</span>. Here's an overview of your Digital ID status.
						</p>
					</div>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Digital IDs</CardTitle>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
							<IdCard className="h-5 w-5 text-primary" />
						</div>
					</CardHeader>
					<CardContent className="relative">
						<div className="text-3xl font-bold mb-1">{activeDigitalIds}</div>
						<p className="text-xs text-muted-foreground">
							{digitalIds.length} total digital ID{digitalIds.length !== 1 ? 's' : ''}
						</p>
					</CardContent>
				</Card>

				<Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
							<FileText className="h-5 w-5 text-primary" />
						</div>
					</CardHeader>
					<CardContent className="relative">
						<div className="text-3xl font-bold mb-1">{pendingApplications}</div>
						<p className="text-xs text-muted-foreground">
							{applications.length} total application{applications.length !== 1 ? 's' : ''}
						</p>
					</CardContent>
				</Card>

				<Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg md:col-span-2 lg:col-span-1">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Kabale</CardTitle>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
							<Building2 className="h-5 w-5 text-primary" />
						</div>
					</CardHeader>
					<CardContent className="relative">
						<div className="text-lg font-semibold">
							{applications[0]?.kabale.name || 'Not assigned'}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Profile Information */}
			<Card className="border-2">
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-3 text-xl">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<User className="h-5 w-5 text-primary" />
						</div>
						Profile Information
					</CardTitle>
					<CardDescription className="text-base">Your personal information</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-2 rounded-lg bg-muted/50 p-4">
							<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name</div>
							<div className="text-lg font-semibold">{user.name}</div>
						</div>
						{user.email && (
							<div className="space-y-2 rounded-lg bg-muted/50 p-4">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</div>
								<div className="text-lg">{user.email}</div>
							</div>
						)}
						{user.phone && (
							<div className="space-y-2 rounded-lg bg-muted/50 p-4">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
									<Phone className="h-3.5 w-3.5" />
									Phone
								</div>
								<div className="text-lg">{user.phone}</div>
							</div>
						)}
						{profile.address && (
							<div className="space-y-2 rounded-lg bg-muted/50 p-4 md:col-span-2">
								<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
									<MapPin className="h-3.5 w-3.5" />
									Address
								</div>
								<div className="text-lg">{profile.address}</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* ID Applications */}
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">ID Applications</h2>
						<p className="text-muted-foreground mt-1.5">
							Track the status of your Digital ID applications
						</p>
					</div>
					<div className="flex items-center gap-3">
						{applications.length > 0 && (
							<Link
								to="/citizen/applications"
								className="text-sm font-medium text-primary hover:underline transition-all"
							>
								View all →
							</Link>
						)}
						<Link to="/citizen/applications">
							<Button size="default" className="group">
								<Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
								Create Application
							</Button>
						</Link>
					</div>
				</div>

				{applications.length === 0 ? (
					<Card className="border-2 border-dashed">
						<Empty>
							<EmptyMedia variant="icon">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<FileText className="h-8 w-8 text-primary" />
								</div>
							</EmptyMedia>
							<EmptyHeader>
								<EmptyTitle className="text-xl">No applications yet</EmptyTitle>
								<EmptyDescription className="text-base">
									You haven't submitted any ID applications. Start by creating a new application.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</Card>
				) : (
					<div className="grid gap-4 sm:gap-6 md:grid-cols-2">
						{applications.slice(0, 4).map((application) => (
							<Card 
								key={application.id} 
								className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
								<CardHeader className="relative">
									<div className="flex items-start justify-between gap-4">
										<div className="space-y-2 flex-1">
											<CardTitle className="text-lg flex items-center gap-2">
												<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
													<Building2 className="h-4 w-4 text-primary" />
												</div>
												{application.kabale.name}
											</CardTitle>
											<CardDescription className="text-sm flex items-start gap-1.5">
												<MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
												{application.kabale.address}
											</CardDescription>
										</div>
										{getStatusBadge(application.status)}
									</div>
								</CardHeader>
								<CardContent className="relative space-y-4">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="h-4 w-4" />
										<span>
											Created: {new Date(application.createdAt).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											})}
										</span>
									</div>
									{application.submittedAt && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<CheckCircle2 className="h-4 w-4" />
											<span>
												Submitted: {new Date(application.submittedAt).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</span>
										</div>
									)}
									{application.digitalId && (
										<div className="pt-3 border-t">
											<div className="flex items-center gap-2 text-sm">
												<IdCard className="h-4 w-4 text-primary" />
												<span className="font-medium">Digital ID:</span>
												{getStatusBadge(application.digitalId.status)}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Digital IDs */}
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Digital IDs</h2>
					<p className="text-muted-foreground mt-1.5">
						Your issued Digital ID cards
					</p>
				</div>

				{digitalIds.length === 0 ? (
					<Card className="border-2 border-dashed">
						<Empty>
							<EmptyMedia variant="icon">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<CreditCard className="h-8 w-8 text-primary" />
								</div>
							</EmptyMedia>
							<EmptyHeader>
								<EmptyTitle className="text-xl">No Digital IDs yet</EmptyTitle>
								<EmptyDescription className="text-base">
									Once your application is approved, your Digital ID will appear here.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</Card>
				) : (
					<div className="grid gap-4 sm:gap-6 md:grid-cols-2">
						{digitalIds.map((digitalId) => (
							<Card 
								key={digitalId.id} 
								className={cn(
									"group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
									digitalId.status === 'ACTIVE' && "border-primary/50 hover:border-primary"
								)}
							>
								{digitalId.status === 'ACTIVE' && (
									<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
								)}
								<CardHeader className="relative">
									<div className="flex items-start justify-between gap-4">
										<CardTitle className="text-lg flex items-center gap-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
												<CreditCard className="h-4 w-4 text-primary" />
											</div>
											Digital ID Card
										</CardTitle>
										{getStatusBadge(digitalId.status)}
									</div>
									<CardDescription className="mt-2 flex items-center gap-1.5">
										<Building2 className="h-3.5 w-3.5" />
										Kabale: {digitalId.application.kabale.name}
									</CardDescription>
								</CardHeader>
								<CardContent className="relative space-y-4">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">Issued:</span>
										<span className="font-medium">
											{new Date(digitalId.issuedAt).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											})}
										</span>
									</div>
									{digitalId.expiresAt && (
										<div className="flex items-center gap-2 text-sm">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">Expires:</span>
											<span className="font-medium">
												{new Date(digitalId.expiresAt).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</span>
										</div>
									)}
									{digitalId.status === 'ACTIVE' && (
										<div className="pt-3 border-t">
											<Button
												variant="outline"
												size="default"
												className="w-full group/btn"
												onClick={() => handleDownloadPdf(digitalId.id)}
												disabled={downloadingId === digitalId.id}
											>
												<Download className="h-4 w-4 mr-2 transition-transform group-hover/btn:translate-y-0.5" />
												{downloadingId === digitalId.id ? 'Downloading...' : 'Download PDF'}
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
