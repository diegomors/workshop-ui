import { cn } from '../ui/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const mizzProgressBarVariants = cva('', {
  variants: {
    variant: {
      primary: 'bg-primary',
      success: 'bg-positive-2',
      error: 'bg-negative-2',
    },
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

/** Propriedades para o componente MizzProgressBar */
export interface MizzProgressBarProps extends VariantProps<typeof mizzProgressBarVariants> {
  /** Valor atual (0-100). Se não fornecido, renderiza como indeterminate. */
  value?: number;
  /** Rótulo acessível */
  label?: string;
  /** Exibir o valor em texto */
  showValue?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzProgressBar - Barra de progresso do Design System Mizz.
 * Modos: determinado (com value) e indeterminado (sem value).
 */
export const MizzProgressBar = ({
  value,
  variant,
  size,
  label = 'Progresso',
  showValue,
  className,
}: MizzProgressBarProps) => {
  const isDeterminate = value !== undefined;
  const clampedValue = isDeterminate ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div className={cn('w-full', className)}>
      {showValue && isDeterminate && (
        <div className="flex justify-end mb-1">
          <span className="text-xs text-neutral-500">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={isDeterminate ? clampedValue : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('w-full rounded-full bg-neutral-30 overflow-hidden', mizzProgressBarVariants({ size }))}
      >
        {isDeterminate ? (
          <div
            className={cn('h-full rounded-full transition-all duration-300 ease-out', mizzProgressBarVariants({ variant }))}
            style={{ width: `${clampedValue}%` }}
          />
        ) : (
          <div
            className={cn(
              'h-full w-1/3 rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]',
              mizzProgressBarVariants({ variant })
            )}
          />
        )}
      </div>
    </div>
  );
};
