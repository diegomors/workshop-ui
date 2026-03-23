import { cn } from '../ui/utils';
import { MizzAvatar } from './MizzAvatar';
import type { ReactNode } from 'react';

/** Propriedades para o componente MizzProfileCard */
export interface MizzProfileCardProps {
  /** Nome do usuário */
  name: string;
  /** URL da foto de perfil */
  avatarSrc?: string;
  /** Iniciais para fallback do avatar */
  initials?: string;
  /** Se verdadeiro, mostra botão de editar foto */
  editable?: boolean;
  /** Callback ao clicar para editar foto */
  onEditPhoto?: () => void;
  /** Conteúdo extra abaixo do nome (badge, email, etc.) */
  subtitle?: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzProfileCard - Cabeçalho de perfil com avatar editável.
 * Exibe avatar com overlay de câmera, nome e subtítulo.
 */
export const MizzProfileCard = ({
  name,
  avatarSrc,
  initials,
  editable = false,
  onEditPhoto,
  subtitle,
  className,
}: MizzProfileCardProps) => {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Avatar with edit overlay */}
      <div className="relative">
        <MizzAvatar
          src={avatarSrc}
          alt={name}
          initials={initials}
          size="xl"
        />
        {editable && (
          <button
            type="button"
            onClick={onEditPhoto}
            className="absolute bottom-0 right-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Alterar foto de perfil"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        )}
      </div>

      {/* Name & subtitle */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  );
};
