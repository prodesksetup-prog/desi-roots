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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-bold text-brand-700">Roots of Country</span>
          </Link>
          <p className="text-stone-500 mt-2 text-sm">Welcome back</p>
        </div>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-stone-800 mb-6">Sign In</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
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
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-600 font-medium hover:underline">
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-500">
            <p className="font-medium mb-1 text-stone-600">Demo Credentials:</p>
            <p>Customer: test@example.com / customer@123</p>
            <p>Admin: admin@rootsofcountry.in / admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
