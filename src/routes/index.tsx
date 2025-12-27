import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { ArrowRight, Building2, CheckCircle, FileText, Lock, Shield, User, Sparkles } from 'lucide-react';
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
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 via-background to-background py-20 sm:py-24 lg:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
          </div>
          
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm shadow-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Secure Digital Identity Platform</span>
              </div>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your Digital Identity,{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Secured
                </span>
              </h1>
              
              <p className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
                The Residential ID Card system provides citizens with a secure, verifiable digital identity card. 
                Register online, complete your profile, and receive your official Digital ID after in-person 
                verification at your selected Kabale office.
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                <Button size="lg" className="group w-full sm:w-auto" asChild>
                  <Link to="/register">
                    <User className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Register as Citizen
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
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
        <section className="py-20 sm:py-24 lg:py-28">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Simple steps to get your Digital ID card
              </p>
            </div>
            
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <User className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="text-xl">1. Register Online</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Create your account and complete your personal profile with accurate information.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <Building2 className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="text-xl">2. Select Your Kabale</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Choose the Kabale office where you will complete your in-person verification and receive your
                    Digital ID.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <CheckCircle className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="text-xl">3. Verify & Receive</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Visit your selected Kabale office for identity verification. Once approved, your Digital ID will be
                    issued.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-b from-muted/30 via-muted/50 to-background py-20 sm:py-24 lg:py-28">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Benefits
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Why choose the Kabale Digital ID system
              </p>
            </div>
            
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardContent className="relative pt-8 pb-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">Secure & Verified</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Your identity is verified through in-person authentication at official Kabale offices, ensuring the
                    highest level of security.
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardContent className="relative pt-8 pb-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">Official Documentation</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Receive an official Digital ID card recognized by the city authority, with complete audit trails and
                    verification records.
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl md:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardContent className="relative pt-8 pb-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">Privacy Protected</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Your personal information is protected with industry-standard security measures and role-based
                    access controls.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-24 lg:py-28">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="relative mx-auto max-w-3xl overflow-hidden border-2 bg-gradient-to-br from-card to-card/50 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              <CardHeader className="relative text-center">
                <CardTitle className="mb-3 text-3xl font-bold sm:text-4xl">
                  Ready to Get Started?
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  Join thousands of citizens who have already received their Digital ID cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                <Button size="lg" className="group w-full sm:w-auto" asChild>
                  <Link to="/register">
                    <User className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Register as Citizen
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link to="/login">
                    <Lock className="mr-2 h-5 w-5" />
                    Login to Your Account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
