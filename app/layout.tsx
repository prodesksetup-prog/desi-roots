import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/Toaster';
import StyleCompanion from '@/components/ui/StyleCompanion';

export const metadata: Metadata = {
  title: 'Desi Roots | Indian Ethnic Wear',
  description: 'Explore authentic Indian ethnic wear - sarees, salwar suits, kurtis, lehengas and more. Celebrating the roots of India.',
  keywords: 'sarees, salwar suits, kurtis, lehengas, Indian fashion, ethnic wear',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-8rem] top-[-10rem] h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
          <div className="absolute right-[-7rem] top-[18rem] h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />
        </div>
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-3 sm:pt-4">{children}</main>
          <Footer />
          <StyleCompanion />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
