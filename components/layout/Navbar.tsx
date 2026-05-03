'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/store/cart';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const count = useCartStore((s) => s.count());
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-brand-600 text-white text-center text-xs py-1.5 tracking-widest">
        FREE SHIPPING ON ORDERS ABOVE ₹999 🌸
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-2xl font-bold text-brand-700">Roots</span>
          <span className="text-[10px] tracking-[0.3em] text-stone-500 uppercase -mt-1">of Country</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link href="/products" className="hover:text-brand-600 transition-colors">All Products</Link>
          <Link href="/products?category=sarees" className="hover:text-brand-600 transition-colors">Sarees</Link>
          <Link href="/products?category=salwar-suits" className="hover:text-brand-600 transition-colors">Salwar Suits</Link>
          <Link href="/products?category=kurtis" className="hover:text-brand-600 transition-colors">Kurtis</Link>
          <Link href="/products?category=lehengas" className="hover:text-brand-600 transition-colors">Lehengas</Link>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Link href="/products" className="text-stone-500 hover:text-brand-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative text-stone-500 hover:text-brand-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {isMounted && count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* User */}
          {session ? (
            <div className="relative group">
              <button className="flex items-center gap-1 text-stone-500 hover:text-brand-600 transition-colors">
                <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-700 text-xs font-semibold">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white border border-stone-200 rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                <div className="px-4 py-3 border-b border-stone-100">
                  <p className="text-xs font-medium text-stone-800 truncate">{session.user?.name}</p>
                  <p className="text-xs text-stone-500 truncate">{session.user?.email}</p>
                </div>
                <Link href="/orders" className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-brand-600">My Orders</Link>
                <Link href="/profile" className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-brand-600">Profile</Link>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="block px-4 py-2 text-sm text-brand-600 font-medium hover:bg-stone-50">Admin Panel</Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 border-t border-stone-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-brand-600 transition-colors">
              Login
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-stone-500"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-3 space-y-3">
          {['All Products', 'Sarees', 'Salwar Suits', 'Kurtis', 'Lehengas'].map((item) => (
            <Link
              key={item}
              href={item === 'All Products' ? '/products' : `/products?category=${item.toLowerCase().replace(' ', '-')}`}
              className="block text-sm text-stone-600 hover:text-brand-600 py-1"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
