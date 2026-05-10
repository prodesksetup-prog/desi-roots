'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/store/cart';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'New Arrivals', href: '/products' },
  { label: 'Sarees', href: '/products?category=sarees' },
  { label: 'Salwar Suits', href: '/products?category=salwar-suits' },
  { label: 'Kurtis', href: '/products?category=kurtis' },
  { label: 'Lehengas', href: '/products?category=lehengas' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const count = useCartStore((s) => s.count());
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-3 rounded-full border border-white/60 bg-[rgba(255,251,246,0.72)] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-stone-700 shadow-[0_18px_60px_-36px_rgba(30,20,13,0.85)] backdrop-blur-xl sm:mx-4 sm:px-6">
        Free shipping above Rs. 999 | New festive edits now live
      </div>

      <div className="page-shell">
        <div className="mt-3 flex h-20 items-center justify-between rounded-[30px] border border-white/55 bg-[rgba(255,255,255,0.72)] px-4 shadow-[0_24px_80px_-46px_rgba(28,19,14,0.9)] backdrop-blur-xl sm:px-6">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-3xl font-semibold text-stone-900">Roots</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-stone-500">of Country</span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === '/products' && link.href === '/products';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold tracking-[0.08em] ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-white hover:text-stone-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/products"
              className="hidden rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-stone-300 hover:text-stone-900 md:inline-flex"
            >
              Explore
            </Link>

            <Link
              href="/products"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-stone-600 hover:text-stone-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <Link href="/cart" className="relative inline-flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-4 text-sm font-semibold text-stone-700 hover:text-stone-900">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">Bag</span>
              {isMounted && count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {session ? (
              <div className="group relative hidden sm:block">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </button>
                <div className="invisible absolute right-0 top-full mt-3 w-60 rounded-[24px] border border-stone-200 bg-white/95 p-3 opacity-0 shadow-[0_24px_70px_-38px_rgba(25,18,13,0.72)] transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="rounded-[18px] bg-stone-50 px-4 py-3">
                    <p className="text-sm font-semibold text-stone-900">{session.user?.name}</p>
                    <p className="text-xs text-stone-500">{session.user?.email}</p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link href="/orders" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                      My Orders
                    </Link>
                    {session.user?.role === 'ADMIN' && (
                      <Link href="/admin" className="block rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold tracking-[0.08em] text-white sm:inline-flex">
                Sign In
              </Link>
            )}

            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-stone-700 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="page-shell lg:hidden">
          <div className="mt-3 overflow-hidden rounded-[32px] border border-white/50 bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_24px_80px_-44px_rgba(28,19,14,0.9)] backdrop-blur-xl">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-[20px] px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/orders"
                className="block rounded-[20px] px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                onClick={() => setMenuOpen(false)}
              >
                My Orders
              </Link>
              {!session && (
                <Link
                  href="/login"
                  className="block rounded-[20px] bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
