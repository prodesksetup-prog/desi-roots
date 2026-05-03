// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
  const { images, variants, ...data } = body;

  const product = await prisma.product.create({
    data: {
      ...data,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      images: images?.length ? { create: images } : undefined,
      variants: variants?.length ? { create: variants } : undefined,
    },
    include: { images: true, variants: true, category: true },
  });
  return NextResponse.json(product, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, ...data } = await req.json();
  const product = await prisma.product.update({ where: { id }, data, include: { images: true, variants: true, category: true } });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
