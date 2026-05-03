// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'Roots of Country | Indian Ethnic Wear',
  description: 'Explore authentic Indian ethnic wear — sarees, salwar suits, kurtis, lehengas and more. Celebrating the roots of India.',
  keywords: 'sarees, salwar suits, kurtis, lehengas, Indian fashion, ethnic wear',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
