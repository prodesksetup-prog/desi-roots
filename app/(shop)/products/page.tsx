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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-800">
            {filters.category
              ? CATEGORIES.find((c) => c.value === filters.category)?.label || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-stone-500 text-sm mt-1">{total} items found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            className="input-field !py-2 text-sm w-40 sm:w-56"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
          {/* Sort */}
          <select
            className="input-field !py-2 text-sm"
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Mobile filter toggle */}
          <button
            className="md:hidden btn-secondary !py-2 !px-3 text-sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-56 flex-shrink-0`}>
          <div className="card p-5 sticky top-24 space-y-6">
            {/* Category */}
            <div>
              <h3 className="font-semibold text-stone-700 text-sm mb-3 uppercase tracking-wide">Category</h3>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFilter('category', cat.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-sm text-sm transition-colors ${
                      filters.category === cat.value
                        ? 'bg-brand-600 text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-stone-700 text-sm mb-3 uppercase tracking-wide">Price (₹)</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="input-field !py-1.5 text-sm"
                  value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="input-field !py-1.5 text-sm"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter('maxPrice', e.target.value)}
                />
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {[['Under ₹1000', '0', '1000'], ['₹1k–5k', '1000', '5000'], ['Above ₹5k', '5000', '']].map(([label, min, max]) => (
                  <button
                    key={label}
                    onClick={() => setFilters((f) => ({ ...f, minPrice: min, maxPrice: max, page: 1 }))}
                    className="text-xs px-2 py-1 bg-stone-100 hover:bg-brand-100 hover:text-brand-700 rounded-sm text-stone-600 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion */}
            <div>
              <h3 className="font-semibold text-stone-700 text-sm mb-3 uppercase tracking-wide">Occasion</h3>
              <div className="space-y-1.5">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setFilter('occasion', occ)}
                    className={`w-full text-left px-3 py-1.5 rounded-sm text-sm transition-colors ${
                      filters.occasion === occ
                        ? 'bg-brand-600 text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {occ || 'All Occasions'}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            <button
              onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', occasion: '', sort: 'newest', search: '', page: 1 })}
              className="w-full text-sm text-red-500 hover:text-red-700 text-left"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-stone-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-stone-200 rounded w-2/3" />
                    <div className="h-3 bg-stone-200 rounded" />
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="font-display text-xl text-stone-700 mb-2">No products found</h3>
              <p className="text-stone-500 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
