import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { Building2, CheckCircle, FileText, Lock, Shield, User } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/server/auth-context';

export const Route = createFileRoute('/')({
  loader: async () => {
    const user = await getCurrentUser();
    
    // Redirect logged-in users to their role-specific dashboards
    if (user) {
      if (user.role === 'SYSTEM_ADMIN') {
        throw redirect({ to: '/admin' });
      }
      if (user.role === 'KABALE_ADMIN') {
        throw redirect({ to: '/kabale' });
      }
      if (user.role === 'CITIZEN') {
        // Check if citizen has a profile
        if (user.citizenProfile) {
          throw redirect({ to: '/citizen' });
        } else {
          throw redirect({ 
            to: '/register-profile',
            search: { userId: user.id }
          });
        }
      }
    }
    
    return {};
  },
  component: LandingPage,
});

function LandingPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/50 py-16">
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 font-bold text-4xl tracking-tight">Your Digital Identity, Secured</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                The Kabale Digital ID system provides citizens with a secure, verifiable digital identity card. Register
                online, complete your profile, and receive your official Digital ID after in-person verification at your
                selected Kabale office.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/register">
                    <User className="mr-2 h-5 w-5" />
                    Register as Citizen
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">
                    <Lock className="mr-2 h-5 w-5" />
                    Login to Your Account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="mb-12 text-center">
              <h3 className="mb-4 font-semibold text-3xl">How It Works</h3>
              <p className="text-muted-foreground">Simple steps to get your Digital ID card</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>1. Register Online</CardTitle>
                  <CardDescription>
                    Create your account and complete your personal profile with accurate information.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>2. Select Your Kabale</CardTitle>
                  <CardDescription>
                    Choose the Kabale office where you will complete your in-person verification and receive your
                    Digital ID.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>3. Verify & Receive</CardTitle>
                  <CardDescription>
                    Visit your selected Kabale office for identity verification. Once approved, your Digital ID will be
                    issued.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted/50 py-16">
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="mb-12 text-center">
              <h3 className="mb-4 font-semibold text-3xl">Benefits</h3>
              <p className="text-muted-foreground">Why choose the Kabale Digital ID system</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Secure & Verified</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your identity is verified through in-person authentication at official Kabale offices, ensuring the
                    highest level of security.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Official Documentation</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Receive an official Digital ID card recognized by the city authority, with complete audit trails and
                    verification records.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Lock className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Privacy Protected</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your personal information is protected with industry-standard security measures and role-based
                    access controls.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="w-full max-w-7xl mx-auto px-4">
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                <CardDescription>
                  Join thousands of citizens who have already received their Digital ID cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/register">
                    <User className="mr-2 h-5 w-5" />
                    Register as Citizen
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Login to Your Account</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
