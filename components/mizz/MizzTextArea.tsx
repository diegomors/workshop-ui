import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzTextArea */
export interface MizzTextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Rótulo do campo */
  label?: string;
  /** Mensagem de erro */
  error?: string;
  /** Texto de suporte abaixo do campo */
  supportingText?: string;
  /** Contador de caracteres (exibe current/max) */
  maxLength?: number;
}

/**
 * MizzTextArea - Campo de texto multilinha do Design System Mizz.
 * Estilo outlined. Estados: enabled, hovered, focused, error, disabled.
 */
const MizzTextArea = forwardRef<HTMLTextAreaElement, MizzTextAreaProps>(
  ({ className, label, error, supportingText, id, required, disabled, maxLength, value, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const supportId = `${fieldId}-support`;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1 w-full">
        <div
          className={cn(
            'relative flex rounded-sm border bg-transparent transition-all',
            error
              ? 'border-negative-2'
              : disabled
                ? 'border-neutral-40 opacity-38'
                : 'border-neutral-80 hover:border-neutral-900 focus-within:border-primary focus-within:border-2',
            className
          )}
        >
          <div className="relative flex-1 min-w-0">
            <textarea
              id={fieldId}
              ref={ref}
              required={required}
              disabled={disabled}
              maxLength={maxLength}
              value={value}
              placeholder={props.placeholder || ' '}
              aria-invalid={!!error}
              aria-describedby={
                cn(error && errorId, supportingText && !error && supportId) || undefined
              }
              className={cn(
                'peer w-full min-h-[120px] bg-transparent px-4 py-3 text-base text-neutral-900 outline-none resize-y',
                'placeholder:text-transparent focus:placeholder:text-neutral-500',
                label && 'pt-6',
                disabled && 'cursor-not-allowed',
              )}
              {...props}
            />
            {label && (
              <label
                htmlFor={fieldId}
                className={cn(
                  'absolute left-4 top-4 text-base transition-all pointer-events-none origin-top-left',
                  'peer-focus:top-1.5 peer-focus:scale-75 peer-focus:text-primary',
                  'peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:scale-75',
                  error ? 'text-negative-2' : 'text-neutral-500',
                )}
              >
                {label}
                {required && <span className="text-negative-2 ml-0.5">*</span>}
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-between px-4">
          <div>
            {error && (
              <p id={errorId} className="text-xs text-negative-2" role="alert" aria-live="polite">
                {error}
              </p>
            )}
            {supportingText && !error && (
              <p id={supportId} className="text-xs text-neutral-500">
                {supportingText}
              </p>
            )}
          </div>
          {maxLength !== undefined && (
            <span className={cn('text-xs', charCount > maxLength ? 'text-negative-2' : 'text-neutral-500')}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

MizzTextArea.displayName = 'MizzTextArea';

export { MizzTextArea };
