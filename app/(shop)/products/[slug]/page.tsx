'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { ProductWithDetails } from '@/types';
import Link from 'next/link';

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
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
      <div className="aspect-[3/4] bg-stone-200 rounded-sm" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-stone-200 rounded" />)}
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-stone-500">Product not found.</div>;

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.filter((v) => !selectedColor || v.color === selectedColor).map((v) => v.size))];
  const selectedVariant = product.variants.find((v) =>
    (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize)
  );
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.variants.some((v) => v.stock > 0);
  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0];
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-600">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-600">{product.category.name}</Link>
        <span>/</span>
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] bg-stone-100 rounded-sm overflow-hidden">
            {product.images[activeImage] && (
              <Image
                src={product.images[activeImage].url}
                alt={product.images[activeImage].alt || product.name}
                fill
                className="object-cover"
                priority
              />
            )}
            {discount > 0 && (
              <span className="absolute top-3 left-3 badge bg-brand-600 text-white text-sm px-3">
                {discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-20 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-brand-600' : 'border-transparent'
                  }`}
                >
                  <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-brand-600 font-medium tracking-widest uppercase mb-1">{product.category.name}</p>
            <h1 className="font-display text-3xl font-bold text-stone-800 leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-stone-800">₹{product.price.toLocaleString('en-IN')}</span>
            {product.comparePrice && (
              <>
                <span className="text-stone-400 line-through text-lg">₹{product.comparePrice.toLocaleString('en-IN')}</span>
                <span className="badge bg-green-100 text-green-700">{discount}% off</span>
              </>
            )}
          </div>

          <p className="text-stone-600 leading-relaxed text-sm">{product.description}</p>

          {/* Fabric & Occasion */}
          <div className="flex gap-4 text-sm">
            {product.fabric && (
              <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-sm">🧵 {product.fabric}</span>
            )}
            {product.occasion && (
              <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-sm">✨ {product.occasion}</span>
            )}
          </div>

          {/* Color selector */}
          {colors.length > 0 && (
            <div>
              <p className="label">Color: <span className="text-brand-600 font-semibold">{selectedColor || 'Select'}</span></p>
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                    className={`px-4 py-1.5 border text-sm rounded-sm transition-all ${
                      selectedColor === color
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-medium'
                        : 'border-stone-300 text-stone-600 hover:border-brand-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {sizes.length > 1 && (
            <div>
              <p className="label">Size: <span className="text-brand-600 font-semibold">{selectedSize || 'Select'}</span></p>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size) => {
                  const variant = product.variants.find((v) => v.size === size && (!selectedColor || v.color === selectedColor));
                  const outOfStock = !variant || variant.stock === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`w-12 h-10 border text-sm rounded-sm transition-all ${
                        selectedSize === size
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-medium'
                          : outOfStock
                          ? 'border-stone-200 text-stone-300 cursor-not-allowed line-through'
                          : 'border-stone-300 text-stone-600 hover:border-brand-400'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="label">Quantity</p>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 border border-stone-300 rounded-sm text-lg hover:border-brand-400 transition-colors">−</button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))}
                className="w-9 h-9 border border-stone-300 rounded-sm text-lg hover:border-brand-400 transition-colors">+</button>
              {selectedVariant && (
                <span className="text-xs text-stone-400">{selectedVariant.stock} in stock</span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 btn-primary text-center disabled:opacity-50 ${added ? 'bg-green-600' : ''}`}
            >
              {added ? '✓ Added to Cart' : inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              onClick={() => { handleAddToCart(); router.push('/cart'); }}
              disabled={!inStock}
              className="flex-1 btn-secondary text-center disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Shipping info */}
          <div className="border-t border-stone-200 pt-4 space-y-2 text-sm text-stone-500">
            <p>🚚 Free shipping on orders above ₹999</p>
            <p>↩️ 7-day easy returns & exchanges</p>
            <p>🔒 Secure payment via Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
