import { cn } from '../ui/utils';
import type { ReactNode } from 'react';

/** Propriedades para o componente MizzSplashScreen */
export interface MizzSplashScreenProps {
  /** Logo do app (ReactNode) */
  logo?: ReactNode;
  /** Nome do app exibido como texto */
  appName?: string;
  /** Variante de cor de fundo */
  variant?: 'dark' | 'primary' | 'light';
  /** Se verdadeiro, mostra um spinner de carregamento */
  loading?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzSplashScreen - Tela de splash/loading do Design System Mizz.
 * Tela cheia com logo centralizado e fundo de marca.
 */
export const MizzSplashScreen = ({
  logo,
  appName = 'xama',
  variant = 'dark',
  loading = false,
  className,
}: MizzSplashScreenProps) => {
  const bgMap = {
    dark: 'bg-neutral-900 text-neutral-0',
    primary: 'bg-primary text-primary-foreground',
    light: 'bg-background text-foreground',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-full min-h-[600px]',
        bgMap[variant],
        className
      )}
    >
      {logo || (
        <span className="text-4xl font-bold tracking-tight">{appName}</span>
      )}

      {loading && (
        <div className="mt-8">
          <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
    </div>
  );
};
