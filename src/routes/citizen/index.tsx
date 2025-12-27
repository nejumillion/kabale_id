import { createFileRoute, Link } from '@tanstack/react-router'
import { 
	AlertCircle,
	Building2, 
	Calendar,
	CheckCircle2,
	Clock,
	CreditCard, 
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
import { getCitizenDashboardFn } from '@/server/citizen'

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

	const activeDigitalIds = digitalIds.filter(id => id.status === 'ACTIVE').length
	const pendingApplications = applications.filter(
		app => app.status === 'PENDING_VERIFICATION' || app.status === 'SUBMITTED'
	).length

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
		<div className="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back, {user.name}. Here's an overview of your Digital ID status.
				</p>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Digital IDs</CardTitle>
						<IdCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeDigitalIds}</div>
						<p className="text-xs text-muted-foreground">
							{digitalIds.length} total digital ID{digitalIds.length !== 1 ? 's' : ''}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pendingApplications}</div>
						<p className="text-xs text-muted-foreground">
							{applications.length} total application{applications.length !== 1 ? 's' : ''}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Kabale</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-sm font-medium">
							{applications[0]?.kabale.name || 'Not assigned'}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Profile Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Profile Information
					</CardTitle>
					<CardDescription>Your personal information</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<div className="text-sm font-medium text-muted-foreground">Full Name</div>
							<div className="text-base font-semibold">{user.name}</div>
						</div>
						{user.email && (
							<div className="space-y-1">
								<div className="text-sm font-medium text-muted-foreground">Email</div>
								<div className="text-base">{user.email}</div>
							</div>
						)}
						{user.phone && (
							<div className="space-y-1">
								<div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
									<Phone className="h-3 w-3" />
									Phone
								</div>
								<div className="text-base">{user.phone}</div>
							</div>
						)}
						{profile.address && (
							<div className="space-y-1 md:col-span-2">
								<div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
									<MapPin className="h-3 w-3" />
									Address
								</div>
								<div className="text-base">{profile.address}</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* ID Applications */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">ID Applications</h2>
						<p className="text-muted-foreground text-sm">
							Track the status of your Digital ID applications
						</p>
					</div>
					<div className="flex items-center gap-2">
						{applications.length > 0 && (
							<Link
								to="/citizen/applications"
								className="text-sm text-primary hover:underline"
							>
								View all →
							</Link>
						)}
						<Link to="/citizen/applications">
							<Button size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Create Application
							</Button>
						</Link>
					</div>
				</div>

				{applications.length === 0 ? (
					<Card>
						<Empty>
							<EmptyMedia variant="icon">
								<FileText className="h-6 w-6" />
							</EmptyMedia>
							<EmptyHeader>
								<EmptyTitle>No applications yet</EmptyTitle>
								<EmptyDescription>
									You haven't submitted any ID applications. Start by creating a new application.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{applications.slice(0, 4).map((application) => (
							<Card key={application.id} className="hover:shadow-md transition-shadow">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<CardTitle className="text-base flex items-center gap-2">
												<Building2 className="h-4 w-4 text-muted-foreground" />
												{application.kabale.name}
											</CardTitle>
											<CardDescription className="text-xs">
												Address: {application.kabale.address}
											</CardDescription>
										</div>
										{getStatusBadge(application.status)}
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
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
										<div className="pt-2 border-t">
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
			<div className="space-y-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Digital IDs</h2>
					<p className="text-muted-foreground text-sm">
						Your issued Digital ID cards
					</p>
				</div>

				{digitalIds.length === 0 ? (
					<Card>
						<Empty>
							<EmptyMedia variant="icon">
								<CreditCard className="h-6 w-6" />
							</EmptyMedia>
							<EmptyHeader>
								<EmptyTitle>No Digital IDs yet</EmptyTitle>
								<EmptyDescription>
									Once your application is approved, your Digital ID will appear here.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{digitalIds.map((digitalId) => (
							<Card 
								key={digitalId.id} 
								className={cn(
									"hover:shadow-md transition-shadow",
									digitalId.status === 'ACTIVE' && "border-primary/50"
								)}
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<CardTitle className="text-base flex items-center gap-2">
											<CreditCard className="h-4 w-4 text-primary" />
											Digital ID Card
										</CardTitle>
										{getStatusBadge(digitalId.status)}
									</div>
									<CardDescription>
										Kabale: {digitalId.application.kabale.name}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
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
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
