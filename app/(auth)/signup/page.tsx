'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="section-shell flex min-h-[calc(100vh-8rem)] items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="card mesh-panel p-7 sm:p-10">
          <div className="max-w-lg">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Desi Roots</Link>
            <h1 className="mt-4 font-display text-5xl leading-none text-stone-900">Create your account</h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Save your addresses, track every order, and keep your favorite festive pieces close.
            </p>

            {error && (
              <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Full name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="sm:col-span-2">
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
              <div className="sm:col-span-2">
                <label className="label">Phone number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-sm text-stone-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[34px] bg-stone-950 px-7 py-10 text-white sm:px-10 lg:min-h-[700px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,193,121,0.28),transparent_28%),linear-gradient(135deg,rgba(22,14,10,0.96),rgba(76,43,28,0.88))]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <span className="eyebrow border-white/20 bg-white/8 text-amber-100">Join the community</span>
              <h2 className="mt-6 font-display text-6xl leading-[0.92] text-white">A better dressed way to shop Indian craft.</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-stone-300 sm:text-base">
                Create your profile once and the rest of the experience stays smooth across mobile, desktop, and every purchase step.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Faster checkout', copy: 'Saved details for a quicker order flow.' },
                { title: 'Track everything', copy: 'See current and past orders in one place.' },
                { title: 'Festive-ready', copy: 'Browse curated edits with easier discovery.' },
              ].map((item) => (
                <div key={item.title} className="glass-card p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-xs leading-6 text-stone-300">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
