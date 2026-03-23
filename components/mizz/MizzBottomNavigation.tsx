import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Item de navegação inferior */
export interface MizzBottomNavItem {
  /** Identificador único */
  value: string;
  /** Rótulo */
  label: string;
  /** Ícone */
  icon: ReactNode;
  /** Badge (número de notificações) */
  badge?: number;
}

/** Propriedades para o componente MizzBottomNavigation */
export interface MizzBottomNavigationProps {
  /** Itens de navegação */
  items: MizzBottomNavItem[];
  /** Item ativo */
  value: string;
  /** Callback quando o item muda */
  onChange?: (value: string) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzBottomNavigation - Navegação inferior do Design System Mizz.
 * Padrão mobile para apps de food service. Suporte a badges.
 */
export const MizzBottomNavigation = ({
  items,
  value,
  onChange,
  className,
}: MizzBottomNavigationProps) => {
  return (
    <nav
      className={cn(
        'flex items-stretch justify-around bg-card border-t border-border',
        'w-full h-16 px-2',
        className
      )}
      role="tablist"
      aria-label="Navegação principal"
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(item.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 transition-colors select-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span className="relative">
              <span className="flex items-center justify-center w-6 h-6">{item.icon}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 bg-negative-2 text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </span>
            <span className={cn('text-[10px]', isActive ? 'font-medium' : 'font-normal')}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
