import { useCallback, useEffect, useRef, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzDialog */
export interface MizzDialogProps {
  /** Se verdadeiro, o dialog está aberto */
  open: boolean;
  /** Callback para fechar o dialog */
  onClose: () => void;
  /** Título do dialog */
  title?: string;
  /** Conteúdo do dialog */
  children: ReactNode;
  /** Ações do rodapé (botões) */
  actions?: ReactNode;
  /** Tamanho do dialog */
  size?: 'sm' | 'md' | 'lg';
  /** Fechar ao clicar no backdrop */
  closeOnBackdrop?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzDialog - Modal/dialog do Design System Mizz.
 * Suporte a focus trap, fechamento por Escape, e backdrop.
 * Tamanhos: sm, md, lg.
 */
export const MizzDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  closeOnBackdrop = true,
  className,
}: MizzDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap e ESC
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Simple focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    document.addEventListener('keydown', handleKeyDown);
    // Focus first focusable element
    const timer = setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 50);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  if (!open) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-overlay" aria-hidden="true" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full rounded-2xl bg-card shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200',
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-lg font-medium text-card-foreground">{title}</h2>
            <button
              type="button"
              className="p-1 rounded-full hover:bg-neutral-20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Fechar"
              onClick={onClose}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 text-sm text-muted-foreground">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
