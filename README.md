# 🌿 Roots of Country — Indian Ethnic Wear E-Commerce

A full-stack Next.js 14 e-commerce app for Indian ethnic wear.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js |
| Payment | Razorpay |
| Styling | Tailwind CSS |
| State | Zustand |
| Deployment | Railway |

---

## 🚀 Local Setup (Step by Step)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Database (Free)
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to **Settings → Database → Connection string → URI**
4. Copy the URI (replace `[YOUR-PASSWORD]` with your DB password)

### 3. Setup Razorpay (Test Mode)
1. Go to https://razorpay.com and create a free account
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy the Key ID and Key Secret

### 4. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres"
NEXTAUTH_SECRET="any-random-string-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="your_secret_here"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXX"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Push Database Schema
```bash
npx prisma db push
```

### 6. Seed Sample Data
```bash
node prisma/seed.js
```

This creates:
- 4 categories (Sarees, Salwar Suits, Kurtis, Lehengas)
- 8 sample products with variants
- Admin user: `admin@rootsofcountry.in` / `admin@123`
- Test customer: `test@example.com` / `customer@123`

### 7. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 📱 Pages & Features

| Page | URL |
|---|---|
| Homepage | `/` |
| All Products | `/products` |
| Filter by Category | `/products?category=sarees` |
| Product Detail | `/products/[slug]` |
| Cart | `/cart` |
| Checkout + Pay | `/checkout` |
| My Orders | `/orders` |
| Order Tracking | `/orders/[id]` |
| Login | `/login` |
| Signup | `/signup` |
| Admin Panel | `/admin` |

---

## ☁️ Deploy to Railway (Free Tier)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/roots-of-country.git
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to https://railway.app and sign up (free)
2. Click **New Project → Deploy from GitHub repo**
3. Select your `roots-of-country` repo
4. Railway auto-detects Next.js ✅

### Step 3: Add Environment Variables in Railway
In Railway dashboard → your project → **Variables**, add all variables from `.env`:
```
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://YOUR-APP.up.railway.app
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
NEXT_PUBLIC_APP_URL=https://YOUR-APP.up.railway.app
```

⚠️ **Important**: Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Railway URL after first deploy.

### Step 4: Run DB Migration on Railway
In Railway → your service → **Shell** tab:
```bash
npx prisma db push
node prisma/seed.js
```

### Step 5: Your app is live! 🎉
Railway gives you a free URL like: `https://roots-of-country-production.up.railway.app`

---

## 💳 Go Live with Razorpay (Production)

1. Complete KYC on Razorpay dashboard
2. Replace test keys with **Live keys** in environment variables
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with live values

---

## 🔧 Admin Panel

Login with admin credentials at `/admin`:
- View all orders with revenue stats
- Update order status (Pending → Confirmed → Shipped → Delivered)
- Show/Hide products
- Delete products

---

## 📁 Project Structure

```
roots-of-country/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (auth)/signup/         # Signup page
│   ├── (shop)/products/       # Products listing
│   ├── (shop)/products/[slug] # Product detail
│   ├── (shop)/cart/           # Cart
│   ├── (shop)/checkout/       # Checkout + Razorpay
│   ├── (shop)/orders/         # Order history
│   ├── (shop)/orders/[id]/    # Order tracking
│   ├── admin/                 # Admin dashboard
│   ├── api/                   # All API routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Homepage
├── components/
│   ├── layout/Navbar.tsx
│   ├── layout/Footer.tsx
│   ├── shop/ProductCard.tsx
│   └── ui/Toaster.tsx
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── prisma.ts              # DB client
│   ├── razorpay.ts            # Payment helper
│   └── store/cart.ts          # Zustand cart
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Sample data
└── types/index.ts
```

---

## 🆙 Upgrade Path (After Client Approval)

When ready to move to AWS/GCP:
1. Move DB to **AWS RDS** or **Google Cloud SQL**
2. Host Next.js on **AWS Amplify**, **Vercel Pro**, or **GCP Cloud Run**
3. Use **AWS S3** or **Cloudinary** for product image uploads
4. Add **Redis** for session caching

---

## 🌸 Credits

Built with ❤️ for Roots of Country — celebrating India's textile heritage.
