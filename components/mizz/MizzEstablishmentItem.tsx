import { cn } from '../ui/utils';
import type { ReactNode } from 'react';

/** Propriedades para o componente MizzEstablishmentItem */
export interface MizzEstablishmentItemProps {
  /** Nome do estabelecimento */
  name: string;
  /** Endereço ou subtítulo */
  subtitle?: string;
  /** Ícone ou avatar à esquerda */
  icon?: ReactNode;
  /** Se verdadeiro, mostra ações de editar/deletar */
  showActions?: boolean;
  /** Callback ao clicar no item */
  onClick?: () => void;
  /** Callback ao editar */
  onEdit?: () => void;
  /** Callback ao deletar */
  onDelete?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzEstablishmentItem - Item de lista de estabelecimento do Design System Mizz.
 * Exibe nome, subtítulo e ações de gerenciamento.
 */
export const MizzEstablishmentItem = ({
  name,
  subtitle,
  icon,
  showActions = false,
  onClick,
  onEdit,
  onDelete,
  className,
}: MizzEstablishmentItemProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border border-border bg-card transition-colors',
        onClick && 'cursor-pointer hover:bg-accent',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Icon */}
      {icon && (
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{name}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-lg hover:bg-neutral-20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Editar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-lg hover:bg-negative-1 text-negative-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-negative-2"
              aria-label="Deletar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
