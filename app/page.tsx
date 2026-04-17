'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { ArrowRight, Check, Zap, Shield, Users, BarChart3 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
          <p className="mt-4 text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">W</div>
            <span className="text-xl font-bold">WorkForce</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground-secondary hover:text-foreground">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light border border-primary/20 text-primary font-medium text-sm mb-8">
            <Zap className="w-4 h-4" />
            The smarter way to manage your workforce
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-8 leading-tight">
            Workforce management,{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              reimagined
            </span>
          </h1>

          <p className="text-lg md:text-xl text-foreground-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            Manage schedules, leave requests, and team oversight with an intelligent platform built for modern teams. Stop losing time on administrative tasks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 h-14 text-base shadow-xl hover:shadow-2xl transition-all">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-border hover:bg-surface-hover">
                View Demo
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-foreground-secondary flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 max-w-5xl mx-auto px-6">
          <div className="relative rounded-2xl border border-border/40 bg-gradient-to-br from-surface to-surface-hover p-1 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"></div>
            <div className="relative bg-surface rounded-xl p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-primary/20 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-foreground-muted/20 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-secondary/20 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-foreground-muted/20 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-accent/20 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-foreground-muted/20 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">Everything your team needs to succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Smart Scheduling',
                description: 'Intelligent shift management with automatic conflict detection',
              },
              {
                icon: <Check className="w-6 h-6" />,
                title: 'Leave Management',
                description: 'Streamlined requests with intelligent approval workflows',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Team Insights',
                description: 'Real-time analytics and reporting for workforce planning',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Role-Based Access',
                description: 'Granular permissions for admins, managers, and employees',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Instant Notifications',
                description: 'Real-time updates keep everyone informed and aligned',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Team Collaboration',
                description: 'Built-in messaging and communication tools',
              },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-surface border border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-t border-border/40 bg-surface-hover/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                1000+
              </div>
              <p className="text-foreground-secondary text-lg">Active Companies</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                98%
              </div>
              <p className="text-foreground-secondary text-lg">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                4M+
              </div>
              <p className="text-foreground-secondary text-lg">Shifts Managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to transform your workforce?</h2>
          <p className="text-xl text-foreground-secondary mb-10">Join thousands of companies managing their teams smarter</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 h-14 text-base shadow-xl hover:shadow-2xl transition-all">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-border hover:bg-surface-hover">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-foreground-secondary text-sm">
          <p>© 2024 WorkForce. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
