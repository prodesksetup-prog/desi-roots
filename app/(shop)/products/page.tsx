'use client';
import { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import { ProductWithDetails } from '@/types';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Sarees', value: 'sarees' },
  { label: 'Salwar Suits', value: 'salwar-suits' },
  { label: 'Kurtis & Tops', value: 'kurtis' },
  { label: 'Lehengas', value: 'lehengas' },
];

const OCCASIONS = ['', 'Wedding', 'Casual', 'Party', 'Office', 'Festive', 'Bridal'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name A-Z', value: 'name' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    occasion: '',
    sort: 'newest',
    search: '',
    page: 1,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setFilters((current) => ({
      ...current,
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      occasion: searchParams.get('occasion') || '',
      sort: searchParams.get('sort') || 'newest',
      search: searchParams.get('search') || '',
    }));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key: string, value: string) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="pb-8">
      <section className="section-shell pt-8">
        <div className="card mesh-panel overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">Storefront</span>
              <h1 className="mt-4 font-display text-5xl leading-none text-stone-900 sm:text-6xl">
                {filters.category
                  ? CATEGORIES.find((c) => c.value === filters.category)?.label || 'Products'
                  : 'All Products'}
              </h1>
              <p className="mt-3 section-copy">
                Refined ethnic wear with cleaner styling, richer fabrics, and a wardrobe-first point of view. {total} pieces currently match your filters.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),220px,auto]">
              <input
                type="text"
                placeholder="Search by name, mood, or occasion"
                className="input-field min-w-0"
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
              />
              <select
                className="input-field"
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                className="btn-secondary md:hidden"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                Filters
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter('category', cat.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  filters.category === cat.value
                    ? 'bg-stone-900 text-white'
                    : 'bg-white/72 text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell pb-16">
        <div className="flex gap-8">
          <aside className={`${filtersOpen ? 'fixed inset-0 z-40 flex bg-black/30 p-4 backdrop-blur-sm md:static md:bg-transparent md:p-0' : 'hidden md:block'} w-full md:w-72 md:flex-shrink-0`}>
            <div className="card h-fit w-full space-y-6 p-5 md:sticky md:top-28">
              <div className="flex items-center justify-between md:block">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Filters</p>
                  <h3 className="mt-1 text-xl font-extrabold text-stone-900">Refine your edit</h3>
                </div>
                <button className="btn-ghost md:hidden" onClick={() => setFiltersOpen(false)}>Close</button>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Category</h3>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setFilter('category', cat.value)}
                      className={`w-full rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition-all ${
                        filters.category === cat.value
                          ? 'bg-stone-900 text-white'
                          : 'bg-white/68 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Price</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field"
                    value={filters.minPrice}
                    onChange={(e) => setFilter('minPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field"
                    value={filters.maxPrice}
                    onChange={(e) => setFilter('maxPrice', e.target.value)}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[['Under Rs. 1000', '0', '1000'], ['Rs. 1k-5k', '1000', '5000'], ['Above Rs. 5k', '5000', '']].map(([label, min, max]) => (
                    <button
                      key={label}
                      onClick={() => setFilters((f) => ({ ...f, minPrice: min, maxPrice: max, page: 1 }))}
                      className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 hover:bg-brand-50 hover:text-brand-700"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Occasion</h3>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setFilter('occasion', occ)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        filters.occasion === occ
                          ? 'bg-brand-600 text-white'
                          : 'bg-white/68 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {occ || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', occasion: '', sort: 'newest', search: '', page: 1 })}
                className="btn-ghost justify-start text-red-600 hover:text-red-700"
              >
                Clear all filters
              </button>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-stone-200" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-24 rounded-full bg-stone-200" />
                      <div className="h-5 rounded-full bg-stone-200" />
                      <div className="h-5 w-2/3 rounded-full bg-stone-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="card px-6 py-16 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">No results</p>
                <h3 className="mt-4 font-display text-4xl text-stone-900">Nothing matched that edit.</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-stone-600">
                  Try widening your price range, clearing the occasion filter, or searching for a different silhouette.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  <span>{total} curated matches</span>
                  <span>{filters.sort.replace('-', ' ')}</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
