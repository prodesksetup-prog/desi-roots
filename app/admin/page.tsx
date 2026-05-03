'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const ALL_STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session && session.user?.role !== 'ADMIN') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      Promise.all([
        fetch('/api/admin/orders').then(r => r.json()),
        fetch('/api/admin/products').then(r => r.json()),
      ]).then(([o, p]) => { setOrders(o); setProducts(p); setLoading(false); });
    }
  }, [session]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdatingOrder(null);
  };

  const toggleProduct = async (id: string, isActive: boolean) => {
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive }),
    });
    setProducts(products.map(p => p.id === id ? { ...p, isActive } : p));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setProducts(products.filter(p => p.id !== id));
  };

  const totalRevenue = orders.filter(o => o.paymentStatus === 'PAID').reduce((s: number, o: any) => s + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-stone-200 rounded w-48" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-stone-200 rounded" />)}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-800">Admin Panel</h1>
          <p className="text-stone-500 text-sm">Roots of Country — Business Dashboard</p>
        </div>
        <Link href="/" className="btn-ghost text-sm">← View Store</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: orders.length, icon: '📦', color: 'bg-blue-50 text-blue-700' },
          { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: '💰', color: 'bg-green-50 text-green-700' },
          { label: 'Pending', value: pendingOrders, icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Delivered', value: deliveredOrders, icon: '✅', color: 'bg-brand-50 text-brand-700' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-4 ${stat.color}`}>
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium opacity-70">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6">
        {(['orders', 'products'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {t} {t === 'orders' ? `(${orders.length})` : `(${products.length})`}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-center py-12 text-stone-500">No orders yet</p>
          ) : orders.map((order) => (
            <div key={order.id} className="card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-stone-800 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                    <span className={`badge ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {order.user?.name} ({order.user?.email}) · {order.items?.length} items ·{' '}
                    <span className="font-semibold text-stone-700">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </p>
                  <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    disabled={updatingOrder === order.id}
                    className="input-field !py-1.5 text-xs !w-auto"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="space-y-3">
          {products.map((product) => {
            const primaryImage = product.images?.find((i: any) => i.isPrimary) || product.images?.[0];
            const totalStock = product.variants?.reduce((s: number, v: any) => s + v.stock, 0) || 0;
            return (
              <div key={product.id} className={`card p-4 flex gap-4 ${!product.isActive ? 'opacity-60' : ''}`}>
                <div className="relative w-14 h-18 flex-shrink-0 bg-stone-100 rounded-sm overflow-hidden">
                  {primaryImage && <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-800 text-sm truncate">{product.name}</p>
                    {!product.isActive && <span className="badge bg-red-100 text-red-600 text-[10px]">Hidden</span>}
                  </div>
                  <p className="text-xs text-stone-500">{product.category?.name} · ₹{product.price.toLocaleString('en-IN')}</p>
                  <p className={`text-xs font-medium mt-0.5 ${totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                    {totalStock === 0 ? 'Out of Stock' : `${totalStock} in stock`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleProduct(product.id, !product.isActive)}
                    className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                      product.isActive
                        ? 'border-stone-300 text-stone-600 hover:bg-stone-100'
                        : 'border-brand-300 text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    {product.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-xs px-3 py-1.5 rounded-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
