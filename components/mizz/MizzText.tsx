import { type ReactNode, type ElementType } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const mizzTextVariants = cva('', {
  variants: {
    variant: {
      /** Display - texto hero grande */
      display: 'text-4xl font-bold leading-tight tracking-tight font-heading',
      /** Heading 1 */
      h1: 'text-3xl font-bold leading-tight font-heading',
      /** Heading 2 */
      h2: 'text-2xl font-bold leading-snug font-heading',
      /** Heading 3 */
      h3: 'text-xl font-medium leading-snug font-heading',
      /** Heading 4 */
      h4: 'text-lg font-medium leading-normal font-heading',
      /** Subtitle */
      subtitle: 'text-base font-medium leading-normal',
      /** Body (padrão) */
      body: 'text-base font-normal leading-relaxed',
      /** Body small */
      bodySmall: 'text-sm font-normal leading-relaxed',
      /** Caption */
      caption: 'text-xs font-normal leading-normal',
      /** Overline */
      overline: 'text-xs font-medium uppercase tracking-widest leading-normal',
      /** Label */
      label: 'text-sm font-medium leading-normal',
      /** Price - para exibição de preço */
      price: 'text-xl font-bold leading-tight tabular-nums',
      /** Price small */
      priceSmall: 'text-base font-bold leading-tight tabular-nums',
    },
    color: {
      default: 'text-foreground',
      primary: 'text-primary',
      secondary: 'text-muted-foreground',
      muted: 'text-neutral-80',
      success: 'text-positive-2',
      error: 'text-negative-2',
      warning: 'text-warning-2',
      info: 'text-info-2',
      inherit: 'text-inherit',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
    align: 'left',
    truncate: false,
  },
});

/** Mapeamento semântico de variante para tag HTML */
const variantTagMap: Record<string, ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  subtitle: 'p',
  body: 'p',
  bodySmall: 'p',
  caption: 'span',
  overline: 'span',
  label: 'label',
  price: 'span',
  priceSmall: 'span',
};

/** Propriedades para o componente MizzText */
export interface MizzTextProps extends VariantProps<typeof mizzTextVariants> {
  /** Conteúdo (pode conter MizzHighlight) */
  children: ReactNode;
  /** Sobrescrever a tag HTML semântica */
  as?: ElementType;
  /** Limitar a N linhas com line-clamp */
  lineClamp?: number;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzText - Componente tipográfico semântico do Design System Mizz.
 *
 * Renderiza a tag HTML correta automaticamente (h1, h2, p, span, etc.)
 * baseado na variante. Pode ser sobrescrito com `as`.
 *
 * Suporta `lineClamp` para truncar conteúdo longo.
 */
export const MizzText = ({
  variant = 'body',
  color,
  align,
  truncate,
  as,
  lineClamp,
  children,
  className,
}: MizzTextProps) => {
  const Tag = as || variantTagMap[variant || 'body'] || 'span';

  return (
    <Tag
      className={cn(
        mizzTextVariants({ variant, color, align, truncate }),
        lineClamp && `line-clamp-${lineClamp}`,
        className
      )}
      style={lineClamp ? { WebkitLineClamp: lineClamp, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}
    >
      {children}
    </Tag>
  );
};

/* ─── MizzHighlight ─── */

/** Propriedades para MizzHighlight */
export interface MizzHighlightProps {
  /** Conteúdo a ser destacado */
  children: ReactNode;
  /** Cor do destaque */
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  /** Tipo de destaque */
  variant?: 'text' | 'background' | 'underline';
  /** Peso da fonte */
  weight?: 'normal' | 'medium' | 'bold';
  /** Classes CSS adicionais */
  className?: string;
}

const highlightColorMap = {
  primary: { text: 'text-primary', bg: 'bg-primary/15 text-primary', underline: 'decoration-primary' },
  success: { text: 'text-positive-2', bg: 'bg-positive-1 text-positive-2', underline: 'decoration-positive-2' },
  error: { text: 'text-negative-2', bg: 'bg-negative-1 text-negative-2', underline: 'decoration-negative-2' },
  warning: { text: 'text-warning-2', bg: 'bg-warning-1 text-warning-2', underline: 'decoration-warning-2' },
  info: { text: 'text-info-2', bg: 'bg-info-1 text-info-2', underline: 'decoration-info-2' },
};

/**
 * MizzHighlight - Destaque inline para uso dentro de MizzText.
 *
 * Permite que apenas parte do texto se destaque com cor, fundo ou sublinhado.
 */
export const MizzHighlight = ({
  children,
  color = 'primary',
  variant = 'text',
  weight = 'medium',
  className,
}: MizzHighlightProps) => {
  const variantKey = variant === 'background' ? 'bg' : variant;
  const colorStyle = highlightColorMap[color][variantKey];
  const weightStyle = weight === 'bold' ? 'font-bold' : weight === 'medium' ? 'font-medium' : 'font-normal';

  return (
    <span
      className={cn(
        colorStyle,
        weightStyle,
        variant === 'background' && 'px-1 py-0.5 rounded-sm',
        variant === 'underline' && 'underline decoration-2 underline-offset-2',
        className
      )}
    >
      {children}
    </span>
  );
};
