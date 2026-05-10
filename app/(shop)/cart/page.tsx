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
      <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="card mesh-panel max-w-xl px-8 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Your bag is empty</p>
          <h2 className="mt-4 font-display text-5xl text-stone-900">Start curating your next look.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-stone-600">
            Save sarees, kurtis, and festive edits here while you build the full wardrobe.
          </p>
          <Link href="/products" className="btn-primary mt-8">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <section className="section-shell pt-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Shopping bag</span>
            <h1 className="mt-4 font-display text-5xl leading-none text-stone-900 sm:text-6xl">Everything you are about to wear.</h1>
            <p className="mt-3 section-copy">Review quantities, keep favorites, and move to checkout when the edit feels right.</p>
          </div>
          <Link href="/products" className="btn-ghost">Continue browsing</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="card p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-stone-100 sm:h-36 sm:w-28 sm:flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-stone-500">{item.color} | Size {item.size}</p>
                        <p className="mt-3 text-lg font-extrabold text-stone-900">Rs. {item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 rounded-full bg-stone-50 px-3 py-2">
                        <button onClick={() => updateQty(item.variantId, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold shadow-sm">
                          -
                        </button>
                        <span className="w-8 text-center text-base font-bold">{item.quantity}</span>
                        <button onClick={() => updateQty(item.variantId, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold shadow-sm">
                          +
                        </button>
                      </div>
                      <p className="text-lg font-extrabold text-stone-900">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="card mesh-panel p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Order summary</p>
              <h2 className="mt-3 text-2xl font-extrabold text-stone-900">Ready when you are.</h2>

              <div className="mt-6 space-y-4 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>Rs. {total().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shipping === 0 ? <span className="font-semibold text-green-700">Free</span> : <span>Rs. {shipping}</span>}
                </div>
                {shipping > 0 && (
                  <div className="rounded-[22px] bg-white/80 px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                    Add Rs. {(999 - total()).toLocaleString('en-IN')} more for free shipping
                  </div>
                )}
                <div className="border-t border-stone-200 pt-4">
                  <div className="flex justify-between text-lg font-extrabold text-stone-900">
                    <span>Total</span>
                    <span>Rs. {grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary mt-7 w-full">
                Proceed to checkout
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
