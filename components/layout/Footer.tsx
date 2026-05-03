import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4">
            <span className="font-display text-2xl font-bold text-white">Roots</span>
            <span className="block text-[10px] tracking-[0.3em] text-stone-400 uppercase -mt-1">of Country</span>
          </div>
          <p className="text-sm leading-relaxed text-stone-400">
            Celebrating India's rich textile heritage through authentic ethnic wear crafted with love.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Shop</h4>
          <ul className="space-y-2 text-sm">
            {[
              ['Sarees', '/products?category=sarees'],
              ['Salwar Suits', '/products?category=salwar-suits'],
              ['Kurtis & Tops', '/products?category=kurtis'],
              ['Lehengas', '/products?category=lehengas'],
            ].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-brand-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Help</h4>
          <ul className="space-y-2 text-sm">
            {[
              ['Track Order', '/orders'],
              ['Size Guide', '#'],
              ['Returns & Exchange', '#'],
              ['Contact Us', '#'],
            ].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-brand-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Contact</h4>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>📧 hello@rootsofcountry.in</li>
            <li>📱 +91 98765 43210</li>
            <li>⏰ Mon–Sat, 10am–6pm</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a href="#" className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors text-xs">
              ig
            </a>
            <a href="#" className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors text-xs">
              fb
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <p>© 2024 Roots of Country. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Secure Payments by Razorpay</span>
            <div className="flex gap-1">
              {['UPI', 'Card', 'NetBanking'].map((p) => (
                <span key={p} className="bg-stone-800 px-2 py-0.5 rounded text-[10px]">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
