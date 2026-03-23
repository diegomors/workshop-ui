import { forwardRef, useCallback, type ReactNode, type MouseEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

const mizzAlertVariants = cva(
  'flex items-start gap-3 rounded-lg px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        /** Informativo */
        info: 'bg-primary/10 text-primary',
        /** Sucesso */
        success: 'bg-positive-1 text-positive-2',
        /** Aviso */
        warning: 'bg-[#fff3cd] text-[#856404]',
        /** Erro */
        error: 'bg-negative-1 text-negative-2',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

/** Propriedades para o componente MizzAlert */
export interface MizzAlertProps extends VariantProps<typeof mizzAlertVariants> {
  /** Título do alerta */
  title?: string;
  /** Conteúdo do alerta */
  children: ReactNode;
  /** Ícone customizado */
  icon?: ReactNode;
  /** Callback para fechar o alerta */
  onClose?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

const alertIcons: Record<string, ReactNode> = {
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v4M10 7h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3l7.5 13H2.5L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8.5v3M10 13.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * MizzAlert - Banner de alerta do Design System Mizz.
 * Variantes: info, success, warning, error. Com suporte a fechar.
 */
const MizzAlert = forwardRef<HTMLDivElement, MizzAlertProps>(
  ({ variant = 'info', title, children, icon, onClose, className }, ref) => {
    const handleClose = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onClose?.();
      },
      [onClose]
    );

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(mizzAlertVariants({ variant }), className)}
      >
        <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
          {icon || alertIcons[variant || 'info']}
        </span>
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium mb-0.5">{title}</p>}
          <div>{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="flex-shrink-0 p-0.5 rounded-sm hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            aria-label="Fechar alerta"
            onClick={handleClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

MizzAlert.displayName = 'MizzAlert';

export { MizzAlert, mizzAlertVariants };
