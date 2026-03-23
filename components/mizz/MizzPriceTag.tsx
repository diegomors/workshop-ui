import { cn } from '../ui/utils';

/** Propriedades para o componente MizzPriceTag */
export interface MizzPriceTagProps {
  /** Preço atual */
  price: number;
  /** Preço original (antes do desconto) */
  originalPrice?: number;
  /** Moeda (padrão: R$) */
  currency?: string;
  /** Tamanho */
  size?: 'sm' | 'md' | 'lg';
  /** Exibir badge de desconto */
  showDiscount?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

const formatPrice = (value: number, currency: string) => {
  return `${currency}\u00A0${value.toFixed(2).replace('.', ',')}`;
};

/**
 * MizzPriceTag - Exibição de preço do Design System Mizz.
 * Suporte a preço original riscado e badge de desconto.
 */
export const MizzPriceTag = ({
  price,
  originalPrice,
  currency = 'R$',
  size = 'md',
  showDiscount,
  className,
}: MizzPriceTagProps) => {
  const hasDiscount = originalPrice !== undefined && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const sizeStyles = {
    sm: { price: 'text-sm font-bold', original: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { price: 'text-lg font-bold', original: 'text-sm', badge: 'text-xs px-2 py-0.5' },
    lg: { price: 'text-2xl font-bold', original: 'text-base', badge: 'text-sm px-2.5 py-1' },
  };

  return (
    <div className={cn('inline-flex items-center gap-2 flex-wrap', className)}>
      {hasDiscount && showDiscount && (
        <span className={cn('rounded-full bg-negative-2 text-white font-medium', sizeStyles[size].badge)}>
          -{discountPercent}%
        </span>
      )}
      <span className={cn(sizeStyles[size].price, 'text-foreground tabular-nums')}>
        {formatPrice(price, currency)}
      </span>
      {hasDiscount && (
        <span className={cn(sizeStyles[size].original, 'text-muted-foreground line-through tabular-nums')}>
          {formatPrice(originalPrice, currency)}
        </span>
      )}
    </div>
  );
};
