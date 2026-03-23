import { useState, useCallback, useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Item do accordion */
export interface MizzAccordionItem {
  /** Identificador único */
  value: string;
  /** Título */
  title: string;
  /** Conteúdo */
  content: ReactNode;
  /** Desabilitado */
  disabled?: boolean;
}

/** Propriedades para o componente MizzAccordion */
export interface MizzAccordionProps {
  /** Itens do accordion */
  items: MizzAccordionItem[];
  /** Modo de abertura */
  type?: 'single' | 'multiple';
  /** Valor(es) aberto(s) inicialmente */
  defaultValue?: string[];
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzAccordion - Componente expansível do Design System Mizz.
 * Modos: single (apenas um aberto) e multiple (vários abertos).
 */
export const MizzAccordion = ({
  items,
  type = 'single',
  defaultValue = [],
  className,
}: MizzAccordionProps) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue);
  const groupId = useId();

  const toggle = useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        }
        if (type === 'single') return [value];
        return [...prev, value];
      });
    },
    [type]
  );

  return (
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.value);
        const triggerId = `${groupId}-trigger-${item.value}`;
        const panelId = `${groupId}-panel-${item.value}`;

        return (
          <div key={item.value}>
            <button
              id={triggerId}
              type="button"
              onClick={() => !item.disabled && toggle(item.value)}
              disabled={item.disabled}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className={cn(
                'flex w-full items-center justify-between py-4 text-sm font-medium text-card-foreground text-left transition-colors',
                'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'disabled:opacity-38 disabled:pointer-events-none'
              )}
            >
              <span>{item.title}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={cn('flex-shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={cn(
                'overflow-hidden transition-all duration-200',
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="pb-4 text-sm text-muted-foreground">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
