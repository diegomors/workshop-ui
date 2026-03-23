import { cn } from '@/lib/utils';

/** Propriedades para o componente MizzSkeleton */
export interface MizzSkeletonProps {
  /** Largura (ex: "100%", "200px") */
  width?: string | number;
  /** Altura (ex: "20px", "1rem") */
  height?: string | number;
  /** Formato */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzSkeleton - Placeholder de carregamento do Design System Mizz.
 * Variantes: text, circular, rectangular, rounded.
 */
export const MizzSkeleton = ({
  width,
  height,
  variant = 'text',
  className,
}: MizzSkeletonProps) => {
  const variantStyles: Record<string, string> = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        'block animate-pulse bg-neutral-30',
        variantStyles[variant],
        variant === 'text' && !height && 'h-4',
        variant === 'circular' && !width && 'w-10 h-10',
        className
      )}
      style={{
        width: width ?? (variant === 'text' ? '100%' : undefined),
        height: height ?? undefined,
      }}
    />
  );
};
