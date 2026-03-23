import { useState, useCallback } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzFeedbackCard */
export interface MizzFeedbackCardProps {
  /** Título do formulário (ex: "Avalie seu pedido") */
  title?: string;
  /** Subtítulo/instrução */
  subtitle?: string;
  /** Valor inicial do rating (1-5) */
  initialRating?: number;
  /** Placeholder do campo de texto */
  placeholder?: string;
  /** Texto do botão de envio */
  submitLabel?: string;
  /** Callback ao enviar feedback */
  onSubmit?: (data: { rating: number; comment: string }) => void;
  /** Se verdadeiro, desabilita o formulário */
  disabled?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzFeedbackCard - Formulário de feedback/avaliação do Design System Mizz.
 * Combina rating por estrelas com campo de comentário.
 */
export const MizzFeedbackCard = ({
  title = 'Avalie seu pedido',
  subtitle,
  initialRating = 0,
  placeholder = 'Deixe seu comentário (opcional)',
  submitLabel = 'Enviar',
  onSubmit,
  disabled = false,
  className,
}: MizzFeedbackCardProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = useCallback(() => {
    if (rating > 0) {
      onSubmit?.({ rating, comment });
    }
  }, [rating, comment, onSubmit]);

  return (
    <div className={cn('flex flex-col gap-4 p-6', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground text-center">{title}</h3>
      )}
      {subtitle && (
        <p className="text-sm text-muted-foreground text-center">{subtitle}</p>
      )}

      {/* Star rating */}
      <div className="flex justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className="p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded disabled:opacity-38 disabled:pointer-events-none"
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={(hoveredStar || rating) >= star ? 'var(--warning-2)' : 'none'}
              stroke={(hoveredStar || rating) >= star ? 'var(--warning-2)' : 'var(--neutral-50)'}
              strokeWidth="1.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>

      {/* Comment text area */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className={cn(
          'w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-foreground',
          'placeholder:text-muted-foreground resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
          'disabled:opacity-38 disabled:cursor-not-allowed'
        )}
      />

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || rating === 0}
        className={cn(
          'w-full h-14 rounded-lg font-medium text-base transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-38 disabled:pointer-events-none',
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80'
        )}
      >
        {submitLabel}
      </button>
    </div>
  );
};
