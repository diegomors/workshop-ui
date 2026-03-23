import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
  type FormEvent,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  Search,
  AlertTriangle,
  X,
  Info,
  CheckCircle2,
  ChefHat,
  Truck,
  Store,
  PackageCheck,
  Clock,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

/** Status possíveis no fluxo do Kanban */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered';

/** Registro de timestamp para cada mudança de status */
export interface StatusTimestamp {
  /** Status ao qual o pedido transitou */
  status: OrderStatus;
  /** Data/hora exata da transição */
  timestamp: Date;
}

/** Configuração de uma coluna do board */
export interface OrderBoardColumn {
  /** Identificador do status */
  status: OrderStatus;
  /** Rótulo exibido no cabeçalho da coluna */
  label: string;
  /** Cor do badge de contagem (classe Tailwind de background) */
  badgeColor?: string;
}

/** Um pedido no board */
export interface OrderBoardItem {
  /** ID único do pedido */
  id: string;
  /** Número/ID visível do pedido */
  orderNumber: string;
  /** Status atual do pedido */
  status: OrderStatus;
  /** Data/hora de criação do pedido */
  createdAt: Date;
  /** Histórico de transições de status com timestamps */
  statusHistory: StatusTimestamp[];
  /** Valor total em centavos (ex: 6790 = R$ 67,90) */
  totalCents: number;
  /** Itens do pedido (resumo) */
  items?: string[];
  /** Identificador da mesa */
  tableLabel?: string;
  /** Código de verificação do entregador */
  deliveryCode?: string;
  /** Código de verificação do cliente */
  customerCode?: string;
}

/** Propriedades para o componente MizzOrderBoard */
export interface MizzOrderBoardProps {
  /** Título do painel */
  title?: string;
  /** Descrição do painel */
  description?: string;
  /** Colunas do board (status e rótulos) */
  columns: OrderBoardColumn[];
  /** Pedidos a serem exibidos */
  orders: OrderBoardItem[];
  /** Callback ao mover um pedido para outro status */
  onOrderMove?: (orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus) => void;
  /** Callback de validação de código. Retorna true se o código é válido. */
  onValidateCode?: (orderId: string, code: string, type: 'delivery' | 'customer') => boolean;
  /** Render customizado para o card de pedido */
  renderOrder?: (order: OrderBoardItem) => ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

// ─── Status Config ──────────────────────────────────────────────────

interface StatusColorConfig {
  border: string;
  badgeBg: string;
  badgeText: string;
  buttonBg: string;
  buttonText: string;
  icon: ReactNode;
  label: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusColorConfig> = {
  pending: {
    border: 'border-t-blue-500',
    badgeBg: 'bg-blue-50 dark:bg-blue-950',
    badgeText: 'text-blue-700 dark:text-blue-300',
    buttonBg: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    buttonText: 'text-white',
    icon: <Clock className="w-4 h-4" />,
    label: 'Novo',
  },
  confirmed: {
    border: 'border-t-cyan-500',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    buttonBg: 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700',
    buttonText: 'text-white',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Confirmado',
  },
  preparing: {
    border: 'border-t-orange-500',
    badgeBg: 'bg-orange-50 dark:bg-orange-950',
    badgeText: 'text-orange-700 dark:text-orange-300',
    buttonBg: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
    buttonText: 'text-white',
    icon: <Flame className="w-4 h-4" />,
    label: 'Em Preparo',
  },
  ready: {
    border: 'border-t-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700',
    buttonText: 'text-white',
    icon: <ChefHat className="w-4 h-4" />,
    label: 'Pronto',
  },
  delivering: {
    border: 'border-t-purple-500',
    badgeBg: 'bg-purple-50 dark:bg-purple-950',
    badgeText: 'text-purple-700 dark:text-purple-300',
    buttonBg: 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700',
    buttonText: 'text-white',
    icon: <Truck className="w-4 h-4" />,
    label: 'Em Rota',
  },
  delivered: {
    border: 'border-t-neutral-400',
    badgeBg: 'bg-neutral-100 dark:bg-neutral-800',
    badgeText: 'text-neutral-500 dark:text-neutral-400',
    buttonBg: 'bg-neutral-200',
    buttonText: 'text-neutral-500',
    icon: <PackageCheck className="w-4 h-4" />,
    label: 'Finalizado',
  },
};

// ─── Helpers ────────────────────────────────────────────────────────

/** Formata tempo exato em horas e minutos */
function formatExactTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  return `${minutes}m`;
}

/** Formata valor em BRL */
function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/** Mapa do fluxo linear de status */
const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: null, // bifurca
  delivering: 'delivered',
  delivered: null,
};

/** Rótulos dos botões de ação para cada status */
const ACTION_LABELS: Record<OrderStatus, string> = {
  pending: 'Confirmar Pedido',
  confirmed: 'Iniciar Preparo',
  preparing: 'Finalizar Preparo',
  ready: '', // bifurca
  delivering: 'Confirmar Entrega',
  delivered: 'Pedido Concluído',
};

// Status que exigem código em vez de modal
type CodeRequiredAction = {
  type: 'delivery' | 'customer';
  placeholder: string;
  targetStatus: OrderStatus;
};

function getCodeRequiredActions(status: OrderStatus): CodeRequiredAction[] | null {
  if (status === 'ready') {
    return [
      { type: 'delivery', placeholder: 'Cód. Entregador', targetStatus: 'delivering' },
      { type: 'customer', placeholder: 'Cód. Cliente', targetStatus: 'delivered' },
    ];
  }
  if (status === 'delivering') {
    return [{ type: 'customer', placeholder: 'Cód. Cliente', targetStatus: 'delivered' }];
  }
  return null;
}

// ─── Sub-components ─────────────────────────────────────────────────

/** Popover de histórico de tempo */
function TimeHistoryPopover({
  order,
  columns,
}: {
  order: OrderBoardItem;
  columns: OrderBoardColumn[];
}) {
  const now = new Date();
  const totalMs = now.getTime() - order.createdAt.getTime();

  const history = order.statusHistory.map((entry, i) => {
    const nextTimestamp =
      i < order.statusHistory.length - 1
        ? order.statusHistory[i + 1].timestamp
        : now;
    const durationMs = nextTimestamp.getTime() - entry.timestamp.getTime();
    const colLabel = columns.find((c) => c.status === entry.status)?.label || entry.status;
    return { label: colLabel, duration: formatExactTime(durationMs), status: entry.status };
  });

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Ver histórico de tempo"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">{formatExactTime(totalMs)}</span>
          <Info className="w-3 h-3 opacity-60" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white p-4 shadow-lg animate-in fade-in zoom-in-95 duration-150"
          sideOffset={8}
          collisionPadding={12}
        >
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-3">
            Histórico de tempo
          </p>
          <div className="space-y-2.5">
            {history.map((entry, i) => {
              const cfg = STATUS_CONFIG[entry.status as OrderStatus];
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      entry.status === order.status ? 'animate-pulse' : '',
                      `bg-${entry.status === 'pending' ? 'blue' : entry.status === 'confirmed' ? 'cyan' : entry.status === 'preparing' ? 'orange' : entry.status === 'ready' ? 'emerald' : entry.status === 'delivering' ? 'purple' : 'neutral'}-500`
                    )}
                  />
                  <span className="text-xs text-neutral-300 flex-1">{entry.label}</span>
                  <span className="text-xs font-mono font-medium text-white">
                    {entry.duration}
                  </span>
                </div>
              );
            })}
          </div>
          <Popover.Arrow className="fill-neutral-900 dark:fill-neutral-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Modal anti-acidentes */
function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  targetStatus,
  orderNumber,
  columns,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetStatus: OrderStatus;
  orderNumber: string;
  columns: OrderBoardColumn[];
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[targetStatus];
  const targetLabel = columns.find((c) => c.status === targetStatus)?.label || targetStatus;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('button[data-confirm]')?.focus();
    }, 50);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Confirmar mover pedido #${orderNumber}`}
        className="relative w-full max-w-sm rounded-2xl bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex flex-col items-center gap-3 p-6">
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              cfg.badgeBg
            )}
          >
            <span className={cfg.badgeText}>{cfg.icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground text-center">
            Mover #{orderNumber}
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Confirma mover o pedido para <strong className={cfg.badgeText}>{targetLabel}</strong>?
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-neutral-20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancelar
          </button>
          <button
            type="button"
            data-confirm
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              'flex-1 h-11 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              cfg.buttonBg,
              cfg.buttonText
            )}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Formulário inline de validação de código */
function CodeConfirmationForm({
  placeholder,
  icon,
  colorClass,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  icon: ReactNode;
  colorClass: string;
  onSubmit: (code: string) => boolean;
  onCancel: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(true);
      return;
    }
    const valid = onSubmit(code.trim());
    if (!valid) {
      setError(true);
    } else {
      setCode('');
      setError(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-1.5">
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder={placeholder}
            className={cn(
              'w-full h-9 px-3 text-sm rounded-lg border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors',
              error ? 'border-red-400' : 'border-border'
            )}
          />
        </div>
        <button
          type="submit"
          className={cn(
            'h-9 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
            colorClass,
            'text-white'
          )}
        >
          {icon}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-neutral-20 transition-colors"
          aria-label="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">
          Código inválido. Tente novamente.
        </p>
      )}
    </form>
  );
}

/** Card de pedido dentro do board */
function OrderCard({
  order,
  columns,
  onMove,
  onValidateCode,
}: {
  order: OrderBoardItem;
  columns: OrderBoardColumn[];
  onMove?: (orderId: string, from: OrderStatus, to: OrderStatus) => void;
  onValidateCode?: (orderId: string, code: string, type: 'delivery' | 'customer') => boolean;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<OrderStatus>('confirmed');
  const [activeCodeForm, setActiveCodeForm] = useState<CodeRequiredAction | null>(null);

  const handleAction = (targetStatus: OrderStatus) => {
    setModalTarget(targetStatus);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    onMove?.(order.id, order.status, modalTarget);
  };

  const codeActions = getCodeRequiredActions(order.status);

  const renderActions = () => {
    if (order.status === 'delivered') {
      return (
        <button
          type="button"
          disabled
          className="w-full h-10 rounded-lg text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <PackageCheck className="w-4 h-4" />
          Pedido Concluído
        </button>
      );
    }

    // Code forms for ready/delivering
    if (activeCodeForm) {
      return (
        <CodeConfirmationForm
          placeholder={activeCodeForm.placeholder}
          icon={
            activeCodeForm.type === 'delivery' ? (
              <Truck className="w-4 h-4" />
            ) : (
              <Store className="w-4 h-4" />
            )
          }
          colorClass={
            activeCodeForm.targetStatus === 'delivering'
              ? 'bg-purple-500 hover:bg-purple-600'
              : 'bg-emerald-500 hover:bg-emerald-600'
          }
          onSubmit={(code) => {
            const valid = onValidateCode?.(order.id, code, activeCodeForm.type) ?? true;
            if (valid) {
              onMove?.(order.id, order.status, activeCodeForm.targetStatus);
              setActiveCodeForm(null);
            }
            return valid;
          }}
          onCancel={() => setActiveCodeForm(null)}
        />
      );
    }

    // Ready: bifurcation with code-entry buttons
    if (codeActions) {
      if (order.status === 'ready') {
        return (
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => setActiveCodeForm(codeActions[0])}
              className="flex-1 h-10 rounded-lg text-sm font-medium bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Truck className="w-4 h-4" />
              Despachar
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeForm(codeActions[1])}
              className="flex-1 h-10 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Store className="w-4 h-4" />
              Retirado
            </button>
          </div>
        );
      }
      // delivering: code entry button
      return (
        <button
          type="button"
          onClick={() => setActiveCodeForm(codeActions[0])}
          className={cn(
            'w-full h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            cfg.buttonBg,
            cfg.buttonText
          )}
        >
          {cfg.icon}
          {ACTION_LABELS[order.status]}
        </button>
      );
    }

    // Standard linear flow
    const nextStatus = STATUS_FLOW[order.status];
    if (!nextStatus) return null;

    const nextCfg = STATUS_CONFIG[nextStatus];
    return (
      <button
        type="button"
        onClick={() => handleAction(nextStatus)}
        className={cn(
          'w-full h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          nextCfg.buttonBg,
          nextCfg.buttonText
        )}
      >
        {nextCfg.icon}
        {ACTION_LABELS[order.status]}
      </button>
    );
  };

  return (
    <>
      <div
        className={cn(
          'rounded-xl border border-border bg-card p-3.5 transition-all border-t-4',
          cfg.border
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-foreground text-sm">#{order.orderNumber}</span>
          <span
            className={cn(
              'text-[10px] font-medium px-2 py-0.5 rounded-full',
              cfg.badgeBg,
              cfg.badgeText
            )}
          >
            {cfg.label}
          </span>
        </div>

        {/* Time + Value */}
        <div className="flex items-center justify-between mb-2">
          <TimeHistoryPopover order={order} columns={columns} />
          <span className="text-sm font-semibold text-foreground">
            {formatBRL(order.totalCents)}
          </span>
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-0.5 mb-3">
            {order.items.slice(0, 3).map((item, i) => (
              <p key={i} className="text-xs text-muted-foreground truncate">
                {item}
              </p>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{order.items.length - 3} itens
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-border">{renderActions()}</div>
      </div>

      <ConfirmationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        targetStatus={modalTarget}
        orderNumber={order.orderNumber}
        columns={columns}
      />
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

/**
 * MizzOrderBoard - Painel kanban de gerenciamento de pedidos do Design System Mizz.
 *
 * Quadro Kanban de rolagem horizontal otimizado para ambientes de alto estresse
 * (cozinhas, balcões). Suporta snap scroll em mobile, busca com alerta de filtro
 * ativo, modal anti-acidentes e validação inline por código.
 */
export const MizzOrderBoard = ({
  title = 'Painel de Pedidos',
  description = 'Gerencie o fluxo de preparo e entrega em tempo real.',
  columns,
  orders,
  onOrderMove,
  onValidateCode,
  renderOrder,
  className,
}: MizzOrderBoardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isFiltered = searchQuery.trim().length > 0;

  const filteredOrders = useMemo(() => {
    if (!isFiltered) return orders;
    const q = searchQuery.trim().replace('#', '').toLowerCase();
    return orders.filter((o) => o.orderNumber.toLowerCase().includes(q));
  }, [orders, searchQuery, isFiltered]);

  const getOrdersByStatus = useCallback(
    (status: OrderStatus) => filteredOrders.filter((o) => o.status === status),
    [filteredOrders]
  );

  const renderColumnContent = (column: OrderBoardColumn) => {
    const columnOrders = getOrdersByStatus(column.status);
    const emptyMessage = isFiltered ? 'NENHUM RESULTADO' : 'SEM PEDIDOS';

    return columnOrders.length === 0 ? (
      <div className="flex items-center justify-center min-h-[120px]">
        <span className="text-xs text-muted-foreground select-none uppercase tracking-wide">
          {emptyMessage}
        </span>
      </div>
    ) : (
      <div className="space-y-2.5">
        {columnOrders.map((order) =>
          renderOrder ? (
            <div key={order.id}>{renderOrder(order)}</div>
          ) : (
            <OrderCard
              key={order.id}
              order={order}
              columns={columns}
              onMove={onOrderMove}
              onValidateCode={onValidateCode}
            />
          )
        )}
      </div>
    );
  };

  const renderColumnHeader = (column: OrderBoardColumn) => {
    const count = getOrdersByStatus(column.status).length;
    return (
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">
          {column.label}
        </h3>
        <span
          className={cn(
            'min-w-6 h-6 text-xs font-medium rounded-full inline-flex items-center justify-center px-1.5',
            isFiltered
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              : count > 0
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
          )}
        >
          {count}
        </span>
      </div>
    );
  };

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-4 shrink-0">
          {title && (
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      )}

      {/* Search bar */}
      <div className="shrink-0 mb-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar pedido pelo número..."
            className={cn(
              'w-full h-10 pl-9 pr-9 text-sm rounded-lg bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors border',
              isFiltered
                ? 'border-amber-500 dark:border-amber-400'
                : 'border-border'
            )}
          />
          {isFiltered && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-neutral-20 transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter alert banner */}
        {isFiltered && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200 flex-1">
              Filtro ativo: Exibindo apenas{' '}
              <strong>&apos;#{searchQuery.trim().replace('#', '')}&apos;</strong>.
              Outros pedidos estão ocultos.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* Desktop: horizontal scroll with fixed-width columns */}
      <div
        ref={scrollRef}
        className="hidden md:flex gap-4 flex-1 overflow-x-auto overflow-y-hidden pb-2 scrollbar-none"
      >
        {columns.map((column) => (
          <div
            key={column.status}
            className="flex flex-col shrink-0"
            style={{ width: 340 }}
          >
            {renderColumnHeader(column)}
            <div className="flex-1 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 p-2.5 overflow-y-auto scrollbar-none">
              {renderColumnContent(column)}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: snap scroll horizontal */}
      <div className="md:hidden flex-1 overflow-hidden flex flex-col">
        {/* Column label pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-none shrink-0">
          {columns.map((column) => {
            const count = getOrdersByStatus(column.status).length;
            return (
              <button
                key={column.status}
                type="button"
                onClick={() => {
                  const el = document.getElementById(`col-mobile-${column.status}`);
                  el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                {column.label}
                <span
                  className={cn(
                    'min-w-4 h-4 text-[10px] rounded-full inline-flex items-center justify-center px-1',
                    isFiltered
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Snap-scrolling columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-none flex gap-3 pt-2">
          {columns.map((column) => (
            <div
              key={column.status}
              id={`col-mobile-${column.status}`}
              className="snap-center shrink-0 flex flex-col"
              style={{ width: '85vw' }}
            >
              {renderColumnHeader(column)}
              <div className="flex-1 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 p-2.5 overflow-y-auto scrollbar-none">
                {renderColumnContent(column)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
