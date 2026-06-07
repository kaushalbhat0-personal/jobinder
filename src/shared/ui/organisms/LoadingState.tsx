import { cn } from '@/shared/utils/cn';
import { Spinner } from '@/shared/ui/atoms/Spinner';
import { Text } from '@/shared/ui/atoms/Text';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  className,
  fullPage = false,
}: LoadingStateProps) {
  return (
    <div
      aria-label={message}
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullPage ? 'min-h-screen' : 'py-12',
        className,
      )}
    >
      <Spinner size="lg" />
      <Text variant="body-sm" className="text-neutral-500">
        {message}
      </Text>
    </div>
  );
}

export type { LoadingStateProps };
