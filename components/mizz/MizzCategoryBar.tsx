import { useCallback, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Representação de uma categoria */
export interface MizzCategory {
  /** Identificador único */
  value: string;
  /** Rótulo */
  label: string;
  /** Ícone ou emoji */
  icon?: ReactNode;
}

/** Propriedades para o componente MizzCategoryBar */
export interface MizzCategoryBarProps {
  /** Categorias disponíveis */
  categories: MizzCategory[];
  /** Categoria selecionada */
  value?: string;
  /** Callback quando a categoria muda */
  onChange?: (value: string) => void;
  /** Variante visual */
  variant?: 'chip' | 'icon';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzCategoryBar - Barra horizontal de categorias do Design System Mizz.
 * Scroll horizontal com snap. Variantes: chip (texto) e icon (ícone + texto).
 */
export const MizzCategoryBar = ({
  categories,
  value,
  onChange,
  variant = 'chip',
  className,
}: MizzCategoryBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (cat: string) => {
      onChange?.(cat);
    },
    [onChange]
  );

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex gap-2 overflow-x-auto scrollbar-none py-1 px-1 -mx-1 snap-x snap-mandatory',
        className
      )}
      role="tablist"
      aria-label="Categorias"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((cat) => {
        const isSelected = cat.value === value;

        if (variant === 'icon') {
          return (
            <button
              key={cat.value}
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleSelect(cat.value)}
              className={cn(
                'flex flex-col items-center gap-1 min-w-[64px] py-2 px-3 rounded-xl snap-start transition-all flex-shrink-0 select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isSelected
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {cat.icon && <span className="text-2xl">{cat.icon}</span>}
              <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
            </button>
          );
        }

        // Chip variant
        return (
          <button
            key={cat.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => handleSelect(cat.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-all flex-shrink-0 select-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-neutral-30'
            )}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
