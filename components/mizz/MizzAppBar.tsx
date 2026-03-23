import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Propriedades para o componente MizzAppBar */
export interface MizzAppBarProps {
  /** Titulo da barra */
  title?: string;
  /** Callback ao clicar no botão de voltar */
  onBack?: () => void;
  /** Ações no lado direito (ícones) */
  actions?: ReactNode;
  /** Se verdadeiro, exibe fundo transparente */
  transparent?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzAppBar - Barra de navegação superior do Design System Mizz.
 * Exibe botão de voltar, título centralizado e ações à direita.
 */
export const MizzAppBar = ({
  title,
  onBack,
  actions,
  transparent = false,
  className,
}: MizzAppBarProps) => {
  return (
    <header
      className={cn(
        'flex items-center h-14 px-4 gap-2 shrink-0',
        transparent ? 'bg-transparent' : 'bg-background',
        className
      )}
    >
      {/* Back button */}
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-neutral-20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Voltar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="w-10" />
      )}

      {/* Title */}
      {title && (
        <h1 className="flex-1 text-base font-semibold text-foreground text-center truncate">
          {title}
        </h1>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        {actions || <div className="w-10" />}
      </div>
    </header>
  );
};
