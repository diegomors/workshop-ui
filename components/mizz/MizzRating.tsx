import { useCallback, useState, type KeyboardEvent } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzRating */
export interface MizzRatingProps {
  /** Valor atual (0-5) */
  value?: number;
  /** Callback quando o valor muda */
  onChange?: (value: number) => void;
  /** Número máximo de estrelas */
  max?: number;
  /** Tamanho */
  size?: 'sm' | 'md' | 'lg';
  /** Somente leitura */
  readOnly?: boolean;
  /** Exibir o valor numérico ao lado */
  showValue?: boolean;
  /** Número de avaliações (ex: "(234)") */
  reviewCount?: number;
  /** Classes CSS adicionais */
  className?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

/**
 * MizzRating - Avaliação com estrelas do Design System Mizz.
 * Suporte a meia estrela (readOnly) e interação por teclado.
 */
export const MizzRating = ({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  readOnly = false,
  showValue,
  reviewCount,
  className,
}: MizzRatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const handleClick = useCallback(
    (star: number) => {
      if (!readOnly) onChange?.(star);
    },
    [readOnly, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (readOnly) return;
      if (e.key === 'ArrowRight') onChange?.(Math.min(max, (value || 0) + 1));
      else if (e.key === 'ArrowLeft') onChange?.(Math.max(0, (value || 0) - 1));
    },
    [readOnly, onChange, value, max]
  );

  const displayValue = hovered ?? value;

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role="radiogroup"
      aria-label={`Avaliação: ${value} de ${max}`}
      onKeyDown={handleKeyDown}
      tabIndex={readOnly ? -1 : 0}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const starIndex = i + 1;
          const filled = displayValue >= starIndex;
          const halfFilled = !filled && displayValue >= starIndex - 0.5;

          return (
            <span
              key={i}
              className={cn(
                sizeMap[size],
                !readOnly && 'cursor-pointer transition-transform hover:scale-110',
                'relative'
              )}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => !readOnly && setHovered(starIndex)}
              onMouseLeave={() => !readOnly && setHovered(null)}
              role={readOnly ? 'presentation' : 'radio'}
              aria-checked={filled}
              aria-label={`${starIndex} estrela${starIndex > 1 ? 's' : ''}`}
            >
              {/* Empty star (background) */}
              <svg viewBox="0 0 24 24" fill="none" className="absolute inset-0 w-full h-full text-neutral-40">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="currentColor"
                />
              </svg>
              {/* Filled star (overlay) */}
              {(filled || halfFilled) && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute inset-0 w-full h-full text-warning-2"
                  style={halfFilled ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground ml-1">{value.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
};
