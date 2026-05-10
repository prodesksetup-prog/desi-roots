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
      <div className="card overflow-hidden transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_32px_90px_-48px_rgba(22,16,12,0.85)]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
          {discount > 0 && (
            <span className="badge absolute left-3 top-3 bg-white/92 text-stone-900">
              {discount}% off
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/72 backdrop-blur-sm">
              <span className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Out of stock
              </span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="rounded-full border border-white/30 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">
              {product.category.name}
            </span>
            <span className="text-sm font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Explore
            </span>
          </div>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-stone-900 transition-colors group-hover:text-brand-700">
            {product.name}
          </h3>
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-stone-900">Rs. {product.price.toLocaleString('en-IN')}</span>
              {product.comparePrice && (
                <span className="text-xs text-stone-400 line-through">
                  Rs. {product.comparePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.comparePrice && (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Save {discount}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
