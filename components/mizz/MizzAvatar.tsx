import { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const mizzAvatarVariants = cva(
  'relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-neutral-30 text-neutral-500 font-medium select-none',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-14 w-14 text-lg',
        xl: 'h-20 w-20 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/** Propriedades para o componente MizzAvatar */
export interface MizzAvatarProps extends VariantProps<typeof mizzAvatarVariants> {
  /** URL da imagem */
  src?: string;
  /** Texto alternativo da imagem */
  alt?: string;
  /** Iniciais exibidas quando não há imagem */
  initials?: string;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzAvatar - Avatar do Design System Mizz.
 * Exibe imagem, iniciais ou ícone padrão. Fallback automático se a imagem falhar.
 */
export const MizzAvatar = ({ src, alt, initials, size, className }: MizzAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  const showImage = src && !imgError;

  return (
    <span className={cn(mizzAvatarVariants({ size }), className)} aria-label={alt}>
      {showImage ? (
        <img
          src={src}
          alt={alt || ''}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <span aria-hidden="true">{initials.slice(0, 2).toUpperCase()}</span>
      ) : (
        <svg className="h-[60%] w-[60%]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      )}
    </span>
  );
};
