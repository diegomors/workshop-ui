import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Propriedades para o componente MizzSwitch */
export interface MizzSwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Rótulo do switch */
  label?: string;
  /** Mensagem de erro */
  error?: string;
}

/**
 * MizzSwitch - Toggle switch do Design System Mizz.
 * Estados: enabled, hovered, focused, checked, disabled.
 */
const MizzSwitch = forwardRef<HTMLInputElement, MizzSwitchProps>(
  ({ className, label, error, disabled, id, ...props }, ref) => {
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
          <span className="relative inline-flex items-center">
            <input
              id={fieldId}
              ref={ref}
              type="checkbox"
              role="switch"
              disabled={disabled}
              className="peer sr-only"
              aria-invalid={!!error}
              {...props}
            />
            {/* Track */}
            <span
              className={cn(
                'w-12 h-7 rounded-full transition-colors',
                'peer-checked:bg-primary',
                error
                  ? 'bg-negative-2/30'
                  : 'bg-neutral-50 group-hover:bg-neutral-60',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2'
              )}
            />
            {/* Thumb */}
            <span
              className={cn(
                'absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
                'peer-checked:translate-x-5'
              )}
            />
          </span>
          {label && (
            <span className="text-base text-neutral-900 select-none">{label}</span>
          )}
        </label>
        {error && (
          <p className="text-xs text-negative-2" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    );
  }
);

MizzSwitch.displayName = 'MizzSwitch';

export { MizzSwitch };
