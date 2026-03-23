import { useCallback, useEffect, useRef, type ReactNode, type MouseEvent } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzBottomSheet */
export interface MizzBottomSheetProps {
  /** Se verdadeiro, o bottom sheet está aberto */
  open: boolean;
  /** Callback para fechar */
  onClose: () => void;
  /** Título */
  title?: string;
  /** Conteúdo */
  children: ReactNode;
  /** Altura máxima (ex: "80vh", "400px") */
  maxHeight?: string;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzBottomSheet - Painel deslizante inferior do Design System Mizz.
 * Padrão mobile para detalhes de produto, filtros, etc.
 */
export const MizzBottomSheet = ({
  open,
  onClose,
  title,
  children,
  maxHeight = '80vh',
  className,
}: MizzBottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleBackdrop = useCallback(
    (e: MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={handleBackdrop}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-overlay" aria-hidden="true" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full rounded-t-2xl bg-card shadow-lg',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
        style={{ maxHeight }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-neutral-40" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pb-3">
            <h3 className="text-base font-medium text-card-foreground">{title}</h3>
            <button
              type="button"
              className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 80px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
};
