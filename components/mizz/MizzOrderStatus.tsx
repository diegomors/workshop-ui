import { cn } from '../ui/utils';

/** Um passo do status do pedido */
export interface MizzOrderStep {
  /** Rótulo do passo */
  label: string;
  /** Descrição/horário */
  description?: string;
  /** Status do passo */
  status: 'completed' | 'current' | 'pending';
  /** Ícone customizado (ReactNode) */
  icon?: React.ReactNode;
}

/** Propriedades para o componente MizzOrderStatus */
export interface MizzOrderStatusProps {
  /** Passos do pedido */
  steps: MizzOrderStep[];
  /** Orientação */
  orientation?: 'vertical' | 'horizontal';
  /** Classes CSS adicionais */
  className?: string;
}

const defaultIcons: Record<string, React.ReactNode> = {
  completed: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  current: (
    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
  ),
  pending: (
    <span className="w-2 h-2 rounded-full bg-current" />
  ),
};

/**
 * MizzOrderStatus - Timeline de status do pedido do Design System Mizz.
 * Usado para acompanhar pedidos em food service (mesa → cozinha → pronto → servido).
 * Passos: completed, current, pending.
 */
export const MizzOrderStatus = ({
  steps,
  orientation = 'vertical',
  className,
}: MizzOrderStatusProps) => {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-start w-full', className)}>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={i} className={cn('flex items-start', !isLast && 'flex-1')}>
              <div className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    step.status === 'completed' && 'bg-positive-2 text-white',
                    step.status === 'current' && 'bg-primary text-primary-foreground',
                    step.status === 'pending' && 'bg-muted text-muted-foreground'
                  )}
                >
                  {step.icon || defaultIcons[step.status]}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    'text-xs mt-1.5 text-center max-w-[80px]',
                    step.status === 'current' ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {!isLast && (
                <div className="flex-1 mt-4 mx-1">
                  <div
                    className={cn(
                      'h-0.5 w-full rounded-full',
                      step.status === 'completed' ? 'bg-positive-2' : 'bg-border'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical (default)
  return (
    <div className={cn('flex flex-col', className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex gap-3">
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  step.status === 'completed' && 'bg-positive-2 text-white',
                  step.status === 'current' && 'bg-primary text-primary-foreground',
                  step.status === 'pending' && 'bg-muted text-muted-foreground'
                )}
              >
                {step.icon || defaultIcons[step.status]}
              </div>
              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[24px]',
                    step.status === 'completed' ? 'bg-positive-2' : 'bg-border'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-4', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm leading-8',
                  step.status === 'current' ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
