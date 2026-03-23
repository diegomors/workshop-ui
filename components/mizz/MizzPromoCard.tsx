import { useCallback, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzPromoCard */
export interface MizzPromoCardProps {
  /** Título da promoção */
  title: string;
  /** Descrição */
  description?: string;
  /** Código do cupom */
  couponCode?: string;
  /** URL da imagem de fundo */
  backgroundImage?: string;
  /** Cor de fundo (gradiente) */
  backgroundColor?: string;
  /** Ícone ou ilustração */
  icon?: ReactNode;
  /** Callback ao clicar */
  onClick?: () => void;
  /** Estado de loading */
  loading?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzPromoCard - Card promocional do Design System Mizz.
 * Usado em banners de promoção, cupons e ofertas especiais.
 */
export const MizzPromoCard = ({
  title,
  description,
  couponCode,
  backgroundImage,
  backgroundColor,
  icon,
  onClick,
  loading,
  className,
}: MizzPromoCardProps) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (loading) {
        e.preventDefault();
        return;
      }
      onClick?.();
    },
    [loading, onClick]
  );

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden min-h-[120px] flex items-center',
        onClick && 'cursor-pointer',
        loading && 'opacity-70 pointer-events-none',
        !backgroundImage && !backgroundColor && 'bg-primary',
        className
      )}
      style={{
        backgroundColor: !backgroundImage ? backgroundColor : undefined,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Overlay for readability */}
      {backgroundImage && <div className="absolute inset-0 bg-black/30" />}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4 p-5 w-full">
        <div className="flex-1 min-w-0 text-white">
          <h3 className="text-lg font-bold leading-tight">{title}</h3>
          {description && (
            <p className="text-sm opacity-90 mt-1">{description}</p>
          )}
          {couponCode && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-mono font-bold tracking-wider border border-white/30">
              {couponCode}
            </span>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-white opacity-80">{icon}</div>
        )}
      </div>
    </div>
  );
};
