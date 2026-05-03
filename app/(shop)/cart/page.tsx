'use client';
import { useCartStore } from '@/lib/store/cart';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCartStore();
  const shipping = total() > 999 ? 0 : 99;
  const grandTotal = total() + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-6">🛍️</p>
        <h2 className="font-display text-2xl font-bold text-stone-700 mb-3">Your cart is empty</h2>
        <p className="text-stone-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="card p-4 flex gap-4">
              <div className="relative w-20 h-28 flex-shrink-0 bg-stone-100 rounded-sm overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-800 text-sm leading-snug line-clamp-2">{item.name}</h3>
                <p className="text-xs text-stone-500 mt-1">
                  {item.color} · Size: {item.size}
                </p>
                <p className="font-semibold text-stone-800 mt-2">₹{item.price.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-stone-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.variantId, item.quantity - 1)}
                    className="w-7 h-7 border border-stone-300 rounded-sm text-sm hover:border-brand-400 transition-colors">−</button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQty(item.variantId, item.quantity + 1)}
                    className="w-7 h-7 border border-stone-300 rounded-sm text-sm hover:border-brand-400 transition-colors">+</button>
                </div>
                <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-stone-800 text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{total().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                {shipping === 0
                  ? <span className="text-green-600 font-medium">FREE</span>
                  : <span>₹{shipping}</span>
                }
              </div>
              {shipping > 0 && (
                <p className="text-xs text-brand-600 bg-brand-50 px-3 py-2 rounded-sm">
                  Add ₹{(999 - total()).toLocaleString('en-IN')} more for free shipping!
                </p>
              )}
              <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-stone-800">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary w-full text-center block mt-6">
              Proceed to Checkout
            </Link>
            <Link href="/products" className="btn-ghost text-center block mt-3 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
