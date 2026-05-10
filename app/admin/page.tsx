'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductEditor, { ProductFormValue, buildInitialProductForm } from '@/components/admin/ProductEditor';
import { ProductWithDetails } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

function toPayload(form: ProductFormValue) {
  const galleryImages = form.galleryImages.filter((image) => image.url.trim());
  const spinFrames = form.spinFrames
    .filter((image) => image.url.trim())
    .map((image, index) => ({
      url: image.url.trim(),
      alt: `[360] Frame ${index + 1}`,
      isPrimary: false,
    }));

  return {
    id: form.id,
    name: form.name,
    categoryName: form.categoryName,
    description: form.description,
    price: Number(form.price),
    comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
    fabric: form.fabric || null,
    occasion: form.occasion || null,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
    images: [...galleryImages, ...spinFrames],
    variants: form.variants.map((variant) => ({
      ...variant,
      stock: Number(variant.stock || 0),
    })),
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorValue, setEditorValue] = useState<ProductFormValue>(buildInitialProductForm());
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session && session.user?.role !== 'ADMIN') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      Promise.all([
        fetch('/api/admin/orders').then(r => r.json()),
        fetch('/api/admin/products').then(r => r.json()),
      ]).then(([o, p]) => {
        setOrders(o);
        setProducts(p);
        setLoading(false);
      });
    }
  }, [session]);

  const categorySuggestions = useMemo(
    () => Array.from(new Set(products.map((product) => product.category.name))).sort(),
    [products],
  );

  const openCreate = () => {
    setEditorValue(buildInitialProductForm());
    setEditorOpen(true);
  };

  const openEdit = (product: ProductWithDetails) => {
    setEditorValue(buildInitialProductForm(product));
    setEditorOpen(true);
  };

  const saveProduct = async () => {
    setSavingProduct(true);
    const payload = toPayload(editorValue);
    const method = editorValue.id ? 'PATCH' : 'POST';
    const res = await fetch('/api/admin/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const saved = await res.json();

    if (!res.ok) {
      alert(saved.error || 'Could not save product');
      setSavingProduct(false);
      return;
    }

    setProducts((current) => {
      if (editorValue.id) {
        return current.map((product) => product.id === saved.id ? saved : product);
      }
      return [saved, ...current];
    });
    setEditorOpen(false);
    setSavingProduct(false);
  };

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
    const product = products.find((entry) => entry.id === id);
    if (!product) return;

    const payload = {
      ...toPayload(buildInitialProductForm(product)),
      id,
      isActive,
    };

    const res = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const saved = await res.json();
    if (res.ok) {
      setProducts(products.map(p => p.id === id ? saved : p));
    }
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
    <div className="section-shell space-y-4">
      <div className="h-10 w-64 rounded-full bg-stone-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="card h-28 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="pb-10">
      <section className="section-shell pt-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Admin dashboard</span>
            <h1 className="mt-4 font-display text-5xl leading-none text-stone-900 sm:text-6xl">A sharper command center for the store.</h1>
            <p className="mt-3 max-w-2xl section-copy">Same order and product controls, redesigned for quicker scanning and cleaner decision-making.</p>
          </div>
          <Link href="/" className="btn-ghost">View storefront</Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total orders', value: orders.length },
            { label: 'Revenue', value: `Rs. ${totalRevenue.toLocaleString('en-IN')}` },
            { label: 'Pending', value: pendingOrders },
            { label: 'Delivered', value: deliveredOrders },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{stat.label}</p>
              <p className="mt-4 text-3xl font-extrabold text-stone-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(['orders', 'products'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-3 text-sm font-semibold capitalize ${
                tab === t ? 'bg-stone-900 text-white' : 'bg-white/70 text-stone-600 hover:bg-white'
              }`}
            >
              {t} {t === 'orders' ? `(${orders.length})` : `(${products.length})`}
            </button>
          ))}
          {tab === 'products' && (
            <button onClick={openCreate} className="btn-primary ml-auto">
              Add product
            </button>
          )}
        </div>

        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="card px-8 py-16 text-center text-stone-500">No orders yet.</div>
            ) : orders.map((order) => (
              <div key={order.id} className="card p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900">#{order.id.slice(-8).toUpperCase()}</p>
                      <span className={`badge ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-600">{order.user?.name} ({order.user?.email})</p>
                    <p className="mt-1 text-sm text-stone-500">{order.items?.length} items | Rs. {order.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="mt-1 text-xs text-stone-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    disabled={updatingOrder === order.id}
                    className="input-field max-w-[240px]"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-6">
            {editorOpen && (
              <ProductEditor
                value={editorValue}
                categorySuggestions={categorySuggestions}
                onChange={setEditorValue}
                onSubmit={saveProduct}
                onCancel={() => setEditorOpen(false)}
                saving={savingProduct}
              />
            )}

            <div className="space-y-4">
              {products.map((product) => {
                const primaryImage = product.images.find((image) => image.isPrimary) || product.images.find((image) => !image.alt?.startsWith('[360]')) || product.images[0];
                const spinFrameCount = product.images.filter((image) => image.alt?.startsWith('[360]')).length;
                const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);

                return (
                  <div key={product.id} className={`card p-5 sm:p-6 ${!product.isActive ? 'opacity-70' : ''}`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-stone-100 sm:h-28 sm:w-24 sm:flex-shrink-0">
                        {primaryImage && <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-lg font-semibold text-stone-900">{product.name}</p>
                          {!product.isActive && <span className="badge bg-red-100 text-red-600">Hidden</span>}
                          {spinFrameCount >= 8 && <span className="badge bg-stone-900 text-white">360 ready</span>}
                        </div>
                        <p className="mt-2 text-sm text-stone-500">{product.category?.name} | Rs. {product.price.toLocaleString('en-IN')}</p>
                        <p className={`mt-2 text-sm font-semibold ${totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                          {totalStock === 0 ? 'Out of stock' : `${totalStock} in stock`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => openEdit(product)} className="btn-secondary">
                          Edit
                        </button>
                        <button
                          onClick={() => toggleProduct(product.id, !product.isActive)}
                          className="btn-secondary"
                        >
                          {product.isActive ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
