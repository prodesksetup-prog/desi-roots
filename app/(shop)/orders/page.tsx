'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-stone-100 text-stone-600',
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/orders');
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/orders').then(r => r.json()).then(data => { setOrders(data); setLoading(false); });
    }
  }, [session]);

  if (loading) return (
    <div className="section-shell space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="card h-40 animate-pulse" />)}
    </div>
  );

  return (
    <div className="pb-10">
      <section className="section-shell pt-8">
        <div className="mb-8">
          <span className="eyebrow">Order history</span>
          <h1 className="mt-4 font-display text-5xl leading-none text-stone-900 sm:text-6xl">Track every purchase in one place.</h1>
          <p className="mt-3 max-w-2xl section-copy">See order progress, preview items, and jump into details whenever you need an update.</p>
        </div>

        {orders.length === 0 ? (
          <div className="card mesh-panel px-8 py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">No orders yet</p>
            <h2 className="mt-4 font-display text-5xl text-stone-900">Your order history will appear here.</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-stone-600">Start shopping to unlock tracking, delivery progress, and a cleaner post-purchase flow.</p>
            <Link href="/products" className="btn-primary mt-8">Shop now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Order #{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`badge ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {order.items.slice(0, 4).map((item: any) => (
                        <div key={item.id} className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-[18px] bg-stone-100">
                          {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex h-20 w-16 flex-shrink-0 items-center justify-center rounded-[18px] bg-stone-100 text-xs font-semibold text-stone-500">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-[22px] bg-stone-50 px-4 py-4 text-sm">
                      <p className="text-stone-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                      <p className="mt-1 text-lg font-extrabold text-stone-900">Rs. {order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <Link href={`/orders/${order.id}`} className="btn-secondary">
                      Track order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
