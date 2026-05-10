import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function ensureUniqueProductSlug(name: string, existingId?: string) {
  const base = slugify(name);
  let slug = base;
  let attempt = 1;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === existingId) {
      return slug;
    }
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
}

async function ensureCategory(categoryName: string) {
  const name = categoryName.trim();
  const slug = slugify(name);

  const existing = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        { slug },
      ],
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.category.create({
    data: {
      name,
      slug,
      description: `${name} collection`,
    },
  });
}

function sanitizeImages(images: any[] = []) {
  return images
    .filter((image) => image?.url?.trim())
    .map((image, index) => ({
      url: image.url.trim(),
      alt: image.alt?.trim() || null,
      isPrimary: index === 0 ? true : Boolean(image.isPrimary),
    }))
    .map((image, index, arr) => ({
      ...image,
      isPrimary: arr.some((entry) => entry.isPrimary) ? image.isPrimary : index === 0,
    }));
}

function sanitizeVariants(variants: any[] = []) {
  return variants
    .filter((variant) => variant?.size?.trim() && variant?.color?.trim())
    .map((variant, index) => ({
      size: variant.size.trim(),
      color: variant.color.trim(),
      stock: Number(variant.stock || 0),
      sku: variant.sku?.trim() || `SKU-${Date.now()}-${index + 1}`,
    }));
}

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const products = await prisma.product.findMany({
    include: { images: true, variants: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const { images = [], variants = [], categoryName, ...data } = body;

  if (!categoryName?.trim()) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  const category = await ensureCategory(categoryName);
  const sanitizedImages = sanitizeImages(images);
  const sanitizedVariants = sanitizeVariants(variants);
  const slug = await ensureUniqueProductSlug(data.name);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: Number(data.price),
      comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
      categoryId: category.id,
      fabric: data.fabric || null,
      occasion: data.occasion || null,
      isFeatured: Boolean(data.isFeatured),
      isActive: data.isActive !== false,
      images: sanitizedImages.length ? { create: sanitizedImages } : undefined,
      variants: sanitizedVariants.length ? { create: sanitizedVariants } : undefined,
    },
    include: { images: true, variants: true, category: true },
  });

  return NextResponse.json(product, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, images = [], variants = [], categoryName, ...data } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
  }

  if (!categoryName?.trim()) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  const category = await ensureCategory(categoryName);
  const sanitizedImages = sanitizeImages(images);
  const sanitizedVariants = sanitizeVariants(variants);
  const slug = await ensureUniqueProductSlug(data.name, id);

  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: Number(data.price),
        comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
        categoryId: category.id,
        fabric: data.fabric || null,
        occasion: data.occasion || null,
        isFeatured: Boolean(data.isFeatured),
        isActive: data.isActive !== false,
        images: sanitizedImages.length ? { create: sanitizedImages } : undefined,
        variants: sanitizedVariants.length ? { create: sanitizedVariants } : undefined,
      },
      include: { images: true, variants: true, category: true },
    });
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
