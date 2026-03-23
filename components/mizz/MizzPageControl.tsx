import { cn } from '@/lib/utils';

export interface MizzPageControlProps {
  /** Número total de páginas */
  count: number;
  /** Página ativa (1-indexed) */
  selected: number;
  /** Callback quando a página muda */
  onChange?: (page: number) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzPageControl - Indicador de página do Design System Mizz.
 * Utilizado em onboarding, carousels ou fluxos multi-step.
 * Propriedade selected: 1 (padrão), 2, 3...
 */
export const MizzPageControl = ({
  count,
  selected,
  onChange,
  className,
}: MizzPageControlProps) => {
  const pages = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="tablist"
      aria-label="Indicador de página"
    >
      {pages.map((page) => {
        const isSelected = page === selected;

        return (
          <button
            key={page}
            onClick={() => onChange?.(page)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              isSelected
                ? 'w-8 bg-primary'
                : 'w-4 bg-neutral-40 hover:bg-neutral-60'
            )}
            role="tab"
            aria-selected={isSelected}
            aria-label={`Página ${page}`}
          />
        );
      })}
    </div>
  );
};
