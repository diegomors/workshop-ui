import { useCallback, type ReactNode, type MouseEvent } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzListItem */
export interface MizzListItemProps {
  /** Ícone/avatar à esquerda */
  leading?: ReactNode;
  /** Título */
  title: string;
  /** Subtítulo */
  subtitle?: string;
  /** Conteúdo à direita (ex: preço, badge, ícone) */
  trailing?: ReactNode;
  /** Callback ao clicar */
  onClick?: () => void;
  /** Desabilitado */
  disabled?: boolean;
  /** Exibir divisor inferior */
  divider?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzListItem - Item de lista genérico do Design System Mizz.
 * Utilizado em menus, configurações, listagem de endereços, etc.
 */
export const MizzListItem = ({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  disabled,
  divider = true,
  className,
}: MizzListItemProps) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.();
    },
    [disabled, onClick]
  );

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors',
        onClick && 'cursor-pointer hover:bg-muted active:bg-neutral-30',
        onClick && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
        disabled && 'opacity-38 pointer-events-none',
        divider && 'border-b border-border last:border-b-0',
        className
      )}
      onClick={onClick ? handleClick : undefined}
      disabled={onClick ? disabled : undefined}
      type={onClick ? 'button' : undefined}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {trailing && <div className="flex-shrink-0 text-muted-foreground">{trailing}</div>}

      {/* Chevron for clickable items */}
      {onClick && !trailing && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-muted-foreground">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Tag>
  );
};
