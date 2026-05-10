'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { ProductWithDetails } from '@/types';
import Link from 'next/link';
import Spin360Viewer from '@/components/shop/Spin360Viewer';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeView, setActiveView] = useState<'gallery' | 'spin'>('gallery');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="section-shell grid grid-cols-1 gap-12 animate-pulse md:grid-cols-2">
      <div className="aspect-[3/4] rounded-[32px] bg-stone-200" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-6 rounded-full bg-stone-200" />)}
      </div>
    </div>
  );

  if (!product) return <div className="section-shell text-center text-stone-500">Product not found.</div>;

  const spinFrames = product.images.filter((image) => image.alt?.startsWith('[360]'));
  const galleryImages = product.images.filter((image) => !image.alt?.startsWith('[360]'));
  const presentationImages = galleryImages.length ? galleryImages : product.images;

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.filter((v) => !selectedColor || v.color === selectedColor).map((v) => v.size))];
  const selectedVariant = product.variants.find((v) =>
    (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize)
  );
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.variants.some((v) => v.stock > 0);
  const primaryImage = presentationImages.find((i) => i.isPrimary) || presentationImages[0];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) { alert('Please select size and color'); return; }
    addItem({
      id: selectedVariant.id,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: product.price,
      image: primaryImage?.url || '',
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity,
      stock: selectedVariant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pb-10">
      <section className="section-shell pt-8">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-700">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-700">{product.category.name}</Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:gap-12">
          <div className="space-y-4">
            {spinFrames.length >= 8 && (
              <div className="inline-flex rounded-full bg-white/75 p-1">
                <button
                  onClick={() => setActiveView('gallery')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${activeView === 'gallery' ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setActiveView('spin')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${activeView === 'spin' ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
                >
                  360 spin
                </button>
              </div>
            )}

            {activeView === 'spin' && spinFrames.length >= 8 ? (
              <Spin360Viewer frames={spinFrames} title={product.name} />
            ) : (
              <>
                <div className="relative overflow-hidden rounded-[34px] bg-stone-100">
                  <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                    {discount > 0 && (
                      <span className="badge bg-white/92 text-stone-900">{discount}% off</span>
                    )}
                    <span className="badge bg-stone-900 text-white">{product.category.name}</span>
                  </div>
                  <div className="relative aspect-[4/5]">
                    {presentationImages[activeImage] && (
                      <Image
                        src={presentationImages[activeImage].url}
                        alt={presentationImages[activeImage].alt || product.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>
                </div>

                {presentationImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {presentationImages.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(i)}
                        className={`relative aspect-[4/5] overflow-hidden rounded-[20px] border-2 transition-all ${
                          activeImage === i ? 'border-stone-900 shadow-lg' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="card mesh-panel p-7 sm:p-8">
              <span className="eyebrow">Editor select</span>
              <h1 className="mt-5 font-display text-5xl leading-none text-stone-900 sm:text-6xl">{product.name}</h1>
              <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">{product.description}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold text-stone-900">Rs. {product.price.toLocaleString('en-IN')}</span>
                {product.comparePrice && (
                  <span className="text-lg text-stone-400 line-through">Rs. {product.comparePrice.toLocaleString('en-IN')}</span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                    You save {discount}%
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {product.fabric && (
                  <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                    {product.fabric}
                  </span>
                )}
                {product.occasion && (
                  <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                    {product.occasion}
                  </span>
                )}
                {spinFrames.length >= 8 && (
                  <span className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    360 enabled
                  </span>
                )}
              </div>
            </div>

            <div className="card p-6 sm:p-7">
              {colors.length > 0 && (
                <div className="mb-6">
                  <p className="label">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                          selectedColor === color
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="label">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const variant = product.variants.find((v) => v.size === size && (!selectedColor || v.color === selectedColor));
                      const outOfStock = !variant || variant.stock === 0;
                      return (
                        <button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          disabled={outOfStock}
                          className={`min-w-[54px] rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                            selectedSize === size
                              ? 'bg-brand-600 text-white'
                              : outOfStock
                              ? 'cursor-not-allowed bg-stone-100 text-stone-300 line-through'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="label">Quantity</p>
                <div className="flex items-center justify-between gap-4 rounded-[24px] bg-stone-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold shadow-sm">
                      -
                    </button>
                    <span className="w-8 text-center text-lg font-bold text-stone-900">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold shadow-sm">
                      +
                    </button>
                  </div>
                  {selectedVariant && (
                    <span className="text-sm font-medium text-stone-500">{selectedVariant.stock} available</span>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`btn-primary w-full ${added ? 'bg-green-700' : ''}`}
                >
                  {added ? 'Added to cart' : inStock ? 'Add to cart' : 'Out of stock'}
                </button>
                <button
                  onClick={() => { handleAddToCart(); router.push('/cart'); }}
                  disabled={!inStock}
                  className="btn-secondary w-full disabled:opacity-50"
                >
                  Buy now
                </button>
              </div>

              <div className="mt-6 grid gap-3 border-t border-stone-200 pt-6 text-sm text-stone-600 sm:grid-cols-3">
                <div className="rounded-[20px] bg-stone-50 px-4 py-4">Free shipping above Rs. 999</div>
                <div className="rounded-[20px] bg-stone-50 px-4 py-4">7-day easy returns</div>
                <div className="rounded-[20px] bg-stone-50 px-4 py-4">Secure Razorpay payments</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
