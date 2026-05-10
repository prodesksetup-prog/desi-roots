'use client';

import { ProductWithDetails } from '@/types';

type ProductImageInput = {
  url: string;
  alt: string;
  isPrimary?: boolean;
};

type ProductVariantInput = {
  size: string;
  color: string;
  stock: number;
  sku: string;
};

export type ProductFormValue = {
  id?: string;
  name: string;
  categoryName: string;
  description: string;
  price: string;
  comparePrice: string;
  fabric: string;
  occasion: string;
  isFeatured: boolean;
  isActive: boolean;
  galleryImages: ProductImageInput[];
  spinFrames: ProductImageInput[];
  variants: ProductVariantInput[];
};

export function buildInitialProductForm(product?: ProductWithDetails): ProductFormValue {
  if (!product) {
    return {
      name: '',
      categoryName: '',
      description: '',
      price: '',
      comparePrice: '',
      fabric: '',
      occasion: '',
      isFeatured: false,
      isActive: true,
      galleryImages: [{ url: '', alt: '', isPrimary: true }],
      spinFrames: [],
      variants: [{ size: '', color: '', stock: 0, sku: '' }],
    };
  }

  const galleryImages = product.images
    .filter((image) => !image.alt?.startsWith('[360]'))
    .map((image) => ({ url: image.url, alt: image.alt || '', isPrimary: image.isPrimary }));

  const spinFrames = product.images
    .filter((image) => image.alt?.startsWith('[360]'))
    .map((image) => ({ url: image.url, alt: image.alt || '' }));

  return {
    id: product.id,
    name: product.name,
    categoryName: product.category.name,
    description: product.description,
    price: String(product.price),
    comparePrice: product.comparePrice ? String(product.comparePrice) : '',
    fabric: product.fabric || '',
    occasion: product.occasion || '',
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    galleryImages: galleryImages.length ? galleryImages : [{ url: '', alt: '', isPrimary: true }],
    spinFrames,
    variants: product.variants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      sku: variant.sku,
    })),
  };
}

type ProductEditorProps = {
  value: ProductFormValue;
  categorySuggestions: string[];
  onChange: (value: ProductFormValue) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
};

export default function ProductEditor({
  value,
  categorySuggestions,
  onChange,
  onSubmit,
  onCancel,
  saving,
}: ProductEditorProps) {
  const updateField = <K extends keyof ProductFormValue>(field: K, nextValue: ProductFormValue[K]) => {
    onChange({ ...value, [field]: nextValue });
  };

  const updateGalleryImage = (index: number, patch: Partial<ProductImageInput>) => {
    updateField(
      'galleryImages',
      value.galleryImages.map((image, imageIndex) => {
        if (imageIndex !== index) {
          return patch.isPrimary ? { ...image, isPrimary: false } : image;
        }
        return { ...image, ...patch };
      }),
    );
  };

  const updateSpinFrame = (index: number, patch: Partial<ProductImageInput>) => {
    updateField(
      'spinFrames',
      value.spinFrames.map((image, imageIndex) => imageIndex === index ? { ...image, ...patch } : image),
    );
  };

  const updateVariant = (index: number, patch: Partial<ProductVariantInput>) => {
    updateField(
      'variants',
      value.variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, ...patch } : variant),
    );
  };

  return (
    <div className="card mesh-panel p-6 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Product studio</p>
          <h3 className="mt-2 text-3xl font-extrabold text-stone-900">{value.id ? 'Edit product' : 'Add new product'}</h3>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onSubmit} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving...' : value.id ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr,1fr]">
        <div className="space-y-5">
          <div>
            <label className="label">Product name</label>
            <input className="input-field" value={value.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <input
              className="input-field"
              list="category-suggestions"
              value={value.categoryName}
              onChange={(e) => updateField('categoryName', e.target.value)}
            />
            <datalist id="category-suggestions">
              {categorySuggestions.map((category) => <option key={category} value={category} />)}
            </datalist>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field min-h-[150px]"
              value={value.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Price</label>
              <input className="input-field" type="number" value={value.price} onChange={(e) => updateField('price', e.target.value)} />
            </div>
            <div>
              <label className="label">Compare price</label>
              <input className="input-field" type="number" value={value.comparePrice} onChange={(e) => updateField('comparePrice', e.target.value)} />
            </div>
            <div>
              <label className="label">Fabric</label>
              <input className="input-field" value={value.fabric} onChange={(e) => updateField('fabric', e.target.value)} />
            </div>
            <div>
              <label className="label">Occasion</label>
              <input className="input-field" value={value.occasion} onChange={(e) => updateField('occasion', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-[22px] bg-white/80 px-4 py-4 text-sm font-medium text-stone-700">
              <input type="checkbox" checked={value.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)} className="accent-brand-600" />
              Feature on homepage
            </label>
            <label className="flex items-center gap-3 rounded-[22px] bg-white/80 px-4 py-4 text-sm font-medium text-stone-700">
              <input type="checkbox" checked={value.isActive} onChange={(e) => updateField('isActive', e.target.checked)} className="accent-brand-600" />
              Product visible
            </label>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[26px] bg-white/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Gallery images</p>
                <p className="mt-1 text-sm text-stone-500">Set one image as the main storefront thumbnail.</p>
              </div>
              <button
                onClick={() => updateField('galleryImages', [...value.galleryImages, { url: '', alt: '', isPrimary: false }])}
                className="btn-secondary"
              >
                Add image
              </button>
            </div>
            <div className="space-y-4">
              {value.galleryImages.map((image, index) => (
                <div key={`gallery-${index}`} className="rounded-[20px] border border-stone-200 bg-white p-4">
                  <div className="grid gap-3">
                    <input className="input-field" placeholder="Image URL" value={image.url} onChange={(e) => updateGalleryImage(index, { url: e.target.value })} />
                    <input className="input-field" placeholder="Alt text" value={image.alt} onChange={(e) => updateGalleryImage(index, { alt: e.target.value })} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                      <input type="radio" checked={Boolean(image.isPrimary)} onChange={() => updateGalleryImage(index, { isPrimary: true })} className="accent-brand-600" />
                      Primary image
                    </label>
                    {value.galleryImages.length > 1 && (
                      <button
                        onClick={() => updateField('galleryImages', value.galleryImages.filter((_, imageIndex) => imageIndex !== index))}
                        className="text-sm font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] bg-white/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">360 spin frames</p>
                <p className="mt-1 text-sm text-stone-500">Add sequential image URLs to unlock drag-to-spin on the product page.</p>
              </div>
              <button
                onClick={() => updateField('spinFrames', [...value.spinFrames, { url: '', alt: '[360]' }])}
                className="btn-secondary"
              >
                Add frame
              </button>
            </div>
            <div className="space-y-3">
              {value.spinFrames.length === 0 && (
                <div className="rounded-[20px] border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-500">
                  No spin frames yet. Add at least 8 for a convincing 360 experience.
                </div>
              )}
              {value.spinFrames.map((image, index) => (
                <div key={`spin-${index}`} className="flex items-center gap-3 rounded-[20px] border border-stone-200 bg-white p-3">
                  <span className="w-10 text-sm font-semibold text-stone-500">{index + 1}</span>
                  <input className="input-field flex-1" placeholder="Frame image URL" value={image.url} onChange={(e) => updateSpinFrame(index, { url: e.target.value, alt: `[360] Frame ${index + 1}` })} />
                  <button
                    onClick={() => updateField('spinFrames', value.spinFrames.filter((_, imageIndex) => imageIndex !== index))}
                    className="text-sm font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] bg-white/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Variants</p>
                <p className="mt-1 text-sm text-stone-500">Sizes, colors, stock, and SKU all stay editable here.</p>
              </div>
              <button
                onClick={() => updateField('variants', [...value.variants, { size: '', color: '', stock: 0, sku: '' }])}
                className="btn-secondary"
              >
                Add variant
              </button>
            </div>
            <div className="space-y-4">
              {value.variants.map((variant, index) => (
                <div key={`variant-${index}`} className="rounded-[20px] border border-stone-200 bg-white p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="input-field" placeholder="Size" value={variant.size} onChange={(e) => updateVariant(index, { size: e.target.value })} />
                    <input className="input-field" placeholder="Color" value={variant.color} onChange={(e) => updateVariant(index, { color: e.target.value })} />
                    <input className="input-field" type="number" placeholder="Stock" value={variant.stock} onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })} />
                    <input className="input-field" placeholder="SKU" value={variant.sku} onChange={(e) => updateVariant(index, { sku: e.target.value })} />
                  </div>
                  {value.variants.length > 1 && (
                    <div className="mt-3 text-right">
                      <button
                        onClick={() => updateField('variants', value.variants.filter((_, variantIndex) => variantIndex !== index))}
                        className="text-sm font-semibold text-red-600"
                      >
                        Remove variant
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
