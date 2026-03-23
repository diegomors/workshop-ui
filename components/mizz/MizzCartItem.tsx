import { useCallback, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

/** Propriedades para o componente MizzCartItem */
export interface MizzCartItemProps {
  /** URL da imagem do produto */
  image?: string;
  /** Nome do produto */
  title: string;
  /** Descrição/customização (ex: "Sem cebola, extra queijo") */
  description?: string;
  /** Preço formatado */
  price: string;
  /** Controle de quantidade (ReactNode, ex: MizzQuantitySelector) */
  quantityControl?: ReactNode;
  /** Callback para remover o item */
  onRemove?: () => void;
  /** Estado de carregamento (impede ações) */
  loading?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzCartItem - Item do carrinho do Design System Mizz.
 * Exibe produto, preço, controle de quantidade e ação de remover.
 */
export const MizzCartItem = ({
  image,
  title,
  description,
  price,
  quantityControl,
  onRemove,
  loading,
  className,
}: MizzCartItemProps) => {
  const handleRemove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (!loading) onRemove?.();
    },
    [loading, onRemove]
  );

  return (
    <div
      className={cn(
        'flex gap-3 py-3 border-b border-border last:border-b-0',
        loading && 'opacity-60 pointer-events-none',
        className
      )}
    >
      {/* Image */}
      {image && (
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-medium text-card-foreground truncate">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-foreground">{price}</span>
          <div className="flex items-center gap-2">
            {quantityControl}
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="p-1 rounded-full text-muted-foreground hover:text-negative-2 hover:bg-negative-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Remover ${title}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
