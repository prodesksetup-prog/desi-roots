'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Spin360ViewerProps = {
  frames: Array<{ id: string; url: string; alt?: string | null }>;
  title: string;
};

export default function Spin360Viewer({ frames, title }: Spin360ViewerProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [autoSpin, setAutoSpin] = useState(true);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    if (!autoSpin || frames.length < 2) return;

    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, 140);

    return () => window.clearInterval(interval);
  }, [autoSpin, frames.length]);

  const onPointerDown = (clientX: number) => {
    dragStart.current = clientX;
    setAutoSpin(false);
  };

  const onPointerMove = (clientX: number) => {
    if (dragStart.current === null || frames.length < 2) return;
    const delta = clientX - dragStart.current;
    if (Math.abs(delta) < 12) return;

    setFrameIndex((current) => {
      const next = delta > 0 ? current - 1 : current + 1;
      return (next + frames.length) % frames.length;
    });
    dragStart.current = clientX;
  };

  const onPointerUp = () => {
    dragStart.current = null;
  };

  const activeFrame = frames[frameIndex];

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[34px] bg-stone-100"
        onMouseDown={(event) => onPointerDown(event.clientX)}
        onMouseMove={(event) => onPointerMove(event.clientX)}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={(event) => onPointerDown(event.touches[0].clientX)}
        onTouchMove={(event) => onPointerMove(event.touches[0].clientX)}
        onTouchEnd={onPointerUp}
      >
        <Image src={activeFrame.url} alt={activeFrame.alt || title} fill className="object-cover" priority />
        <div className="absolute left-4 top-4 rounded-full bg-stone-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          360 view
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-full bg-white/85 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur-sm">
          <span>Drag to rotate</span>
          <button onClick={() => setAutoSpin((current) => !current)} className="rounded-full bg-stone-900 px-3 py-1 text-white">
            {autoSpin ? 'Pause' : 'Auto spin'}
          </button>
        </div>
      </div>

      <div className="rounded-[24px] bg-white/75 px-4 py-4">
        <input
          type="range"
          min={0}
          max={Math.max(frames.length - 1, 0)}
          value={frameIndex}
          onChange={(event) => {
            setAutoSpin(false);
            setFrameIndex(Number(event.target.value));
          }}
          className="w-full accent-stone-900"
        />
        <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          <span>Frame 1</span>
          <span>Frame {frames.length}</span>
        </div>
      </div>
    </div>
  );
}
