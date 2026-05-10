'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'review'>('address');

  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false,
  });

  const shipping = total() > 999 ? 0 : 99;
  const grandTotal = total() + shipping;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/checkout');
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/addresses').then(r => r.json()).then(data => {
        setAddresses(data);
        const def = data.find((a: Address) => a.isDefault);
        if (def) setSelectedAddress(def.id);
      });
    }
  }, [session]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAddress),
    });
    const saved = await res.json();
    setAddresses([...addresses, saved]);
    setSelectedAddress(saved.id);
    setShowAddressForm(false);
    setNewAddress({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { alert('Please select a delivery address'); return; }
    setLoading(true);

    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity, price: i.price })),
        addressId: selectedAddress,
        shippingAmount: shipping,
      }),
    });

    const orderData = await res.json();
    if (!res.ok) { alert(orderData.error); setLoading(false); return; }

    const options = {
      key: orderData.keyId,
      amount: Math.round(orderData.amount * 100),
      currency: 'INR',
      name: 'Desi Roots',
      description: 'Indian Ethnic Wear',
      order_id: orderData.razorpayOrderId,
      handler: async (response: any) => {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: orderData.orderId,
          }),
        });
        const verified = await verifyRes.json();
        if (verified.success) {
          clearCart();
          router.push(`/orders/${orderData.orderId}?success=true`);
        }
      },
      prefill: { name: session?.user?.name, email: session?.user?.email },
      theme: { color: '#22160d' },
      modal: { ondismiss: () => setLoading(false) },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="card mesh-panel max-w-xl px-8 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Checkout is waiting</p>
          <h2 className="mt-4 font-display text-5xl text-stone-900">Your bag needs a few pieces first.</h2>
          <Link href="/products" className="btn-primary mt-8">Shop now</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="pb-10">
        <section className="section-shell pt-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">Checkout</span>
              <h1 className="mt-4 font-display text-5xl leading-none text-stone-900 sm:text-6xl">Finish your order with a cleaner flow.</h1>
              <p className="mt-3 section-copy">Same functionality, smoother experience. Select an address, review your items, and pay securely.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { key: 'address', label: 'Address', active: step === 'address' || step === 'review' },
                { key: 'review', label: 'Review & Pay', active: step === 'review' },
              ].map((item, index) => (
                <div key={item.key} className={`rounded-full px-4 py-2 text-sm font-semibold ${item.active ? 'bg-stone-900 text-white' : 'bg-white/70 text-stone-500'}`}>
                  {index + 1}. {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
            <div className="space-y-6">
              {step === 'address' && (
                <>
                  <div className="card p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Delivery</p>
                        <h2 className="mt-2 text-2xl font-extrabold text-stone-900">Choose where it should arrive.</h2>
                      </div>
                      <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-secondary">
                        {showAddressForm ? 'Hide form' : 'Add address'}
                      </button>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {addresses.map((addr) => (
                        <label key={addr.id} className={`cursor-pointer rounded-[26px] border p-5 transition-all ${selectedAddress === addr.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white/70 hover:border-stone-300'}`}>
                          <div className="flex gap-3">
                            <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-stone-900" />
                            <div className="text-sm">
                              <p className={`font-semibold ${selectedAddress === addr.id ? 'text-white' : 'text-stone-900'}`}>{addr.name}</p>
                              <p className={selectedAddress === addr.id ? 'text-stone-200' : 'text-stone-600'}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                              <p className={selectedAddress === addr.id ? 'text-stone-200' : 'text-stone-600'}>{addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className={selectedAddress === addr.id ? 'text-stone-300' : 'text-stone-500'}>{addr.phone}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleSaveAddress} className="card mesh-panel p-6 sm:p-7">
                      <h3 className="text-2xl font-extrabold text-stone-900">Add a new address</h3>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="label">Full name</label>
                          <input className="input-field" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} required />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Phone</label>
                          <input className="input-field" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Address line 1</label>
                          <input className="input-field" value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} required />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Address line 2</label>
                          <input className="input-field" value={newAddress.line2} onChange={e => setNewAddress({ ...newAddress, line2: e.target.value })} />
                        </div>
                        <div>
                          <label className="label">City</label>
                          <input className="input-field" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                        </div>
                        <div>
                          <label className="label">State</label>
                          <input className="input-field" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Pincode</label>
                          <input className="input-field" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                        </div>
                      </div>
                      <label className="mt-5 flex items-center gap-2 text-sm text-stone-600">
                        <input type="checkbox" className="accent-brand-600" checked={newAddress.isDefault} onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                        Set as default address
                      </label>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button type="submit" className="btn-primary">Save address</button>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  )}

                  <button
                    onClick={() => { if (selectedAddress) setStep('review'); else alert('Please select an address'); }}
                    disabled={!selectedAddress}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    Continue to review
                  </button>
                </>
              )}

              {step === 'review' && (
                <>
                  <button onClick={() => setStep('address')} className="btn-ghost">Back to address</button>

                  {addresses.find(a => a.id === selectedAddress) && (
                    <div className="card mesh-panel p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Delivering to</p>
                      {(() => {
                        const a = addresses.find(addr => addr.id === selectedAddress)!;
                        return (
                          <p className="mt-3 text-sm leading-7 text-stone-700">
                            {a.name}, {a.line1}, {a.city}, {a.state} - {a.pincode}
                          </p>
                        );
                      })()}
                    </div>
                  )}

                  <div className="card p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Review</p>
                        <h2 className="mt-2 text-2xl font-extrabold text-stone-900">Check every item before you pay.</h2>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {items.map((item) => (
                        <div key={item.variantId} className="flex flex-col gap-4 rounded-[24px] bg-stone-50 p-4 sm:flex-row sm:items-center">
                          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-stone-100 sm:h-24 sm:w-20 sm:flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 text-sm">
                            <p className="font-semibold text-stone-900">{item.name}</p>
                            <p className="mt-1 text-stone-500">{item.color} | {item.size} | Qty {item.quantity}</p>
                          </div>
                          <p className="text-base font-extrabold text-stone-900">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full text-base disabled:opacity-60">
                    {loading ? 'Processing...' : `Pay Rs. ${grandTotal.toLocaleString('en-IN')} with Razorpay`}
                  </button>
                </>
              )}
            </div>

            <div className="lg:sticky lg:top-28 lg:h-fit">
              <div className="card mesh-panel p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Price details</p>
                <div className="mt-5 space-y-4 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>Items total</span>
                    <span>Rs. {total().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {shipping === 0 ? <span className="font-semibold text-green-700">Free</span> : <span>Rs. {shipping}</span>}
                  </div>
                  <div className="border-t border-stone-200 pt-4">
                    <div className="flex justify-between text-lg font-extrabold text-stone-900">
                      <span>Amount payable</span>
                      <span>Rs. {grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
