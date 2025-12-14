import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodV4Resolver } from '@/lib/zodV4Resolver'
import { requireUnauth } from '@/server/auth-context'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../components/ui/form'
import { Input } from '../components/ui/input'
import { loginFn } from '../server/auth'

const loginSchema = z.object({
	identifier: z.string().min(1, 'Email or phone is required'),
	password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({
	beforeLoad: async () => {
		await requireUnauth();
	},
	component: LoginPage,
})

function LoginPage() {
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const loginMutation = useServerFn(loginFn);

	const form = useForm<LoginFormValues>({
		resolver: zodV4Resolver(loginSchema),
		defaultValues: {
			identifier: '',
			password: '',
		},
	})

	const onSubmit = async (data: LoginFormValues) => {
		setError(null)
		setIsLoading(true)

		try {
			const result = await loginMutation({ data })
			if (!result?.success) {
				setError(result?.error || 'Login failed')
			} else {
				navigate({ to: '/' })
			}
		} catch (err: any) {
			setError('An error occurred during login. Please try again.')
			console.error('Login error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>
						Enter your email or phone number and password to access your
						account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<FormField
								control={form.control}
								name="identifier"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email or Phone</FormLabel>
										<FormControl>
											<Input
												type="text"
												placeholder="email@example.com or +1234567890"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter your password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Logging in...' : 'Login'}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}

