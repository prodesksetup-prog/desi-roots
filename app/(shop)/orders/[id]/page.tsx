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
    <div className="section-shell space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="card h-28 animate-pulse" />)}
    </div>
  );

  if (!order) return <div className="section-shell text-center text-stone-500">Order not found.</div>;

  const currentStepIdx = STEPS.indexOf(order.status);

  return (
    <div className="pb-10">
      <section className="section-shell pt-8">
        {isSuccess && (
          <div className="mb-6 rounded-[28px] border border-green-200 bg-green-50 px-5 py-5 text-green-800">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">Order placed</p>
            <p className="mt-2 text-lg font-bold">Payment confirmed and your order is now in motion.</p>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Order details</span>
            <h1 className="mt-4 font-display text-5xl leading-none text-stone-900">#{order.id.slice(-8).toUpperCase()}</h1>
            <p className="mt-3 text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <Link href="/orders" className="btn-ghost">Back to all orders</Link>
        </div>

        {order.status !== 'CANCELLED' && (
          <div className="card mesh-panel mb-6 p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Progress</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {STEPS.map((step, i) => {
                const done = i <= currentStepIdx;
                return (
                  <div key={step} className={`rounded-[24px] p-4 ${done ? 'bg-stone-900 text-white' : 'bg-white/70 text-stone-500'}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">{i + 1}</p>
                    <p className="mt-3 text-sm font-semibold">{STEP_LABELS[step]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <div className="space-y-6">
            {order.tracking?.length > 0 && (
              <div className="card p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Tracking history</p>
                <div className="mt-6 space-y-4">
                  {[...order.tracking].reverse().map((t: any) => (
                    <div key={t.id} className="rounded-[24px] bg-stone-50 px-4 py-4">
                      <p className="text-sm font-semibold text-stone-900">{STEP_LABELS[t.status] || t.status}</p>
                      <p className="mt-1 text-sm text-stone-600">{t.message}</p>
                      <p className="mt-2 text-xs text-stone-400">{new Date(t.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Items ordered</p>
              <div className="mt-6 space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex flex-col gap-4 rounded-[24px] bg-stone-50 p-4 sm:flex-row sm:items-center">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-stone-100 sm:h-24 sm:w-20 sm:flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-stone-900">{item.name}</p>
                      <p className="mt-1 text-stone-500">{item.color} | Size {item.size} | Qty {item.quantity}</p>
                    </div>
                    <p className="text-base font-extrabold text-stone-900">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="card mesh-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Delivery address</p>
              <div className="mt-4 text-sm leading-7 text-stone-700">
                <p className="font-semibold text-stone-900">{order.address.name}</p>
                <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p>{order.address.phone}</p>
              </div>
            </div>

            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Price summary</p>
              <div className="mt-5 space-y-3 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {(order.totalAmount - order.shippingAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {order.shippingAmount === 0 ? <span className="font-semibold text-green-700">Free</span> : <span>Rs. {order.shippingAmount}</span>}
                </div>
                <div className="border-t border-stone-200 pt-4">
                  <div className="flex justify-between text-lg font-extrabold text-stone-900">
                    <span>Total paid</span>
                    <span>Rs. {order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="pt-2 text-xs uppercase tracking-[0.14em] text-stone-400">
                  {order.paymentMethod} | {order.paymentStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
