// types/index.ts
import { Product, ProductImage, ProductVariant, Category, Order, OrderItem, OrderTracking, Address } from '@prisma/client';

export type ProductWithDetails = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category;
};

export type OrderWithDetails = Order & {
  items: OrderItem[];
  address: Address;
  tracking: OrderTracking[];
};

export type CartItemType = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
};

// Extend NextAuth session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}
