'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ProductWithDetails } from '@/types';

export default function ProductCard({ product }: { product: ProductWithDetails }) {
  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Image */}
        <div className="product-img-wrap relative aspect-[3/4] bg-stone-100">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 badge bg-brand-600 text-white">
              {discount}% OFF
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-stone-600 font-medium text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-stone-400 mb-1">{product.category.name}</p>
          <h3 className="text-sm font-medium text-stone-800 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-stone-800">₹{product.price.toLocaleString('en-IN')}</span>
            {product.comparePrice && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.comparePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
