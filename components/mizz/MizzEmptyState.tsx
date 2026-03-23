import { type ReactNode } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzEmptyState */
export interface MizzEmptyStateProps {
  /** Ícone ou ilustração */
  icon?: ReactNode;
  /** Título */
  title: string;
  /** Descrição */
  description?: string;
  /** Ação (ex: botão) */
  action?: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzEmptyState - Estado vazio do Design System Mizz.
 * Usado quando uma lista está vazia, busca não retorna resultados, etc.
 */
export const MizzEmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: MizzEmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      {icon ? (
        <div className="text-muted-foreground mb-4">{icon}</div>
      ) : (
        <div className="mb-4 text-muted-foreground">
          {/* Prato vazio com talheres */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M16 52l4-8M48 52l-4-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 16v12M14 16c0-2 1-4 3-4s3 2 3 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M50 16v16M48 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
