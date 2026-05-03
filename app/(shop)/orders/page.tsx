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
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      {[1,2,3].map(i => <div key={i} className="card p-6 animate-pulse h-32" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="font-display text-xl text-stone-700 mb-2">No orders yet</h2>
          <p className="text-stone-500 mb-6">Start shopping to see your orders here</p>
          <Link href="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-stone-500">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items preview */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {order.items.slice(0, 4).map((item: any) => (
                  <div key={item.id} className="relative w-14 h-18 flex-shrink-0 bg-stone-100 rounded-sm overflow-hidden">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-14 h-18 flex-shrink-0 bg-stone-100 rounded-sm flex items-center justify-center text-xs text-stone-500">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  <p className="font-semibold text-stone-800">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <Link href={`/orders/${order.id}`} className="btn-secondary !py-2 text-sm">
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
