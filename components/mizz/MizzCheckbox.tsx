import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzCheckbox */
export interface MizzCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Rótulo do checkbox */
  label?: string;
  /** Mensagem de erro */
  error?: string;
  /** Estado indeterminado */
  indeterminate?: boolean;
}

/**
 * MizzCheckbox - Checkbox do Design System Mizz.
 * Estados: enabled, hovered, focused, checked, indeterminate, disabled, error.
 */
const MizzCheckbox = forwardRef<HTMLInputElement, MizzCheckboxProps>(
  ({ className, label, error, indeterminate, disabled, id, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id || generatedId;

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <label
          htmlFor={fieldId}
          className={cn(
            'inline-flex items-center gap-3 cursor-pointer group',
            disabled && 'opacity-38 cursor-not-allowed'
          )}
        >
          <span className="relative flex items-center justify-center">
            <input
              id={fieldId}
              ref={(node) => {
                if (node) node.indeterminate = !!indeterminate;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
              }}
              type="checkbox"
              disabled={disabled}
              className="peer sr-only"
              aria-invalid={!!error}
              {...props}
            />
            {/* Box */}
            <span
              className={cn(
                'w-5 h-5 rounded-sm border-2 transition-all flex items-center justify-center',
                'peer-checked:bg-primary peer-checked:border-primary',
                'peer-indeterminate:bg-primary peer-indeterminate:border-primary',
                error
                  ? 'border-negative-2'
                  : 'border-neutral-80 group-hover:border-neutral-900',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2'
              )}
            >
              {/* Checkmark */}
              <svg
                className="w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6l3 3 5-5" />
              </svg>
            </span>
            {/* Indeterminate mark (rendered on top if indeterminate) */}
            {indeterminate && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-2.5 h-0.5 bg-primary-foreground rounded-full" />
              </span>
            )}
          </span>
          {label && (
            <span className="text-base text-neutral-900 select-none">{label}</span>
          )}
        </label>
        {error && (
          <p className="text-xs text-negative-2 pl-8" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    );
  }
);

MizzCheckbox.displayName = 'MizzCheckbox';

export { MizzCheckbox };
