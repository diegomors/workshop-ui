import { useCallback, type MouseEvent } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzAddressCard */
export interface MizzAddressCardProps {
  /** Rótulo (ex: "Casa", "Trabalho") */
  label: string;
  /** Endereço completo */
  address: string;
  /** Complemento */
  complement?: string;
  /** Ícone do tipo (ex: casa, trabalho) */
  iconType?: 'home' | 'work' | 'other';
  /** Se este endereço está selecionado */
  selected?: boolean;
  /** Callback ao selecionar */
  onSelect?: () => void;
  /** Callback ao editar */
  onEdit?: () => void;
  /** Callback ao deletar */
  onDelete?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

const addressIcons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 8l7-5 7 5v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 17V10h6v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  work: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="7" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7V5a2 2 0 012-2h2a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  other: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2C6.69 2 4 4.69 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

/**
 * MizzAddressCard - Card de endereço do Design System Mizz.
 * Usado para seleção de endereço de entrega.
 */
export const MizzAddressCard = ({
  label,
  address,
  complement,
  iconType = 'other',
  selected,
  onSelect,
  onEdit,
  onDelete,
  className,
}: MizzAddressCardProps) => {
  const handleSelect = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      onSelect?.();
    },
    [onSelect]
  );

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border transition-all',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-neutral-60',
        onSelect && 'cursor-pointer',
        className
      )}
      onClick={handleSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {addressIcons[iconType]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-card-foreground">{label}</h4>
          {selected && (
            <span className="text-[10px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              Selecionado
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{address}</p>
        {complement && (
          <p className="text-xs text-muted-foreground mt-0.5">{complement}</p>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Editar endereço"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-full hover:bg-negative-1 hover:text-negative-2 transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Excluir endereço"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v8a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
