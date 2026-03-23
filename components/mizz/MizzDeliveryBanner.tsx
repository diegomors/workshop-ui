import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Propriedades para o componente MizzDeliveryBanner */
export interface MizzDeliveryBannerProps {
  /** Ícone */
  icon?: ReactNode;
  /** Texto principal */
  title: string;
  /** Subtexto (ex: tempo de preparo, mesa, status) */
  subtitle?: string;
  /** Variante */
  variant?: 'default' | 'success' | 'warning' | 'promo';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzDeliveryBanner - Banner informativo de food service do Design System Mizz.
 * Usado para exibir tempo de preparo, status da mesa, promoções, etc.
 */
export const MizzDeliveryBanner = ({
  icon,
  title,
  subtitle,
  variant = 'default',
  className,
}: MizzDeliveryBannerProps) => {
  const variantStyles = {
    default: 'bg-muted text-foreground',
    success: 'bg-positive-1 text-positive-2',
    warning: 'bg-warning-1 text-warning-2',
    promo: 'bg-primary/10 text-primary',
  };

  const defaultIcons: Record<string, ReactNode> = {
    default: (
      // Relógio - tempo de preparo
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    success: (
      // Prato com talheres - pedido pronto
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1" />
        <path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    warning: (
      // Alerta de cozinha
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3l7.5 13H2.5L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8.5v3M10 13.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    promo: (
      // Tag de desconto
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 10V3h7l8 8-7 7-8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" />
      </svg>
    ),
  };

  return (
    <div className={cn('flex items-center gap-3 px-4 py-2.5 rounded-lg', variantStyles[variant], className)}>
      <span className="flex-shrink-0">{icon || defaultIcons[variant]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {subtitle && <p className="text-xs opacity-80 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
