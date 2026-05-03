import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic"; // 🔥 IMPORTANT

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = await req.json();

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentId: razorpayPaymentId,
        },
      }),
      prisma.orderTracking.create({
        data: {
          orderId,
          status: 'CONFIRMED',
          message: 'Payment confirmed. Your order is being prepared.',
        },
      }),
      ...order.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
    ]);

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('VERIFY PAYMENT ERROR:', error);

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}