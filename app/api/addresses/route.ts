// app/api/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { isDefault: 'desc' } });
  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  const { name, phone, line1, line2, city, state, pincode, isDefault } = data;

  if (!name || !phone || !line1 || !city || !state || !pincode)
    return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { userId: session.user.id, name, phone, line1, line2, city, state, pincode, isDefault: isDefault || false },
  });

  return NextResponse.json(address, { status: 201 });
}
