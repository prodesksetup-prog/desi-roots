// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getDatabaseConfigMessage, isPrismaConnectionError } from '@/lib/database-error';
import ProductCard from '@/components/shop/ProductCard';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    return await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { images: true, variants: true, category: true },
      take: 4,
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      console.error('FEATURED PRODUCTS ERROR:', getDatabaseConfigMessage());
      return [];
    }

    console.error('FEATURED PRODUCTS ERROR:', error);
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-stone-900 text-white overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent z-10" />
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400"
          alt="Indian ethnic wear"
          fill
          className="object-cover object-center opacity-60"
          priority
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <p className="text-brand-300 text-sm tracking-[0.4em] uppercase mb-4 font-medium">
            Celebrating India's Heritage
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-2xl">
            Where Roots <br />
            <span className="text-brand-400 italic">Meet Elegance</span>
          </h1>
          <p className="text-stone-300 text-lg max-w-md mb-10 leading-relaxed">
            Handcrafted ethnic wear that carries the soul of India — from our looms to your wardrobe.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="btn-primary text-base">
              Explore Collection
            </Link>
            <Link href="/products?category=sarees" className="btn-secondary border-white text-white hover:bg-white hover:text-stone-900 text-base">
              View Sarees
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-stone-800 mb-2">Shop by Category</h2>
          <p className="text-stone-500">Discover our curated collections</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Sarees', slug: 'sarees', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', emoji: '🥻' },
            { name: 'Salwar Suits', slug: 'salwar-suits', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4ee1?w=400', emoji: '👗' },
            { name: 'Kurtis & Tops', slug: 'kurtis', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', emoji: '👘' },
            { name: 'Lehengas', slug: 'lehengas', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400', emoji: '✨' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-sm overflow-hidden aspect-[3/4] bg-stone-200"
            >
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-display text-lg font-semibold">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-stone-800 mb-1">Featured Picks</h2>
              <p className="text-stone-500">Handpicked favourites from our collection</p>
            </div>
            <Link href="/products" className="btn-ghost text-sm hidden sm:block">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'Orders above ₹999' },
            { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy' },
            { icon: '🔒', title: 'Secure Payment', desc: 'Powered by Razorpay' },
            { icon: '🌿', title: 'Authentic Fabrics', desc: 'Direct from artisans' },
          ].map((badge) => (
            <div key={badge.title} className="text-center py-6 px-4 border border-stone-200 bg-white rounded-sm">
              <div className="text-3xl mb-2">{badge.icon}</div>
              <h4 className="font-semibold text-stone-800 text-sm">{badge.title}</h4>
              <p className="text-stone-500 text-xs mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
