'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Loader2, Sparkles, AlertCircle, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginDemoAdmin } from '@/actions/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const [email, setEmail] = useState('admin@zelda.com');
  const [password, setPassword] = useState('admin123');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginDemoAdmin();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMsg('Failed to initialize demo session');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Check for demo admin credentials first
    if (!isSignUp && email.trim().toLowerCase() === 'admin@zelda.com' && (password === 'admin123' || password === 'admin')) {
      await loginDemoAdmin();
      router.push(redirectTo);
      router.refresh();
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'customer',
            },
          },
        });
        if (error) throw error;
        router.push(redirectTo);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          // If Supabase connection fails, check if user intended demo admin
          if (email.trim().toLowerCase() === 'admin@zelda.com') {
            await loginDemoAdmin();
            router.push(redirectTo);
            router.refresh();
            return;
          }
          throw error;
        }
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('fetch') || msg.includes('Failed to fetch')) {
        setErrorMsg('Supabase local backend is offline. Use demo admin credentials: admin@zelda.com / admin123');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-theme-ink rounded-3xl border border-neutral-200/80 p-8 sm:p-10 shadow-xs max-w-md w-full mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex p-3 bg-neutral-100 rounded-2xl mb-3 text-neutral-900">
          <ShieldCheck className="w-6 h-6 text-theme-primary" />
        </div>
        <h1 className="text-2xl font-sans font-black text-theme-ink">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {isSignUp
            ? 'Sign up to track orders and receive off-price drop alerts'
            : 'Sign in to access your profile or admin dashboard'}
        </p>
      </div>

      {/* Demo Admin Quick Access Card */}
      {!isSignUp && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-amber-950">
            <div className="flex items-center gap-1.5 font-bold">
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>Admin Credentials</span>
            </div>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Ready
            </span>
          </div>

          <div className="bg-white/80 rounded-xl p-2.5 border border-amber-200/60 font-mono text-[11px] space-y-1 text-neutral-800">
            <div><span className="text-neutral-500 font-sans">Email: </span><strong className="text-theme-ink">admin@zelda.com</strong></div>
            <div><span className="text-neutral-500 font-sans">Password: </span><strong className="text-theme-ink">admin123</strong></div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full bg-theme-primary hover:bg-theme-primary-hover disabled:bg-neutral-300 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>One-Click Sign In as Admin</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-theme-primary shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-theme-ink bg-neutral-50/50 text-theme-ink"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-neutral-700 block mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zelda.com"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-theme-ink bg-neutral-50/50 text-theme-ink"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-neutral-700 block mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-theme-ink bg-neutral-50/50 text-theme-ink"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-theme-primary hover:bg-theme-primary-hover disabled:bg-neutral-300 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          )}
        </button>
      </form>

      <div className="pt-2 border-t border-neutral-100 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg(null);
          }}
          className="text-xs text-neutral-600 hover:text-theme-primary font-semibold transition-colors"
        >
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account yet? Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex flex-col items-center justify-center">
        <Suspense fallback={<div className="text-sm text-neutral-400">Loading auth...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
