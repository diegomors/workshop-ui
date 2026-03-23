import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

const mizzBadgeVariants = cva(
  'inline-flex items-center justify-center font-medium select-none',
  {
    variants: {
      variant: {
        /** Primário - badge com cor primária */
        primary: 'bg-primary text-primary-foreground',
        /** Secundário - badge com cor neutra */
        secondary: 'bg-neutral-200 text-neutral-0',
        /** Sucesso */
        success: 'bg-positive-2 text-white',
        /** Erro */
        error: 'bg-negative-2 text-white',
      },
      size: {
        sm: 'min-w-4 h-4 text-[10px] px-1 rounded-full',
        md: 'min-w-5 h-5 text-xs px-1.5 rounded-full',
        lg: 'min-w-6 h-6 text-sm px-2 rounded-full',
      },
      /** Ponto sem conteúdo (dot badge) */
      dot: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { dot: true, size: 'sm', className: 'w-2 h-2 min-w-0 p-0' },
      { dot: true, size: 'md', className: 'w-2.5 h-2.5 min-w-0 p-0' },
      { dot: true, size: 'lg', className: 'w-3 h-3 min-w-0 p-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      dot: false,
    },
  }
);

/** Propriedades para o componente MizzBadge */
export interface MizzBadgeProps extends VariantProps<typeof mizzBadgeVariants> {
  /** Conteúdo do badge (número ou texto) */
  content?: ReactNode;
  /** Valor máximo (ex: 99 mostra "99+") */
  max?: number;
  /** Visibilidade */
  visible?: boolean;
  /** Elemento filho ao qual o badge será ancorado */
  children?: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzBadge - Badge/indicador do Design System Mizz.
 * Pode ser usado standalone ou ancorado a um elemento.
 * Variantes: primary, secondary, success, error. Modos: conteúdo ou dot.
 */
export const MizzBadge = ({
  content,
  max,
  variant,
  size,
  dot,
  visible = true,
  children,
  className,
}: MizzBadgeProps) => {
  if (!visible) return children ? <>{children}</> : null;

  const displayContent = (() => {
    if (dot) return null;
    if (typeof content === 'number' && max && content > max) return `${max}+`;
    return content;
  })();

  const badge = (
    <span className={cn(mizzBadgeVariants({ variant, size, dot }), className)} aria-label={`${content}`}>
      {displayContent}
    </span>
  );

  if (!children) return badge;

  return (
    <span className="relative inline-flex">
      {children}
      <span className="absolute -top-1 -right-1">{badge}</span>
    </span>
  );
};
