import { type ReactNode } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzMapCard */
export interface MizzMapCardProps {
  /** Título do local */
  title: string;
  /** Endereço */
  address: string;
  /** Distância (ex: "1.2 km") */
  distance?: string;
  /** Tempo estimado (ex: "15 min") */
  estimatedTime?: string;
  /** Ícone/avatar do local */
  icon?: ReactNode;
  /** Ação (ex: botão "Navegar") */
  action?: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzMapCard - Card de localização do Design System Mizz.
 * Usado para exibir informações de estabelecimentos e restaurantes.
 */
export const MizzMapCard = ({
  title,
  address,
  distance,
  estimatedTime,
  icon,
  action,
  className,
}: MizzMapCardProps) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl bg-card border border-border shadow-lg',
        className
      )}
    >
      {/* Icon / Avatar */}
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-card-foreground truncate">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{address}</p>
        {(distance || estimatedTime) && (
          <div className="flex items-center gap-3 mt-1.5">
            {distance && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
                  <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                </svg>
                {distance}
              </span>
            )}
            {estimatedTime && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
                  <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
                {estimatedTime}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      {action && <div className="flex-shrink-0 self-center">{action}</div>}
    </div>
  );
};
