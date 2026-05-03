// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const where = status ? { status: status as any } : {};
  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, items: true, address: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(orders);
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { orderId, status, message } = await req.json();
  const order = await prisma.order.update({ where: { id: orderId }, data: { status } });
  await prisma.orderTracking.create({ data: { orderId, status, message: message || `Order status updated to ${status}` } });
  return NextResponse.json(order);
}
