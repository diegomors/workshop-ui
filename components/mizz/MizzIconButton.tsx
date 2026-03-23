import { forwardRef, useCallback, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const mizzIconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38 select-none cursor-pointer',
  {
    variants: {
      variant: {
        /** Filled */
        filled: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm',
        /** Outlined */
        outlined: 'border border-neutral-80 text-neutral-900 bg-transparent hover:bg-neutral-20 active:bg-neutral-30',
        /** Ghost - sem borda, fundo sutil ao hover */
        ghost: 'text-neutral-900 bg-transparent hover:bg-neutral-20 active:bg-neutral-30',
        /** Standard - sem fundo */
        standard: 'text-neutral-900 bg-transparent hover:bg-neutral-20 active:bg-neutral-30',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'standard',
      size: 'md',
    },
  }
);

/** Propriedades para o componente MizzIconButton */
export interface MizzIconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mizzIconButtonVariants> {
  /** Ícone a ser exibido */
  icon: ReactNode;
  /** Rótulo acessível (obrigatório para ícone sem texto) */
  'aria-label': string;
  /** Estado de carregamento - impede cliques duplicados */
  loading?: boolean;
}

/**
 * MizzIconButton - Botão de ícone do Design System Mizz.
 * Configurações: filled, outlined, standard. Estados: enabled, focused, pressed, disabled, loading.
 * Quando loading=true, o botão exibe spinner e impede ações duplicadas.
 */
const MizzIconButton = forwardRef<HTMLButtonElement, MizzIconButtonProps>(
  ({ className, variant, size, icon, loading, disabled, onClick, ...props }, ref) => {
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

    return (
      <button
        ref={ref}
        className={cn(mizzIconButtonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <span className="flex items-center justify-center" aria-hidden="true">{icon}</span>
        )}
      </button>
    );
  }
);

MizzIconButton.displayName = 'MizzIconButton';

export { MizzIconButton, mizzIconButtonVariants };
