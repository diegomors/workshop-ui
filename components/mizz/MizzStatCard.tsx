import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/** Propriedades para o componente MizzStatCard */
export interface MizzStatCardProps {
  /** Valor numérico ou texto principal */
  value: string;
  /** Rótulo/descrição abaixo do valor */
  label: string;
  /** Ícone ou ilustração no canto */
  icon?: ReactNode;
  /** Variante de cor de fundo */
  variant?: 'default' | 'primary' | 'accent';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzStatCard - Card de estatística/KPI do Design System Mizz.
 * Exibe um número grande com rótulo descritivo, ideal para dashboards.
 */
export const MizzStatCard = ({
  value,
  label,
  icon,
  variant = 'default',
  className,
}: MizzStatCardProps) => {
  const variantStyles = {
    default: 'bg-card text-card-foreground border border-border',
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground border border-border',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-4 flex flex-col gap-2 min-w-[140px]',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl font-bold">{value}</span>
        {icon && <span className="opacity-80">{icon}</span>}
      </div>
      <p className={cn(
        'text-sm',
        variant === 'primary' ? 'opacity-80' : 'text-muted-foreground'
      )}>
        {label}
      </p>
    </div>
  );
};
