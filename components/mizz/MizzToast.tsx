import { useEffect, useCallback, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const mizzToastVariants = cva(
  'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm min-w-[280px] max-w-md',
  {
    variants: {
      variant: {
        /** Padrão/neutro */
        default: 'bg-neutral-900 text-neutral-0',
        /** Sucesso */
        success: 'bg-positive-2 text-white',
        /** Erro */
        error: 'bg-negative-2 text-white',
        /** Informativo */
        info: 'bg-primary text-primary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/** Propriedades para o componente MizzToast */
export interface MizzToastProps extends VariantProps<typeof mizzToastVariants> {
  /** Se verdadeiro, o toast está visível */
  open: boolean;
  /** Callback para fechar o toast */
  onClose: () => void;
  /** Mensagem do toast */
  children: ReactNode;
  /** Ação (ex: botão "Desfazer") */
  action?: ReactNode;
  /** Duração em ms (0 = sem auto-fechar). Padrão: 5000 */
  duration?: number;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzToast - Notificação temporária (snackbar) do Design System Mizz.
 * Variantes: default, success, error, info. Auto-fecha após duration.
 */
export const MizzToast = ({
  open,
  onClose,
  variant,
  children,
  action,
  duration = 5000,
  className,
}: MizzToastProps) => {
  useEffect(() => {
    if (!open || duration === 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        role="alert"
        aria-live="polite"
        className={cn(mizzToastVariants({ variant }), className)}
      >
        <span className="flex-1">{children}</span>
        {action && <span className="flex-shrink-0">{action}</span>}
        <button
          type="button"
          className="flex-shrink-0 p-0.5 rounded-sm hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Fechar"
          onClick={handleClose}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};
