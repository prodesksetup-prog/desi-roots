'use client';

import Link from 'next/link';
import { useState } from 'react';

type CompanionProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: { name: string };
};

type CompanionResponse = {
  reply: string;
  quickReplies: string[];
  products: CompanionProduct[];
};

type Message = {
  role: 'assistant' | 'user';
  text: string;
  products?: CompanionProduct[];
};

const starterPrompts = [
  'Show me wedding looks under 5000',
  'I need an office-ready kurti',
  'Suggest festive sarees',
  'What should I wear for a party?',
];

export default function StyleCompanion() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState(starterPrompts);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'I can help narrow the catalog by occasion, category, or budget. Ask me for wedding, office, festive, or casual recommendations.',
    },
  ]);

  const sendMessage = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/companion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed }),
    });

    const data: CompanionResponse = await res.json();
    setMessages((current) => [...current, { role: 'assistant', text: data.reply, products: data.products }]);
    setQuickReplies(data.quickReplies);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-4 w-[min(92vw,380px)] overflow-hidden rounded-[32px] border border-white/60 bg-[rgba(255,251,246,0.92)] shadow-[0_28px_90px_-46px_rgba(25,18,13,0.88)] backdrop-blur-xl">
          <div className="bg-stone-950 px-5 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">AI companion</p>
                <h3 className="mt-2 font-display text-4xl leading-none">Roots Concierge</h3>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]">
                Close
              </button>
            </div>
            <p className="mt-3 text-sm text-stone-300">
              A smart catalog guide for finding the right silhouette, occasion, and price point faster.
            </p>
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'assistant' ? 'mr-6' : 'ml-6'}>
                <div className={`rounded-[24px] px-4 py-4 text-sm leading-7 ${
                  message.role === 'assistant'
                    ? 'bg-white text-stone-700'
                    : 'bg-stone-900 text-white'
                }`}>
                  {message.text}
                </div>
                {message.products && message.products.length > 0 && (
                  <div className="mt-3 grid gap-3">
                    {message.products.map((product) => (
                      <Link key={product.id} href={`/products/${product.slug}`} className="rounded-[22px] border border-stone-200 bg-white px-4 py-4 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{product.category.name}</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900">{product.name}</p>
                        <p className="mt-1 text-sm text-brand-700">Rs. {product.price.toLocaleString('en-IN')}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mr-6 rounded-[24px] bg-white px-4 py-4 text-sm text-stone-500">
                Looking through the catalog...
              </div>
            )}
          </div>

          <div className="border-t border-stone-200 px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickReplies.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 hover:bg-stone-900 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input-field"
                placeholder="Ask for a wedding, office, or festive look"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button onClick={() => sendMessage(input)} disabled={loading} className="btn-primary whitespace-nowrap disabled:opacity-60">
                Ask
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-full bg-stone-900 px-5 py-4 text-sm font-semibold tracking-[0.08em] text-white shadow-[0_24px_70px_-36px_rgba(25,18,13,0.92)]"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">AI</span>
        Style companion
      </button>
    </div>
  );
}
