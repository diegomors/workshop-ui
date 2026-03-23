import { cn } from '../ui/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const mizzSpinnerVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-10 w-10',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/** Propriedades para o componente MizzSpinner */
export interface MizzSpinnerProps extends VariantProps<typeof mizzSpinnerVariants> {
  /** Classes CSS adicionais */
  className?: string;
  /** Texto acessível para leitores de tela */
  label?: string;
}

/**
 * MizzSpinner - Indicador de carregamento circular do Design System Mizz.
 * Utilizado dentro de botões, cards ou como indicador de página inteira.
 */
export const MizzSpinner = ({ size, className, label = 'Carregando' }: MizzSpinnerProps) => (
  <svg
    className={cn(mizzSpinnerVariants({ size }), className)}
    viewBox="0 0 24 24"
    fill="none"
    role="status"
    aria-label={label}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);
