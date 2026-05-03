'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <p className="text-sm font-medium text-brand-600 mb-2">Something went wrong</p>
            <h1 className="font-display text-3xl font-bold text-stone-800 mb-4">
              We could not load this page.
            </h1>
            <p className="text-stone-500 text-sm mb-6">
              Please try again. If the issue continues, refresh the page.
            </p>
            <button type="button" onClick={reset} className="btn-primary">
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
