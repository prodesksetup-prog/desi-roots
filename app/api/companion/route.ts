import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parseBudget(message: string) {
  const lower = message.toLowerCase();
  const numbers = lower.match(/\d[\d,]*/g)?.map((value) => Number(value.replace(/,/g, ''))) || [];

  if (lower.includes('under') || lower.includes('below') || lower.includes('less than')) {
    return { max: numbers[0] || undefined };
  }

  if (lower.includes('above') || lower.includes('over') || lower.includes('more than')) {
    return { min: numbers[0] || undefined };
  }

  if ((lower.includes('between') || lower.includes('from')) && numbers.length >= 2) {
    return { min: numbers[0], max: numbers[1] };
  }

  return {};
}

function parseIntent(message: string) {
  const lower = message.toLowerCase();
  const category =
    lower.includes('saree') ? 'sarees'
    : lower.includes('lehenga') ? 'lehengas'
    : lower.includes('kurti') ? 'kurtis'
    : lower.includes('salwar') || lower.includes('suit') ? 'salwar-suits'
    : undefined;

  const occasion =
    lower.includes('bridal') ? 'Bridal'
    : lower.includes('wedding') ? 'Wedding'
    : lower.includes('party') ? 'Party'
    : lower.includes('office') || lower.includes('work') ? 'Office'
    : lower.includes('festive') || lower.includes('festival') ? 'Festive'
    : lower.includes('casual') || lower.includes('daily') || lower.includes('everyday') ? 'Casual'
    : undefined;

  const budget = parseBudget(message);

  return { category, occasion, ...budget };
}

export async function POST(req: NextRequest) {
  const { message = '' } = await req.json();
  const filters = parseIntent(message);

  const where: any = { isActive: true };
  if (filters.category) where.category = { slug: filters.category };
  if (filters.occasion) where.occasion = filters.occasion;
  if (filters.min || filters.max) {
    where.price = {};
    if (filters.min) where.price.gte = filters.min;
    if (filters.max) where.price.lte = filters.max;
  }

  const products = await prisma.product.findMany({
    where,
    include: { images: true, variants: true, category: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 4,
  });

  const fallbackProducts = products.length
    ? products
    : await prisma.product.findMany({
        where: { isActive: true },
        include: { images: true, variants: true, category: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 4,
      });

  let reply = 'I pulled a few strong matches from the current catalog.';
  if (filters.occasion && filters.category) {
    reply = `Here are some ${filters.occasion.toLowerCase()} ${filters.category.replace('-', ' ')} picks that fit your ask.`;
  } else if (filters.occasion) {
    reply = `Here are some ${filters.occasion.toLowerCase()}-ready picks from the collection.`;
  } else if (filters.category) {
    reply = `Here are the best ${filters.category.replace('-', ' ')} matches I found right now.`;
  }

  if (!products.length) {
    reply = 'I did not find an exact catalog match, so I surfaced the closest featured options instead.';
  }

  return NextResponse.json({
    reply,
    filters,
    products: fallbackProducts,
    quickReplies: [
      'Show me wedding looks under 5000',
      'I need an office-ready kurti',
      'Suggest festive sarees',
      'What should I wear for a party?',
    ],
  });
}
