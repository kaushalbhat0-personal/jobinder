'use client';

import { useState, useCallback, useRef, type ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export type Direction = 'left' | 'right' | 'up';

export interface SwipeCard {
  id: string;
  content: ReactNode;
}

export interface SwipeStackProps {
  cards: SwipeCard[];
  onSwipe: (id: string, direction: Direction) => void;
  onSave?: (id: string) => void;
  onEmpty?: () => void;
  className?: string;
}

const SWIPE_THRESHOLD = 100;

export function SwipeStack({
  cards,
  onSwipe,
  onSave: _onSave,
  onEmpty,
  className,
}: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    dragStart.current = { x: clientX, y: clientY };
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;

      setOffset({ x: dx, y: dy });

      if (dx > 30) setDirection('right');
      else if (dx < -30) setDirection('left');
      else if (dy < -30) setDirection('up');
      else setDirection(null);
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const distX = Math.abs(offset.x);
    const distY = Math.abs(offset.y);

    if (distX > SWIPE_THRESHOLD || (direction === 'up' && distY > SWIPE_THRESHOLD / 2)) {
      const dir = direction ?? (offset.x > 0 ? 'right' : 'left');
      onSwipe(currentCard!.id, dir);
      setCurrentIndex((prev) => prev + 1);
    }

    setOffset({ x: 0, y: 0 });
    setDirection(null);
  }, [offset, direction, currentCard, onSwipe, isDragging]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleDragStart(touch.clientX, touch.clientY);
    },
    [handleDragStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleDragMove(touch.clientX, touch.clientY);
    },
    [handleDragMove],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleDragStart(e.clientX, e.clientY);
    },
    [handleDragStart],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    },
    [handleDragMove],
  );

  if (!currentCard && onEmpty) {
    onEmpty();
  }

  if (!currentCard) {
    return null;
  }

  const rotation = offset.x * 0.05;
  const opacity = Math.max(0, 1 - Math.abs(offset.x) / (SWIPE_THRESHOLD * 3));

  return (
    <div
      className={cn('relative mx-auto w-full max-w-[430px] touch-none select-none', className)}
      style={{ height: 480 }}
    >
      {nextCard && (
        <div
          className="bg-background absolute inset-0 rounded-xl border border-neutral-200 shadow-sm"
          style={{ transform: 'scale(0.95) translateY(8px)', zIndex: 0 }}
        >
          {nextCard.content}
        </div>
      )}

      <div
        className={cn(
          'bg-background absolute inset-0 cursor-grab rounded-xl border border-neutral-200 shadow-md',
          'transition-shadow duration-150',
          isDragging && 'cursor-grabbing shadow-xl',
        )}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
          opacity,
          zIndex: 1,
          transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {currentCard.content}
      </div>

      {direction && !isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          {direction === 'right' && (
            <span className="border-swipe-like text-heading-sm text-swipe-like rounded-lg border-2 bg-white/90 px-4 py-2 font-bold">
              LIKE
            </span>
          )}
          {direction === 'left' && (
            <span className="border-swipe-pass text-heading-sm text-swipe-pass rounded-lg border-2 bg-white/90 px-4 py-2 font-bold">
              PASS
            </span>
          )}
          {direction === 'up' && (
            <span className="border-swipe-super text-heading-sm text-swipe-super rounded-lg border-2 bg-white/90 px-4 py-2 font-bold">
              APPLY
            </span>
          )}
        </div>
      )}
    </div>
  );
}
