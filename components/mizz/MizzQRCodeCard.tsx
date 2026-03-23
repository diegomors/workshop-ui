import { cn } from '../ui/utils';

/** Propriedades para o componente MizzQRCodeCard */
export interface MizzQRCodeCardProps {
  /** Valor/conteúdo do QR code (exibido abaixo) */
  value?: string;
  /** Título acima do QR code */
  title?: string;
  /** Subtítulo ou instrução */
  subtitle?: string;
  /** Callback ao copiar o link */
  onCopyLink?: () => void;
  /** Texto do botão de registro/ação */
  actionLabel?: string;
  /** Callback do botão de ação */
  onAction?: () => void;
  /** Texto do link compartilhar */
  shareLabel?: string;
  /** Callback compartilhar */
  onShare?: () => void;
  /** Tamanho do QR code placeholder */
  size?: 'sm' | 'md' | 'lg';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzQRCodeCard - Card de exibição de QR code do Design System Mizz.
 * Exibe QR code placeholder, valor, e botões de ação.
 */
export const MizzQRCodeCard = ({
  value,
  title,
  subtitle,
  onCopyLink,
  actionLabel,
  onAction,
  shareLabel,
  onShare,
  size = 'md',
  className,
}: MizzQRCodeCardProps) => {
  const sizeMap = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <div className={cn('flex flex-col items-center gap-4 p-6', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      {subtitle && (
        <p className="text-sm text-muted-foreground text-center">{subtitle}</p>
      )}

      {/* QR code placeholder */}
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border-2 border-border bg-neutral-0',
          sizeMap[size]
        )}
      >
        {/* SVG QR pattern placeholder */}
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%]">
          <rect x="5" y="5" width="25" height="25" fill="currentColor" />
          <rect x="70" y="5" width="25" height="25" fill="currentColor" />
          <rect x="5" y="70" width="25" height="25" fill="currentColor" />
          <rect x="10" y="10" width="15" height="15" fill="white" />
          <rect x="75" y="10" width="15" height="15" fill="white" />
          <rect x="10" y="75" width="15" height="15" fill="white" />
          <rect x="13" y="13" width="9" height="9" fill="currentColor" />
          <rect x="78" y="13" width="9" height="9" fill="currentColor" />
          <rect x="13" y="78" width="9" height="9" fill="currentColor" />
          <rect x="35" y="5" width="5" height="5" fill="currentColor" />
          <rect x="45" y="5" width="5" height="5" fill="currentColor" />
          <rect x="55" y="5" width="5" height="5" fill="currentColor" />
          <rect x="35" y="15" width="5" height="5" fill="currentColor" />
          <rect x="50" y="15" width="5" height="5" fill="currentColor" />
          <rect x="35" y="35" width="5" height="5" fill="currentColor" />
          <rect x="45" y="45" width="10" height="10" fill="currentColor" />
          <rect x="60" y="35" width="5" height="5" fill="currentColor" />
          <rect x="70" y="45" width="5" height="5" fill="currentColor" />
          <rect x="80" y="40" width="5" height="5" fill="currentColor" />
          <rect x="35" y="70" width="5" height="5" fill="currentColor" />
          <rect x="50" y="65" width="5" height="5" fill="currentColor" />
          <rect x="60" y="70" width="5" height="5" fill="currentColor" />
          <rect x="70" y="80" width="5" height="5" fill="currentColor" />
          <rect x="85" y="70" width="5" height="5" fill="currentColor" />
          <rect x="75" y="60" width="5" height="5" fill="currentColor" />
        </svg>
      </div>

      {/* Value text */}
      {value && (
        <p className="text-xs text-muted-foreground font-mono break-all text-center max-w-[200px]">
          {value}
        </p>
      )}

      {/* Copy link */}
      {onCopyLink && (
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copiar link
        </button>
      )}

      {/* Action button */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="w-full h-11 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-neutral-20 transition-colors"
        >
          {actionLabel}
        </button>
      )}

      {/* Share link */}
      {shareLabel && onShare && (
        <button
          type="button"
          onClick={onShare}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {shareLabel}
        </button>
      )}
    </div>
  );
};
