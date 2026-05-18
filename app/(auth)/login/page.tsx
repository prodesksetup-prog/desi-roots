'use client';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState('/');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get('callbackUrl') || '/');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="section-shell flex min-h-[calc(100vh-8rem)] items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="relative overflow-hidden rounded-[34px] bg-stone-950 px-7 py-10 text-white sm:px-10 lg:min-h-[700px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,193,121,0.28),transparent_28%),linear-gradient(135deg,rgba(22,14,10,0.96),rgba(76,43,28,0.88))]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <span className="eyebrow border-white/20 bg-white/8 text-amber-100">Welcome back</span>
              <h1 className="mt-6 font-display text-6xl leading-[0.92] text-white">Step back into your curated wardrobe.</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-stone-300 sm:text-base">
                Sign in to track orders, continue checkout, and browse the latest festive edits with your saved details in place.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-300">Customer demo</p>
                <p className="mt-2 text-sm font-semibold text-white">test@example.com</p>
                <p className="text-sm text-stone-300">customer@123</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-300">Admin demo</p>
                <p className="mt-2 text-sm font-semibold text-white">admin@desiroots.in</p>
                <p className="text-sm text-stone-300">admin@123</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mesh-panel p-7 sm:p-10">
          <div className="max-w-md">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Desi Roots</Link>
            <h2 className="mt-4 font-display text-5xl leading-none text-stone-900">Sign in</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">Everything stays the same behind the scenes. We only refreshed the way it feels.</p>

            {error && (
              <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-sm text-stone-600">
              New here?{' '}
              <Link href="/signup" className="font-semibold text-brand-700 hover:text-brand-800">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
