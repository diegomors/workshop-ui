import { useCallback, type MouseEvent } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzQuantitySelector */
export interface MizzQuantitySelectorProps {
  /** Quantidade atual */
  value: number;
  /** Callback quando a quantidade muda */
  onChange: (value: number) => void;
  /** Quantidade mínima (padrão: 0) */
  min?: number;
  /** Quantidade máxima */
  max?: number;
  /** Tamanho */
  size?: 'sm' | 'md';
  /** Estado de carregamento - impede cliques duplicados */
  loading?: boolean;
  /** Desabilitado */
  disabled?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzQuantitySelector - Seletor de quantidade (+/-) do Design System Mizz.
 * Usado em cards de produto e carrinho. Impede ações durante loading.
 */
export const MizzQuantitySelector = ({
  value,
  onChange,
  min = 0,
  max,
  size = 'md',
  loading,
  disabled,
  className,
}: MizzQuantitySelectorProps) => {
  const isDisabled = disabled || loading;
  const canDecrement = value > min && !isDisabled;
  const canIncrement = (max === undefined || value < max) && !isDisabled;

  const handleDecrement = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (canDecrement) onChange(value - 1);
    },
    [canDecrement, onChange, value]
  );

  const handleIncrement = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (canIncrement) onChange(value + 1);
    },
    [canIncrement, onChange, value]
  );

  const sizeStyles = {
    sm: { wrapper: 'h-8 gap-0', button: 'w-8 h-8 text-sm', text: 'w-8 text-sm' },
    md: { wrapper: 'h-10 gap-0', button: 'w-10 h-10 text-base', text: 'w-10 text-base' },
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-background',
        isDisabled && 'opacity-38',
        sizeStyles[size].wrapper,
        className
      )}
      aria-label={`Quantidade: ${value}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label="Diminuir quantidade"
        className={cn(
          'inline-flex items-center justify-center rounded-l-full transition-colors',
          'hover:bg-muted active:bg-neutral-30 disabled:opacity-38 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          sizeStyles[size].button
        )}
      >
        {loading ? (
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <span
        className={cn(
          'inline-flex items-center justify-center font-medium text-foreground tabular-nums select-none',
          sizeStyles[size].text
        )}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label="Aumentar quantidade"
        className={cn(
          'inline-flex items-center justify-center rounded-r-full transition-colors text-primary',
          'hover:bg-primary/5 active:bg-primary/10 disabled:opacity-38 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          sizeStyles[size].button
        )}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};
