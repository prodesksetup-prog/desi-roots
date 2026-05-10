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
  const categories = [
    {
      name: 'Sarees',
      slug: 'sarees',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900',
      note: 'Draped for celebrations and slow weekends alike.',
    },
    {
      name: 'Salwar Suits',
      slug: 'salwar-suits',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4ee1?w=900',
      note: 'Sharper tailoring with effortless comfort built in.',
    },
    {
      name: 'Kurtis',
      slug: 'kurtis',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900',
      note: 'Everyday silhouettes elevated with craft-led detailing.',
    },
    {
      name: 'Lehengas',
      slug: 'lehengas',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900',
      note: 'Statement pieces for weddings, soirees, and festive nights.',
    },
  ];

  return (
    <div className="pb-8">
      <section className="section-shell pt-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="relative overflow-hidden rounded-[38px] bg-stone-950 px-6 py-10 text-white sm:px-8 sm:py-12 lg:min-h-[700px] lg:px-10">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600"
              alt="Indian ethnic wear"
              fill
              className="object-cover opacity-45"
              priority
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,193,121,0.34),transparent_34%),linear-gradient(135deg,rgba(20,13,9,0.72),rgba(35,20,14,0.92)_55%,rgba(111,56,25,0.78))]" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div className="max-w-3xl">
                <span className="eyebrow border-white/20 bg-white/8 text-amber-100">Heritage rewired for now</span>
                <h1 className="mt-6 font-display text-6xl leading-[0.92] text-white sm:text-7xl lg:text-[6.3rem]">
                  Modern Indian dressing,
                  <span className="block text-amber-200"> cut with more attitude.</span>
                </h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-stone-200 sm:text-base">
                  Discover sarees, kurtis, lehengas, and tailored festive layers reimagined with lighter styling, richer textures, and a cleaner luxury finish.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap gap-3">
                  <Link href="/products" className="btn-primary">
                    Shop the collection
                  </Link>
                  <Link href="/products?category=sarees" className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white hover:text-stone-900">
                    Start with sarees
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: '1200+', label: 'Looks curated for weddings, workdays, and weekend plans' },
                    { value: '4.8/5', label: 'Rated for fabric feel, fit, and finish' },
                    { value: '7-day', label: 'Return window with secure checkout support' },
                  ].map((item) => (
                    <div key={item.value} className="glass-card p-4">
                      <p className="text-2xl font-extrabold text-white">{item.value}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-300">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="card mesh-panel overflow-hidden p-6 sm:p-7">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <span className="eyebrow">This season</span>
                  <h2 className="mt-4 font-display text-4xl leading-none text-stone-900 sm:text-5xl">Polished silhouettes, softer shine, easier styling.</h2>
                </div>
                <span className="hidden rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white sm:inline-flex">
                  New edit
                </span>
              </div>
              <p className="mt-5 section-copy max-w-md">
                Think elevated day kurtas, occasion sarees with cleaner drape stories, and lehengas that feel striking without feeling heavy.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map((category) => (
                <Link key={category.slug} href={`/products?category=${category.slug}`} className="group relative overflow-hidden rounded-[30px] bg-stone-200 p-5 text-white">
                  <div className="absolute inset-0">
                    <Image src={category.image} alt={category.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  </div>
                  <div className="relative z-10 flex min-h-[240px] flex-col justify-end">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-200">Category</p>
                    <h3 className="mt-2 font-display text-4xl text-white">{category.name}</h3>
                    <p className="mt-2 max-w-xs text-sm text-stone-200">{category.note}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Featured now</span>
            <h2 className="mt-4 section-title text-[2.8rem] sm:text-5xl">Best-selling pieces, styled for today.</h2>
            <p className="mt-3 max-w-xl section-copy">
              Four editor-approved picks to start with if you want the full Desi Roots mood in one go.
            </p>
          </div>
          <Link href="/products" className="btn-ghost">
            View all products
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="card mesh-panel p-7 sm:p-8">
            <span className="eyebrow">Brand point of view</span>
            <h2 className="mt-4 font-display text-5xl leading-none text-stone-900">Indian craft deserves a more contemporary frame.</h2>
            <p className="mt-4 section-copy">
              We blend heirloom references with cleaner lines, lighter proportions, and wardrobe-minded styling so each piece feels special, but still wearable beyond the occasion.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Artisan-led textures and trims',
                'Tailored fits for modern styling',
                'Festive color stories with softer balance',
                'Quick, intuitive shopping across every screen',
              ].map((point) => (
                <div key={point} className="rounded-[24px] border border-stone-200/80 bg-white/70 px-4 py-4 text-sm font-medium text-stone-700">
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Express delivery', copy: 'Fast dispatch with free shipping over Rs. 999.' },
              { title: 'Secure checkout', copy: 'Protected payment experience powered by Razorpay.' },
              { title: 'Easy exchanges', copy: 'Seven-day return support for a smoother fit journey.' },
              { title: 'Curated edits', copy: 'Cleaner discovery across festive, casual, and workwear moods.' },
            ].map((item) => (
              <div key={item.title} className="stat-card">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Promise</p>
                <h3 className="mt-4 text-2xl font-extrabold text-stone-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
