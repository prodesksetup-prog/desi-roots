// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@desiroots.in' },
    update: {},
    create: {
      email: 'admin@desiroots.in',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Test customer
  const customerPassword = await bcrypt.hash('customer@123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Priya Sharma',
      password: customerPassword,
      phone: '9876543210',
      role: 'CUSTOMER',
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sarees' },
      update: {},
      create: { name: 'Sarees', slug: 'sarees', description: 'Traditional & designer sarees', image: '/images/cat-sarees.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'salwar-suits' },
      update: {},
      create: { name: 'Salwar Suits', slug: 'salwar-suits', description: 'Elegant salwar kameez & suits', image: '/images/cat-salwar.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'kurtis' },
      update: {},
      create: { name: 'Kurtis & Tops', slug: 'kurtis', description: 'Stylish kurtis and Indian tops', image: '/images/cat-kurtis.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'lehengas' },
      update: {},
      create: { name: 'Lehengas', slug: 'lehengas', description: 'Bridal & party lehengas', image: '/images/cat-lehengas.jpg' },
    }),
  ]);

  const [sarees, salwarSuits, kurtis, lehengas] = categories;

  // Products
  const products = [
    {
      name: 'Banarasi Silk Saree - Royal Blue',
      slug: 'banarasi-silk-saree-royal-blue',
      description: 'Exquisite Banarasi silk saree with intricate zari work. Perfect for weddings and festive occasions. Comes with an unstitched blouse piece.',
      price: 4500,
      comparePrice: 6000,
      categoryId: sarees.id,
      fabric: 'Banarasi Silk',
      occasion: 'Wedding',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', isPrimary: true, alt: 'Banarasi Silk Saree Royal Blue' },
      ],
      variants: [
        { size: 'Free Size', color: 'Royal Blue', stock: 15, sku: 'SAR-BAN-001-BLU' },
        { size: 'Free Size', color: 'Deep Red', stock: 10, sku: 'SAR-BAN-001-RED' },
      ],
    },
    {
      name: 'Chanderi Cotton Saree - Pastel Pink',
      slug: 'chanderi-cotton-saree-pastel-pink',
      description: 'Lightweight Chanderi cotton saree with delicate floral prints. Ideal for casual and semi-formal occasions.',
      price: 1800,
      comparePrice: 2500,
      categoryId: sarees.id,
      fabric: 'Chanderi Cotton',
      occasion: 'Casual',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600', isPrimary: true, alt: 'Chanderi Cotton Saree' },
      ],
      variants: [
        { size: 'Free Size', color: 'Pastel Pink', stock: 20, sku: 'SAR-CHA-002-PNK' },
        { size: 'Free Size', color: 'Mint Green', stock: 18, sku: 'SAR-CHA-002-GRN' },
      ],
    },
    {
      name: 'Anarkali Salwar Suit - Emerald Green',
      slug: 'anarkali-salwar-suit-emerald-green',
      description: 'Floor-length Anarkali suit in georgette fabric with heavy embroidery. Comes with churidar and dupatta.',
      price: 3200,
      comparePrice: 4500,
      categoryId: salwarSuits.id,
      fabric: 'Georgette',
      occasion: 'Party',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4ee1?w=600', isPrimary: true, alt: 'Anarkali Salwar Suit' },
      ],
      variants: [
        { size: 'S', color: 'Emerald Green', stock: 8, sku: 'SAL-ANK-001-GRN-S' },
        { size: 'M', color: 'Emerald Green', stock: 12, sku: 'SAL-ANK-001-GRN-M' },
        { size: 'L', color: 'Emerald Green', stock: 10, sku: 'SAL-ANK-001-GRN-L' },
        { size: 'XL', color: 'Emerald Green', stock: 6, sku: 'SAL-ANK-001-GRN-XL' },
      ],
    },
    {
      name: 'Punjabi Patiala Suit - Mustard Yellow',
      slug: 'punjabi-patiala-suit-mustard-yellow',
      description: 'Traditional Punjabi Patiala suit with phulkari embroidery. Light cotton fabric, perfect for summers.',
      price: 1500,
      comparePrice: 2000,
      categoryId: salwarSuits.id,
      fabric: 'Cotton',
      occasion: 'Casual',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1601925228269-c95e9f62f763?w=600', isPrimary: true, alt: 'Patiala Suit' },
      ],
      variants: [
        { size: 'S', color: 'Mustard Yellow', stock: 15, sku: 'SAL-PAT-002-YLW-S' },
        { size: 'M', color: 'Mustard Yellow', stock: 20, sku: 'SAL-PAT-002-YLW-M' },
        { size: 'L', color: 'Mustard Yellow', stock: 18, sku: 'SAL-PAT-002-YLW-L' },
      ],
    },
    {
      name: 'Block Print Straight Kurti - Indigo',
      slug: 'block-print-straight-kurti-indigo',
      description: 'Hand block printed straight kurti in pure cotton. Features traditional Rajasthani prints with beautiful indigo dye.',
      price: 850,
      comparePrice: 1200,
      categoryId: kurtis.id,
      fabric: 'Pure Cotton',
      occasion: 'Casual',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', isPrimary: true, alt: 'Block Print Kurti' },
      ],
      variants: [
        { size: 'XS', color: 'Indigo', stock: 10, sku: 'KUR-BLK-001-IND-XS' },
        { size: 'S', color: 'Indigo', stock: 20, sku: 'KUR-BLK-001-IND-S' },
        { size: 'M', color: 'Indigo', stock: 25, sku: 'KUR-BLK-001-IND-M' },
        { size: 'L', color: 'Indigo', stock: 20, sku: 'KUR-BLK-001-IND-L' },
        { size: 'XL', color: 'Indigo', stock: 15, sku: 'KUR-BLK-001-IND-XL' },
        { size: 'XXL', color: 'Indigo', stock: 8, sku: 'KUR-BLK-001-IND-XXL' },
      ],
    },
    {
      name: 'Embroidered A-Line Kurti - Terracotta',
      slug: 'embroidered-aline-kurti-terracotta',
      description: 'A-line kurti with beautiful thread embroidery on yoke. Comfortable rayon fabric with side slits.',
      price: 1100,
      comparePrice: 1500,
      categoryId: kurtis.id,
      fabric: 'Rayon',
      occasion: 'Office',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1562572159-4efd90232a5a?w=600', isPrimary: true, alt: 'Embroidered Kurti' },
      ],
      variants: [
        { size: 'S', color: 'Terracotta', stock: 18, sku: 'KUR-EMB-002-TER-S' },
        { size: 'M', color: 'Terracotta', stock: 22, sku: 'KUR-EMB-002-TER-M' },
        { size: 'L', color: 'Terracotta', stock: 20, sku: 'KUR-EMB-002-TER-L' },
        { size: 'XL', color: 'Terracotta', stock: 12, sku: 'KUR-EMB-002-TER-XL' },
      ],
    },
    {
      name: 'Bridal Lehenga Choli - Crimson Red',
      slug: 'bridal-lehenga-choli-crimson-red',
      description: 'Stunning bridal lehenga with heavy zari and stonework embroidery. Includes lehenga, choli and dupatta. Perfect for wedding ceremonies.',
      price: 18000,
      comparePrice: 25000,
      categoryId: lehengas.id,
      fabric: 'Velvet & Net',
      occasion: 'Bridal',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600', isPrimary: true, alt: 'Bridal Lehenga' },
      ],
      variants: [
        { size: 'S', color: 'Crimson Red', stock: 3, sku: 'LEH-BRI-001-RED-S' },
        { size: 'M', color: 'Crimson Red', stock: 5, sku: 'LEH-BRI-001-RED-M' },
        { size: 'L', color: 'Crimson Red', stock: 4, sku: 'LEH-BRI-001-RED-L' },
        { size: 'XL', color: 'Crimson Red', stock: 2, sku: 'LEH-BRI-001-RED-XL' },
      ],
    },
    {
      name: 'Floral Georgette Lehenga - Powder Blue',
      slug: 'floral-georgette-lehenga-powder-blue',
      description: 'Elegant georgette lehenga with floral prints and sequence work. Great for mehendi, sangeet and festive functions.',
      price: 5500,
      comparePrice: 7500,
      categoryId: lehengas.id,
      fabric: 'Georgette',
      occasion: 'Festive',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1609902726285-00668009f004?w=600', isPrimary: true, alt: 'Floral Lehenga' },
      ],
      variants: [
        { size: 'S', color: 'Powder Blue', stock: 6, sku: 'LEH-FLO-002-BLU-S' },
        { size: 'M', color: 'Powder Blue', stock: 8, sku: 'LEH-FLO-002-BLU-M' },
        { size: 'L', color: 'Powder Blue', stock: 7, sku: 'LEH-FLO-002-BLU-L' },
      ],
    },
  ];

  for (const product of products) {
    const { images, variants, ...productData } = product;
    const created = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        images: { create: images },
        variants: { create: variants },
      },
    });
    console.log(`  ✅ Created product: ${created.name}`);
  }

  console.log('\n✅ Seeding complete!');
  console.log('👤 Admin: admin@desiroots.in / admin@123');
  console.log('👤 Customer: test@example.com / customer@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
