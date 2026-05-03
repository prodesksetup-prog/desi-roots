// app/api/payment/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items, addressId, shippingAmount } = await req.json();
  if (!items?.length || !addressId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const address = await prisma.address.findFirst({ where: { id: addressId, userId: session.user.id } });
  if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

  // Validate variants & stock
  const variantIds = items.map((i: any) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { include: { images: true } } },
  });

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) return NextResponse.json({ error: `Variant not found` }, { status: 400 });
    if (variant.stock < item.quantity) return NextResponse.json({ error: `${variant.product.name} is out of stock` }, { status: 400 });
  }

  const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  const totalAmount = subtotal + (shippingAmount || 0);

  // Create Razorpay order
  const rpOrder = await createRazorpayOrder(totalAmount, `order_${Date.now()}`);

  // Create DB order
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      addressId,
      totalAmount,
      shippingAmount: shippingAmount || 0,
      razorpayOrderId: rpOrder.id,
      paymentMethod: 'razorpay',
      items: {
        create: items.map((item: any) => {
          const variant = variants.find((v) => v.id === item.variantId)!;
          const image = variant.product.images.find((i: any) => i.isPrimary) || variant.product.images[0];
          return {
            productId: variant.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: variant.product.name,
            size: variant.size,
            color: variant.color,
            image: image?.url || null,
          };
        }),
      },
      tracking: {
        create: {
          status: 'PENDING',
          message: 'Order placed, awaiting payment confirmation',
        },
      },
    },
  });

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: rpOrder.id,
    amount: totalAmount,
    currency: 'INR',
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
