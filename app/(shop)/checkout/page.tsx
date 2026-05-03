'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

interface Address {
  id: string; name: string; phone: string;
  line1: string; line2?: string; city: string; state: string; pincode: string; isDefault: boolean;
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
      name: 'Roots of Country',
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
      theme: { color: '#b8621f' },
      modal: { ondismiss: () => setLoading(false) },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="font-display text-2xl font-bold text-stone-700 mb-3">Your cart is empty</h2>
        <Link href="/products" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8 text-sm">
          {['address', 'review'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s || (i === 0 && step === 'review') ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-500'
              }`}>{i + 1}</span>
              <span className={step === s ? 'font-semibold text-stone-800' : 'text-stone-500'}>
                {s === 'address' ? 'Delivery Address' : 'Review & Pay'}
              </span>
              {i < 1 && <span className="text-stone-300 mx-1">→</span>}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left */}
          <div className="flex-1">
            {step === 'address' && (
              <div className="space-y-4">
                <h2 className="font-semibold text-stone-800 text-lg">Select Delivery Address</h2>

                {addresses.map((addr) => (
                  <label key={addr.id} className={`card p-4 flex gap-3 cursor-pointer transition-colors ${
                    selectedAddress === addr.id ? 'border-brand-500 bg-brand-50' : 'hover:border-stone-300'
                  }`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-brand-600" />
                    <div className="text-sm">
                      <p className="font-medium text-stone-800">{addr.name}</p>
                      <p className="text-stone-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-stone-600">{addr.city}, {addr.state} – {addr.pincode}</p>
                      <p className="text-stone-500">📱 {addr.phone}</p>
                    </div>
                  </label>
                ))}

                <button onClick={() => setShowAddressForm(!showAddressForm)}
                  className="btn-secondary w-full text-center text-sm">
                  + Add New Address
                </button>

                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="card p-5 space-y-3">
                    <h3 className="font-semibold text-stone-800">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label text-xs">Full Name</label>
                        <input className="input-field text-sm !py-2" placeholder="Name" value={newAddress.name}
                          onChange={e => setNewAddress({...newAddress, name: e.target.value})} required /></div>
                      <div><label className="label text-xs">Phone</label>
                        <input className="input-field text-sm !py-2" placeholder="10-digit number" value={newAddress.phone}
                          onChange={e => setNewAddress({...newAddress, phone: e.target.value})} required /></div>
                    </div>
                    <div><label className="label text-xs">Address Line 1</label>
                      <input className="input-field text-sm !py-2" placeholder="House/Flat, Street" value={newAddress.line1}
                        onChange={e => setNewAddress({...newAddress, line1: e.target.value})} required /></div>
                    <div><label className="label text-xs">Address Line 2 (Optional)</label>
                      <input className="input-field text-sm !py-2" placeholder="Landmark, Area" value={newAddress.line2}
                        onChange={e => setNewAddress({...newAddress, line2: e.target.value})} /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="label text-xs">City</label>
                        <input className="input-field text-sm !py-2" placeholder="City" value={newAddress.city}
                          onChange={e => setNewAddress({...newAddress, city: e.target.value})} required /></div>
                      <div><label className="label text-xs">State</label>
                        <input className="input-field text-sm !py-2" placeholder="State" value={newAddress.state}
                          onChange={e => setNewAddress({...newAddress, state: e.target.value})} required /></div>
                      <div><label className="label text-xs">Pincode</label>
                        <input className="input-field text-sm !py-2" placeholder="6-digit" value={newAddress.pincode}
                          onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} required /></div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                      <input type="checkbox" className="accent-brand-600" checked={newAddress.isDefault}
                        onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} />
                      Set as default address
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary text-sm">Save Address</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                  </form>
                )}

                <button onClick={() => { if (selectedAddress) setStep('review'); else alert('Please select an address'); }}
                  disabled={!selectedAddress}
                  className="btn-primary w-full text-center disabled:opacity-50 mt-2">
                  Continue to Review
                </button>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setStep('address')} className="text-brand-600 text-sm hover:underline">← Change Address</button>
                </div>

                {/* Selected address */}
                {addresses.find(a => a.id === selectedAddress) && (
                  <div className="card p-4 border-brand-300 bg-brand-50">
                    <p className="text-xs text-brand-600 font-medium mb-1">Delivering to</p>
                    {(() => {
                      const a = addresses.find(addr => addr.id === selectedAddress)!;
                      return <p className="text-sm text-stone-700">{a.name}, {a.line1}, {a.city}, {a.state} – {a.pincode}</p>;
                    })()}
                  </div>
                )}

                {/* Items */}
                <h2 className="font-semibold text-stone-800">Order Items ({items.length})</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.variantId} className="card p-3 flex gap-3">
                      <div className="relative w-14 h-18 flex-shrink-0 bg-stone-100 rounded-sm overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-stone-800 line-clamp-1">{item.name}</p>
                        <p className="text-stone-500 text-xs">{item.color} · {item.size} · Qty: {item.quantity}</p>
                        <p className="font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handlePlaceOrder} disabled={loading}
                  className="btn-primary w-full text-center text-base py-4 disabled:opacity-60">
                  {loading ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString('en-IN')} via Razorpay`}
                </button>
                <p className="text-xs text-center text-stone-400">🔒 Secured by Razorpay. All payment info is encrypted.</p>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <h3 className="font-semibold text-stone-800 mb-4">Price Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>MRP Total</span><span>₹{total().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  {shipping === 0 ? <span className="text-green-600">FREE</span> : <span>₹{shipping}</span>}
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-800">
                  <span>Amount Payable</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
