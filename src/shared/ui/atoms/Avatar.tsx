import { cn } from '@/shared/utils/cn';
import Image from 'next/image';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: AvatarSize;
  fallback?: string;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-body-sm',
  md: 'h-10 w-10 text-body-md',
  lg: 'h-12 w-12 text-body-lg',
  xl: 'h-16 w-16 text-heading-md',
};

const sizePx: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ src, alt, size = 'md', fallback, className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={sizePx[size]}
        height={sizePx[size]}
        className={cn('rounded-full object-cover', sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'bg-primary-100 text-primary-700 inline-flex items-center justify-center rounded-full font-semibold',
        sizeStyles[size],
        className,
      )}
    >
      {fallback ?? getInitials(alt)}
    </div>
  );
}

export type { AvatarProps, AvatarSize };
