import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
	AlertCircle,
	ArrowLeft,
	Building2,
	Calendar,
	CheckCircle2,
	Clock,
	Edit,
	FileText,
	IdCard,
	MapPin,
	Phone,
	Plus,
	Send,
	XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { type IdApplicationFormValues, idApplicationSchema } from '@/lib/validation'
import { zodV4Resolver } from '@/lib/zodV4Resolver'
import { requireCitizenProfile } from '@/server/auth-context'
import { createIdApplicationFn, getCitizenApplicationsFn, submitIdApplicationFn, updateIdApplicationFn } from '@/server/citizen'
import { getAvailableKabalesFn } from '@/server/kabales'

export const Route = createFileRoute('/citizen/applications')({
	beforeLoad: async () => {
		await requireCitizenProfile()
	},
	loader: async () => {
		const result = await getCitizenApplicationsFn()

		if (!result.success) {
			throw new Response(result.error || 'Failed to load applications', {
				status: 404,
			})
		}

		return { applications: result.applications }
	},
	component: CitizenApplicationsPage,
})

function CitizenApplicationsPage() {
	const { applications } = Route.useLoaderData()
	const navigate = useNavigate()
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [editingApplication, setEditingApplication] = useState<string | null>(null)
	const [submittingApplication, setSubmittingApplication] = useState<string | null>(null)
			const [kabales, setKabales] = useState<Array<{ id: string; name: string; address: string | null }>>([])
	const [loadingKabales, setLoadingKabales] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const createApplicationMutation = useServerFn(createIdApplicationFn)
	const updateApplicationMutation = useServerFn(updateIdApplicationFn)
	const submitApplicationMutation = useServerFn(submitIdApplicationFn)

	const form = useForm<IdApplicationFormValues>({
		resolver: zodV4Resolver(idApplicationSchema),
		defaultValues: {
			kabaleId: '',
		},
	})

	// Load Kabales when dialog opens
	useEffect(() => {
		if (isCreateDialogOpen || editingApplication) {
			loadKabales()
		}
	}, [isCreateDialogOpen, editingApplication])

	const loadKabales = async () => {
		setLoadingKabales(true)
		try {
			const result = await getAvailableKabalesFn()
			if (result.success) {
				setKabales(result.kabales)
			}
		} catch (err) {
			console.error('Failed to load Kabales:', err)
		} finally {
			setLoadingKabales(false)
		}
	}

	const handleCreate = async (data: IdApplicationFormValues) => {
		setError(null)
		setSuccess(null)

		try {
			const result = await createApplicationMutation({ data })

			if (result.success) {
				setSuccess('Application created successfully')
				setIsCreateDialogOpen(false)
				form.reset()
				// Reload page data
				navigate({ to: '/citizen/applications', replace: true })
			} else {
				setError(result.error || 'Failed to create application')
			}
		} catch (err) {
			setError('An error occurred. Please try again.')
			console.error('Create application error:', err)
		}
	}

	const handleEdit = async (data: IdApplicationFormValues) => {
		if (!editingApplication) return

		setError(null)
		setSuccess(null)

		try {
			const result = await updateApplicationMutation({
				data: {
					applicationId: editingApplication,
					kabaleId: data.kabaleId,
				},
			})

			if (result.success) {
				setSuccess('Application updated successfully')
				setEditingApplication(null)
				form.reset()
				// Reload page data
				navigate({ to: '/citizen/applications', replace: true })
			} else {
				setError(result.error || 'Failed to update application')
			}
		} catch (err) {
			setError('An error occurred. Please try again.')
			console.error('Update application error:', err)
		}
	}

	const handleSubmitApplication = async (applicationId: string) => {
		setError(null)
		setSuccess(null)
		setSubmittingApplication(applicationId)

		try {
			const result = await submitApplicationMutation({ data: { applicationId } })

			if (result.success) {
				setSuccess('Application submitted successfully')
				setSubmittingApplication(null)
				// Reload page data
				navigate({ to: '/citizen/applications', replace: true })
			} else {
				setError(result.error || 'Failed to submit application')
				setSubmittingApplication(null)
			}
		} catch (err) {
			setError('An error occurred. Please try again.')
			setSubmittingApplication(null)
			console.error('Submit application error:', err)
		}
	}

	const openEditDialog = (application: typeof applications[0]) => {
		if (application.status !== 'DRAFT') return
		setEditingApplication(application.id)
		form.reset({ kabaleId: application.kabaleId })
	}

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
			DRAFT: { label: 'Draft', variant: 'outline', icon: FileText },
			SUBMITTED: { label: 'Submitted', variant: 'secondary', icon: Clock },
			PENDING_VERIFICATION: { label: 'Pending Verification', variant: 'secondary', icon: AlertCircle },
			APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
			REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
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

	const selectedKabale = kabales.find(k => k.id === form.watch('kabaleId'))

	return (
		<div className="container mx-auto space-y-8 p-4 md:p-6 lg:p-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className='flex gap-2 items-center justify-center'>
					<Link to="/citizen">
					<Button variant="outline" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
					</Link>
				<div>
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My Applications</h1>
					<p className="text-muted-foreground mt-1.5">
						Manage your Digital ID applications
					</p>
				</div>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="group">
							<Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
							Create Application
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle className="text-2xl">Create New Application</DialogTitle>
							<DialogDescription className="text-base">
								Select a Kabale office where you will complete your in-person verification.
							</DialogDescription>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleCreate)} className="space-y-6">
								{error && (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}
								<FormField
									control={form.control}
									name="kabaleId"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">Kabale *</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
												disabled={loadingKabales}
											>
												<FormControl>
													<SelectTrigger className="h-11">
														<SelectValue
															placeholder={
																loadingKabales
																	? 'Loading Kabales...'
																	: 'Select a Kabale'
															}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{kabales.map((kabale) => (
														<SelectItem key={kabale.id} value={kabale.id}>
															{kabale.name} ({kabale.address})
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								{selectedKabale && (
									<Card className="border-2 bg-muted/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-base flex items-center gap-2">
												<Building2 className="h-4 w-4 text-primary" />
												Kabale Information
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2 text-sm">
											{selectedKabale.address && (
												<div className="flex items-start gap-2">
													<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
													<span className="text-muted-foreground">{selectedKabale.address}</span>
												</div>
											)}
											
										</CardContent>
									</Card>
								)}
								<DialogFooter className="gap-2 sm:gap-0">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setIsCreateDialogOpen(false)
											form.reset()
											setError(null)
										}}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={loadingKabales} className="group">
										Create Application
										<Plus className="h-4 w-4 ml-2 transition-transform group-hover:rotate-90" />
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Success/Error Messages */}
			{success && (
				<Alert className="border-2 border-primary/20 bg-primary/5">
					<CheckCircle2 className="h-4 w-4 text-primary" />
					<AlertDescription className="font-medium">{success}</AlertDescription>
				</Alert>
			)}
			{error && !isCreateDialogOpen && !editingApplication && (
				<Alert variant="destructive" className="border-2">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="font-medium">{error}</AlertDescription>
				</Alert>
			)}

			{/* Applications List */}
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
								You haven't created any ID applications. Start by creating a new application.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</Card>
			) : (
				<div className="grid gap-4 sm:gap-6 md:grid-cols-2">
					{applications.map((application) => (
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
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2 text-muted-foreground">
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
										<div className="flex items-center gap-2 text-muted-foreground">
											<Send className="h-4 w-4" />
											<span>
												Submitted: {new Date(application.submittedAt).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</span>
										</div>
									)}
								</div>

								{application.digitalId && (
									<div className="pt-3 border-t">
										<div className="flex items-center gap-2 text-sm">
											<IdCard className="h-4 w-4 text-primary" />
											<span className="font-medium">Digital ID:</span>
											<Badge variant={application.digitalId.status === 'ACTIVE' ? 'default' : 'outline'}>
												{application.digitalId.status}
											</Badge>
										</div>
									</div>
								)}

								{application.verificationLogs.length > 0 && (
									<div className="pt-3 border-t">
										<h4 className="mb-3 text-sm font-semibold">Recent Verifications</h4>
										<div className="space-y-3">
											{application.verificationLogs.map((log) => (
												<div key={log.id} className="rounded-lg bg-muted/50 p-3 text-sm">
													<div className="flex items-center gap-2 mb-2">
														<Badge variant={log.result === 'APPROVED' ? 'default' : 'destructive'} className="text-xs">
															{log.result}
														</Badge>
														<span className="text-muted-foreground text-xs">
															by {log.verifier.email}
														</span>
													</div>
													<div className="text-muted-foreground text-xs">
														{new Date(log.verifiedAt).toLocaleDateString('en-US', {
															year: 'numeric',
															month: 'long',
															day: 'numeric',
														})}
													</div>
													{log.notes && (
														<p className="text-muted-foreground text-xs mt-2 italic">
															Note: {log.notes}
														</p>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{application.status === 'DRAFT' && (
									<div className="pt-4 border-t flex flex-col gap-3 sm:flex-row">
										<Dialog open={editingApplication === application.id} onOpenChange={(open) => {
											if (!open) {
												setEditingApplication(null)
												form.reset()
												setError(null)
											}
										}}>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="default"
													className="flex-1 group/btn"
													onClick={() => openEditDialog(application)}
												>
													<Edit className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
													Edit
												</Button>
											</DialogTrigger>
											<DialogContent className="sm:max-w-[500px]">
												<DialogHeader>
													<DialogTitle className="text-2xl">Edit Application</DialogTitle>
													<DialogDescription className="text-base">
														Update the Kabale selection for this application.
													</DialogDescription>
												</DialogHeader>
												<Form {...form}>
													<form onSubmit={form.handleSubmit(handleEdit)} className="space-y-6">
														{error && (
															<Alert variant="destructive">
																<AlertCircle className="h-4 w-4" />
																<AlertDescription>{error}</AlertDescription>
															</Alert>
														)}
														<FormField
															control={form.control}
															name="kabaleId"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-base">Kabale *</FormLabel>
																	<Select
																		onValueChange={field.onChange}
																		defaultValue={field.value}
																		disabled={loadingKabales}
																	>
																		<FormControl>
																			<SelectTrigger className="h-11">
																				<SelectValue placeholder="Select a Kabale" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{kabales.map((kabale) => (
																				<SelectItem key={kabale.id} value={kabale.id}>
																					{kabale.name} ({kabale.address})
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
														{selectedKabale && (
															<Card className="border-2 bg-muted/50">
																<CardHeader className="pb-3">
																	<CardTitle className="text-base flex items-center gap-2">
																		<Building2 className="h-4 w-4 text-primary" />
																		Kabale Information
																	</CardTitle>
																</CardHeader>
																<CardContent className="space-y-2 text-sm">
																	{selectedKabale.address && (
																		<div className="flex items-start gap-2">
																			<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
																			<span className="text-muted-foreground">{selectedKabale.address}</span>
																		</div>
																	)}
																</CardContent>
															</Card>
														)}
														<DialogFooter className="gap-2 sm:gap-0">
															<Button
																type="button"
																variant="outline"
																onClick={() => {
																	setEditingApplication(null)
																	form.reset()
																	setError(null)
																}}
															>
																Cancel
															</Button>
															<Button type="submit" disabled={loadingKabales} className="group">
																Save Changes
																<CheckCircle2 className="h-4 w-4 ml-2" />
															</Button>
														</DialogFooter>
													</form>
												</Form>
											</DialogContent>
										</Dialog>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="default"
													size="default"
													className="flex-1 group/btn"
													disabled={submittingApplication === application.id}
												>
													{submittingApplication === application.id ? (
														<>
															<Clock className="h-4 w-4 mr-2 animate-spin" />
															Submitting...
														</>
													) : (
														<>
															<Send className="h-4 w-4 mr-2 transition-transform group-hover/btn:translate-x-0.5" />
															Submit
														</>
													)}
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle className="text-xl">Submit Application?</AlertDialogTitle>
													<AlertDialogDescription className="text-base">
														Are you sure you want to submit this application? Once submitted, you won't be able to edit it.
														You will need to visit the Kabale office for in-person verification.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter className="gap-2 sm:gap-0">
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction onClick={() => handleSubmitApplication(application.id)} className="group">
														Submit Application
														<Send className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}
