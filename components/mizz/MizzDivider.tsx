import { cn } from '../ui/utils';

/** Propriedades para o componente MizzDivider */
export interface MizzDividerProps {
  /** Orientação do divisor */
  orientation?: 'horizontal' | 'vertical';
  /** Texto central (opcional) */
  label?: string;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzDivider - Linha divisória do Design System Mizz.
 * Horizontal ou vertical, com suporte a texto central.
 */
export const MizzDivider = ({
  orientation = 'horizontal',
  label,
  className,
}: MizzDividerProps) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('inline-block w-px self-stretch bg-neutral-30', className)}
      />
    );
  }

  if (label) {
    return (
      <div role="separator" className={cn('flex items-center gap-4', className)}>
        <span className="flex-1 h-px bg-neutral-30" />
        <span className="text-xs text-neutral-500 select-none">{label}</span>
        <span className="flex-1 h-px bg-neutral-30" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      className={cn('border-none h-px bg-neutral-30 w-full', className)}
    />
  );
};
