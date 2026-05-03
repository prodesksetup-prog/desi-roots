'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STEP_LABELS: Record<string, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Payment Confirmed',
  PROCESSING: 'Being Prepared',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};
const STEP_ICONS: Record<string, string> = {
  PENDING: '📋', CONFIRMED: '✅', PROCESSING: '🏭', SHIPPED: '🚚', OUT_FOR_DELIVERY: '🛵', DELIVERED: '🎉',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsSuccess(searchParams.get('success') === 'true');
  }, []);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(data => { setOrder(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
      {[1,2,3].map(i => <div key={i} className="card p-6 animate-pulse h-24" />)}
    </div>
  );

  if (!order) return <div className="text-center py-20 text-stone-500">Order not found.</div>;

  const currentStepIdx = STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Success banner */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-sm p-4 mb-6 flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-semibold text-green-800">Order Placed Successfully!</p>
            <p className="text-green-600 text-sm">Thank you for shopping at Roots of Country</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Order Details</h1>
          <p className="text-stone-500 text-sm">#{order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link href="/orders" className="btn-ghost text-sm">← All Orders</Link>
      </div>

      {/* Progress Tracker */}
      {order.status !== 'CANCELLED' && (
        <div className="card p-5 mb-5">
          <h2 className="font-semibold text-stone-800 mb-5">Order Status</h2>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-200 z-0">
              <div
                className="h-full bg-brand-500 transition-all duration-700"
                style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
            {/* Steps */}
            <div className="relative z-10 flex justify-between">
              {STEPS.map((step, i) => {
                const done = i <= currentStepIdx;
                return (
                  <div key={step} className="flex flex-col items-center gap-1 w-14">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                      done ? 'bg-brand-600 border-brand-600' : 'bg-white border-stone-200'
                    }`}>
                      {done ? <span className="text-white text-sm">{STEP_ICONS[step]}</span> : <span className="text-stone-300 text-sm">○</span>}
                    </div>
                    <p className={`text-[10px] text-center leading-tight ${done ? 'text-brand-700 font-medium' : 'text-stone-400'}`}>
                      {STEP_LABELS[step]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tracking history */}
      {order.tracking?.length > 0 && (
        <div className="card p-5 mb-5">
          <h2 className="font-semibold text-stone-800 mb-4">Tracking History</h2>
          <div className="space-y-3">
            {[...order.tracking].reverse().map((t: any) => (
              <div key={t.id} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1" />
                  <div className="flex-1 w-px bg-stone-200 mt-1" />
                </div>
                <div className="pb-3">
                  <p className="font-medium text-stone-800">{STEP_LABELS[t.status] || t.status}</p>
                  <p className="text-stone-500 text-xs">{t.message}</p>
                  <p className="text-stone-400 text-xs">{new Date(t.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-stone-800 mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-14 h-18 flex-shrink-0 bg-stone-100 rounded-sm overflow-hidden">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-stone-800">{item.name}</p>
                <p className="text-stone-500 text-xs">{item.color} · Size {item.size} · Qty {item.quantity}</p>
                <p className="font-semibold text-stone-800 mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-stone-800 mb-3">Delivery Address</h2>
        <div className="text-sm text-stone-600">
          <p className="font-medium text-stone-800">{order.address.name}</p>
          <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
          <p>{order.address.city}, {order.address.state} – {order.address.pincode}</p>
          <p>📱 {order.address.phone}</p>
        </div>
      </div>

      {/* Price */}
      <div className="card p-5">
        <h2 className="font-semibold text-stone-800 mb-3">Price Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span><span>₹{(order.totalAmount - order.shippingAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping</span>
            {order.shippingAmount === 0 ? <span className="text-green-600">FREE</span> : <span>₹{order.shippingAmount}</span>}
          </div>
          <div className="flex justify-between font-bold text-stone-800 border-t border-stone-200 pt-2">
            <span>Total Paid</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-stone-400">
            <span>Payment</span><span className="capitalize">{order.paymentMethod} · {order.paymentStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
