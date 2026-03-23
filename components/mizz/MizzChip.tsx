import { forwardRef, useCallback, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

const mizzChipVariants = cva(
  'inline-flex items-center gap-1.5 font-medium transition-all select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        /** Filled - Fundo preenchido */
        filled: 'bg-primary/10 text-primary',
        /** Outlined - Apenas borda */
        outlined: 'border border-neutral-80 text-neutral-900 bg-transparent',
      },
      size: {
        sm: 'h-7 px-3 text-xs rounded-full',
        md: 'h-8 px-4 text-sm rounded-full',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-sm active:scale-95 disabled:pointer-events-none disabled:opacity-38',
        false: '',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'filled', selected: true, className: 'bg-primary text-primary-foreground' },
      { variant: 'outlined', selected: true, className: 'border-primary text-primary bg-primary/5' },
    ],
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      interactive: false,
      selected: false,
    },
  }
);

/** Propriedades para o componente MizzChip */
export interface MizzChipProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mizzChipVariants> {
  /** Ícone no início */
  startIcon?: ReactNode;
  /** Ícone/botão de fechar */
  onClose?: () => void;
  /** Estado de carregamento - impede cliques duplicados */
  loading?: boolean;
}

/**
 * MizzChip - Chip/tag do Design System Mizz.
 * Configurações: filled, outlined. Estados: enabled, selected, disabled, loading.
 */
const MizzChip = forwardRef<HTMLButtonElement, MizzChipProps>(
  ({ className, variant, size, interactive, selected, startIcon, onClose, loading, disabled, onClick, children, ...props }, ref) => {
    const isInteractive = interactive ?? !!(onClick || onClose);
    const isDisabled = disabled || loading;

    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      },
      [isDisabled, onClick]
    );

    const handleClose = useCallback(
      (e: MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        if (!isDisabled) onClose?.();
      },
      [isDisabled, onClose]
    );

    const Element = isInteractive ? 'button' : 'span';

    return (
      <Element
        ref={isInteractive ? ref : undefined}
        className={cn(mizzChipVariants({ variant, size, interactive: isInteractive, selected, className }))}
        disabled={isInteractive ? isDisabled : undefined}
        aria-disabled={isDisabled}
        onClick={isInteractive ? handleClick : undefined}
        {...(isInteractive ? props : {})}
      >
        {loading && (
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {!loading && startIcon && <span className="flex items-center" aria-hidden="true">{startIcon}</span>}
        <span>{children}</span>
        {onClose && !loading && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Remover"
            className="flex items-center cursor-pointer hover:text-negative-2 transition-colors ml-0.5"
            onClick={handleClose}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isDisabled) onClose(); } }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        )}
      </Element>
    );
  }
);

MizzChip.displayName = 'MizzChip';

export { MizzChip, mizzChipVariants };
