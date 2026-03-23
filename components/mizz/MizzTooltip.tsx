import { useState, useRef, type ReactNode } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzTooltip */
export interface MizzTooltipProps {
  /** Conteúdo do tooltip */
  content: string;
  /** Elemento que aciona o tooltip */
  children: ReactNode;
  /** Posição */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Classes CSS adicionais */
  className?: string;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * MizzTooltip - Tooltip do Design System Mizz.
 * Acessível via hover e focus. Posições: top, bottom, left, right.
 */
export const MizzTooltip = ({
  content,
  children,
  position = 'top',
  className,
}: MizzTooltipProps) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap pointer-events-none',
            'bg-neutral-900 text-neutral-0 shadow-md',
            'animate-in fade-in zoom-in-95 duration-150',
            positionStyles[position],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};
