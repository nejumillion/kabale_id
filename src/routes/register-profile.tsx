import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'
import { type ProfileFormValues, profileSchema } from '@/lib/validation'
import { zodV4Resolver } from '@/lib/zodV4Resolver'
import { getCurrentUser } from '@/server/auth-context'
import { createCitizenProfileFn } from '@/server/citizen'
import { getAvailableKabalesFn } from '@/server/kabales'

export const Route = createFileRoute('/register-profile')({
	validateSearch: (search: Record<string, unknown>) => {
		return {
			userId: (search.userId as string) || '',
		}
	},
	beforeLoad: async () => {
		const user = await getCurrentUser()
		
		// Only allow citizens to access this route
		if (!user || user.role !== 'CITIZEN') {
			throw redirect({ to: '/login' })
		}
		
		// If citizen already has a profile, redirect to dashboard
		if (user.citizenProfile) {
			throw redirect({ to: '/citizen' })
		}
	},
	component: ProfilePage,
})

function ProfilePage() {
	const { user } = useAuth()
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [kabales, setKabales] = useState<
		Array<{ id: string; name: string; code: string }>
	>([])
	const [loadingKabales, setLoadingKabales] = useState(true)
	const createCitizenProfileMutation = useServerFn(createCitizenProfileFn);

	// Load available Kabales
	useEffect(() => {
		async function loadKabales() {
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

		loadKabales()
	}, [])


	const form = useForm<ProfileFormValues>({
		resolver: zodV4Resolver(profileSchema),
		defaultValues: {
			dateOfBirth: undefined,
			gender: '',
			phone: '',
			address: '',
			kabaleId: '',
		},
	})

	const onSubmit = async (data: ProfileFormValues) => {
		if (!user?.id) {
			setError('User ID is missing. Please start registration again.')
			return
		}

		setError(null)
		setIsLoading(true)

		try {
			const result = await createCitizenProfileMutation({
				data: { ...data, userId: user.id },
			})

			if (result.success) {
				// Redirect to login or citizen dashboard
				navigate({ to: '/citizen' })
			} else {
				setError(result.error || 'Profile creation failed')
			}
		} catch (err) {
			setError('An error occurred during profile creation. Please try again.')
			console.error('Profile creation error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	if (!user?.id) {
		return null
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle>Complete Your Profile</CardTitle>
					<CardDescription>
						Please provide your personal information and select your Kabale
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}


							<FormField
								control={form.control}
								name='dateOfBirth'
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Date of Birth *</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant='outline'
														className={cn(
															'w-full pl-3 text-left font-normal',
															!field.value && 'text-muted-foreground',
														)}
													>
														{field.value ? (
															format(field.value, 'PPP')
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode='single'
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() || date < new Date('1900-01-01')
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='kabaleId'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Kabale *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											disabled={loadingKabales}
										>
											<FormControl>
												<SelectTrigger>
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
														{kabale.name} ({kabale.code})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='gender'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Gender (Optional)</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select gender" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='phone'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone (Optional)</FormLabel>
										<FormControl>
											<Input
												type='tel'
												placeholder='+1234567890'
												{...field}
												value={field.value || ''}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='address'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address (Optional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Enter your address'
												{...field}
												value={field.value || ''}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex gap-4">
								<Button
									type='button'
									variant='outline'
									onClick={() => navigate({ to: '/register' })}
									disabled={isLoading}
								>
									Back
								</Button>
								<Button type="submit" className="flex-1" disabled={isLoading}>
									{isLoading ? 'Creating profile...' : 'Complete Registration'}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
