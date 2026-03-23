import { useCallback, type ReactNode, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

/** Representação de uma aba */
export interface MizzTab {
  /** Identificador único */
  value: string;
  /** Rótulo exibido */
  label: string;
  /** Ícone */
  icon?: ReactNode;
  /** Desabilitar esta aba */
  disabled?: boolean;
}

/** Propriedades para o componente MizzTabs */
export interface MizzTabsProps {
  /** Lista de abas */
  tabs: MizzTab[];
  /** Aba selecionada */
  value: string;
  /** Callback quando a aba muda */
  onChange?: (value: string) => void;
  /** Estilo visual */
  variant?: 'underline' | 'filled';
  /** Expandir para ocupar toda a largura */
  fullWidth?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzTabs - Componente de abas do Design System Mizz.
 * Variantes: underline (padrão) e filled. Estados: enabled, selected, disabled.
 * Suporte a navegação por teclado (setas esquerda/direita).
 */
export const MizzTabs = ({
  tabs,
  value,
  onChange,
  variant = 'underline',
  fullWidth,
  className,
}: MizzTabsProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const enabledTabs = tabs.filter((t) => !t.disabled);
      const currentIndex = enabledTabs.findIndex((t) => t.value === value);
      let nextIndex = -1;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % enabledTabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = enabledTabs.length - 1;
      }

      if (nextIndex >= 0) {
        e.preventDefault();
        onChange?.(enabledTabs[nextIndex].value);
      }
    },
    [tabs, value, onChange]
  );

  return (
    <div
      role="tablist"
      className={cn(
        'flex',
        variant === 'underline' && 'border-b border-neutral-30',
        variant === 'filled' && 'bg-neutral-20 rounded-lg p-1 gap-1',
        fullWidth && 'w-full',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isSelected = tab.value === value;

        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isSelected}
            aria-disabled={tab.disabled}
            tabIndex={isSelected ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange?.(tab.value)}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all select-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'disabled:opacity-38 disabled:pointer-events-none',
              fullWidth && 'flex-1',
              variant === 'underline' && [
                'border-b-2 -mb-px',
                isSelected
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-40',
              ],
              variant === 'filled' && [
                'rounded-md',
                isSelected
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900',
              ],
            )}
          >
            {tab.icon && <span className="flex items-center" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
