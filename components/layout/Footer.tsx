import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="pt-20">
      <div className="page-shell pb-10">
        <div className="overflow-hidden rounded-[36px] bg-stone-950 text-stone-200 shadow-[0_34px_100px_-58px_rgba(8,6,5,1)]">
          <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.2fr,0.8fr] lg:px-12 lg:py-14">
            <div className="space-y-6">
              <span className="eyebrow border-white/15 bg-white/5 text-amber-200">Crafted for modern wardrobes</span>
              <div>
                <h2 className="font-display text-5xl leading-none text-white sm:text-6xl">Dress heritage with a sharper point of view.</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-stone-400 sm:text-base">
                  Desi Roots brings Indian craft into a cleaner, elevated wardrobe with occasion-ready silhouettes, richer fabrics, and easier shopping.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Free shipping', value: 'Rs. 999+' },
                  { label: 'Easy returns', value: '7 days' },
                  { label: 'Secure checkout', value: 'Razorpay' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Shop</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    ['All Products', '/products'],
                    ['Sarees', '/products?category=sarees'],
                    ['Salwar Suits', '/products?category=salwar-suits'],
                    ['Kurtis', '/products?category=kurtis'],
                    ['Lehengas', '/products?category=lehengas'],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-stone-200 hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Support</h4>
                <ul className="mt-4 space-y-3 text-sm text-stone-300">
                  <li>hello@rootsofcountry.in</li>
                  <li>+91 98765 43210</li>
                  <li>Mon to Sat | 10am to 6pm</li>
                  <li>Track orders from your account anytime.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-6 py-5 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-3 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
              <p>2026 Desi Roots. Designed for everyday celebration.</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 px-3 py-1">UPI</span>
                <span className="rounded-full border border-white/10 px-3 py-1">Cards</span>
                <span className="rounded-full border border-white/10 px-3 py-1">NetBanking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
