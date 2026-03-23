import { useCallback, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzProductCard */
export interface MizzProductCardProps {
  /** URL da imagem do produto */
  image?: string;
  /** Texto alternativo da imagem */
  imageAlt?: string;
  /** Nome do produto */
  title: string;
  /** Descrição curta */
  description?: string;
  /** Preço formatado (ex: "R$ 29,90") */
  price: string;
  /** Preço original riscado */
  originalPrice?: string;
  /** Badge (ex: "Novo", "-20%") */
  badge?: string;
  /** Avaliação (ReactNode para flexibilidade com MizzRating) */
  rating?: ReactNode;
  /** Conteúdo de ação (ex: botão Adicionar ou MizzQuantitySelector) */
  action?: ReactNode;
  /** Callback ao clicar no card */
  onClick?: () => void;
  /** Estado indisponível */
  unavailable?: boolean;
  /** Layout do card */
  variant?: 'vertical' | 'horizontal';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzProductCard - Card de produto do Design System Mizz.
 * Usado em catálogos de food service e delivery.
 * Variantes: vertical (grid) e horizontal (lista).
 */
export const MizzProductCard = ({
  image,
  imageAlt,
  title,
  description,
  price,
  originalPrice,
  badge,
  rating,
  action,
  onClick,
  unavailable,
  variant = 'vertical',
  className,
}: MizzProductCardProps) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      // Don't trigger card click if clicking on an interactive element
      if ((e.target as HTMLElement).closest('button, input, a, [role="button"]')) return;
      onClick?.();
    },
    [onClick]
  );

  if (variant === 'horizontal') {
    return (
      <div
        className={cn(
          'flex gap-4 p-3 rounded-xl bg-card border border-border transition-shadow hover:shadow-md',
          onClick && 'cursor-pointer',
          unavailable && 'opacity-50',
          className
        )}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Image */}
        <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
          {image ? (
            <img src={image} alt={imageAlt || title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
          {badge && (
            <span className="absolute top-1.5 left-1.5 bg-negative-2 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {unavailable && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Indisponível</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-card-foreground truncate">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
            )}
            {rating && <div className="mt-1">{rating}</div>}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{price}</span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through">{originalPrice}</span>
              )}
            </div>
            {action}
          </div>
        </div>
      </div>
    );
  }

  // Vertical (default)
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl bg-card border border-border overflow-hidden transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer',
        unavailable && 'opacity-50',
        className
      )}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        {image ? (
          <img src={image} alt={imageAlt || title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {badge && (
          <span className="absolute top-2 left-2 bg-negative-2 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Indisponível</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="text-sm font-medium text-card-foreground truncate">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        )}
        {rating && <div>{rating}</div>}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">{price}</span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{originalPrice}</span>
            )}
          </div>
          {action}
        </div>
      </div>
    </div>
  );
};
