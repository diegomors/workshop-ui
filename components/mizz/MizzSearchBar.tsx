import { forwardRef, useCallback, type InputHTMLAttributes, type FormEvent } from 'react';
import { cn } from '@/lib/utils';

/** Propriedades para o componente MizzSearchBar */
export interface MizzSearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onSubmit'> {
  /** Callback ao submeter a busca */
  onSearch?: (value: string) => void;
  /** Callback para limpar o campo */
  onClear?: () => void;
  /** Estado de carregamento */
  loading?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzSearchBar - Barra de busca do Design System Mizz.
 * Com ícone de busca, botão limpar, e estado de loading.
 */
const MizzSearchBar = forwardRef<HTMLInputElement, MizzSearchBarProps>(
  ({ className, onSearch, onClear, loading, value, onChange, ...props }, ref) => {
    const hasValue = value !== undefined && value !== '';

    const handleSubmit = useCallback(
      (e: FormEvent) => {
        e.preventDefault();
        if (!loading && typeof value === 'string') onSearch?.(value);
      },
      [loading, value, onSearch]
    );

    const handleClear = useCallback(() => {
      onClear?.();
    }, [onClear]);

    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex items-center gap-2 h-12 rounded-full border border-border bg-background px-4 transition-all',
          'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
          className
        )}
        role="search"
      >
        {/* Search icon / spinner */}
        <span className="flex-shrink-0 text-muted-foreground">
          {loading ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </span>

        <input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground min-w-0"
          aria-label="Buscar"
          {...props}
        />

        {/* Clear button */}
        {hasValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Limpar busca"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </form>
    );
  }
);

MizzSearchBar.displayName = 'MizzSearchBar';

export { MizzSearchBar };
