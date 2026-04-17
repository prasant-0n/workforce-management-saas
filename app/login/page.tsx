'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-8 transition">
          <span>←</span>
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Logo & Branding */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">W</div>
            <h1 className="text-2xl font-bold text-foreground">WorkForce</h1>
          </div>
          <p className="text-foreground-secondary">Sign in to manage your workforce</p>
        </div>

        {/* Premium Login Card */}
        <Card className="p-8 border border-border/40 shadow-2xl backdrop-blur-xl bg-surface/80">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full bg-input border-input-border placeholder:text-foreground-muted focus:border-primary"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:text-primary-hover transition">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full bg-input border-input-border"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-error-light border border-error text-error text-sm font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-foreground-tertiary px-2">Or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Sign Up Link */}
          <Link href="/register">
            <Button variant="outline" className="w-full mt-8 h-11 border-border hover:bg-surface-hover text-foreground rounded-lg">
              Create New Account
            </Button>
          </Link>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-foreground-tertiary">Trusted by 1000+ companies worldwide</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">98%</div>
              <div className="text-xs text-foreground-secondary">Uptime</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">24/7</div>
              <div className="text-xs text-foreground-secondary">Support</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">SOC2</div>
              <div className="text-xs text-foreground-secondary">Certified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
