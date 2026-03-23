import { cn } from '@/lib/utils';

/** Propriedades para o componente MizzGaugeChart */
export interface MizzGaugeChartProps {
  /** Valor de 0 a 100 */
  value: number;
  /** Rótulo principal (ex: "28 min") */
  label?: string;
  /** Subtítulo abaixo do valor */
  subtitle?: string;
  /** Tag/badge à direita do valor */
  badge?: string;
  /** Cor do badge */
  badgeColor?: 'positive' | 'negative' | 'warning' | 'primary';
  /** Tamanho do gauge */
  size?: 'sm' | 'md' | 'lg';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzGaugeChart - Gráfico de gauge (semi-círculo) do Design System Mizz.
 * Exibe um indicador visual de progresso em formato de semicírculo.
 */
export const MizzGaugeChart = ({
  value,
  label,
  subtitle,
  badge,
  badgeColor = 'positive',
  size = 'md',
  className,
}: MizzGaugeChartProps) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  const sizeMap = {
    sm: { width: 120, stroke: 10 },
    md: { width: 180, stroke: 14 },
    lg: { width: 240, stroke: 18 },
  };

  const { width, stroke } = sizeMap[size];
  const radius = (width - stroke) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  const badgeColorMap = {
    positive: 'bg-positive-1 text-positive-2',
    negative: 'bg-negative-1 text-negative-2',
    warning: 'bg-warning-1 text-warning-2',
    primary: 'bg-primary/10 text-primary',
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={width}
        height={width / 2 + stroke}
        viewBox={`0 0 ${width} ${width / 2 + stroke}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
          fill="none"
          stroke="var(--neutral-30)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Label & badge */}
      <div className="flex items-center gap-2 -mt-4">
        {label && (
          <span className="text-2xl font-bold text-foreground">{label}</span>
        )}
        {badge && (
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', badgeColorMap[badgeColor])}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};
