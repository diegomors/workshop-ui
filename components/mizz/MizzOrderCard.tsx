import { cn } from '../ui/utils';
import type { ReactNode } from 'react';

/** Status possíveis de um pedido */
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

/** Propriedades para o componente MizzOrderCard */
export interface MizzOrderCardProps {
  /** Número/ID do pedido */
  orderNumber: string;
  /** Identificador da mesa/local */
  tableLabel?: string;
  /** Status do pedido */
  status: OrderStatus;
  /** Itens do pedido (resumo) */
  items?: string[];
  /** Valor total formatado */
  total?: string;
  /** Data/hora do pedido */
  timestamp?: string;
  /** Callback ao clicar no card */
  onClick?: () => void;
  /** Ações customizadas no rodapé */
  actions?: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendente', bg: 'bg-warning-1', text: 'text-warning-2' },
  preparing: { label: 'Preparando', bg: 'bg-info-1', text: 'text-info-2' },
  ready: { label: 'Pronto', bg: 'bg-positive-1', text: 'text-positive-2' },
  delivered: { label: 'Entregue', bg: 'bg-neutral-20', text: 'text-neutral-500' },
  cancelled: { label: 'Cancelado', bg: 'bg-negative-1', text: 'text-negative-2' },
};

/**
 * MizzOrderCard - Card de pedido do Design System Mizz.
 * Exibe informações resumidas de um pedido com status visual.
 */
export const MizzOrderCard = ({
  orderNumber,
  tableLabel,
  status,
  items,
  total,
  timestamp,
  onClick,
  actions,
  className,
}: MizzOrderCardProps) => {
  const statusInfo = statusConfig[status];

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-accent active:bg-neutral-20',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">#{orderNumber}</span>
          {tableLabel && (
            <span className="text-sm text-muted-foreground">{tableLabel}</span>
          )}
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', statusInfo.bg, statusInfo.text)}>
          {statusInfo.label}
        </span>
      </div>

      {/* Items */}
      {items && items.length > 0 && (
        <div className="space-y-1 mb-3">
          {items.map((item, i) => (
            <p key={i} className="text-sm text-muted-foreground truncate">
              {item}
            </p>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        {total && (
          <span className="font-semibold text-foreground">{total}</span>
        )}
        {timestamp && (
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
          {actions}
        </div>
      )}
    </div>
  );
};
