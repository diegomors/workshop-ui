import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../ui/utils';

/** Propriedades para o componente MizzTextField */
export interface MizzTextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  /** Rótulo do campo */
  label?: string;
  /** Mensagem de erro a ser exibida */
  error?: string;
  /** Texto de suporte abaixo do campo */
  supportingText?: string;
  /** Ícone no início do campo (leading icon) */
  leadingIcon?: ReactNode;
  /** Ícone no final do campo (trailing icon) */
  trailingIcon?: ReactNode;
}

/**
 * MizzTextField - Campo de texto outlined do Design System Mizz.
 * Estilo: outlined (padrão). Estados: enabled, hovered, focused, error, disabled.
 */
const MizzTextField = forwardRef<HTMLInputElement, MizzTextFieldProps>(
  ({ className, label, error, supportingText, leadingIcon, trailingIcon, id, required, disabled, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const supportId = `${fieldId}-support`;

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Container do campo com label flutuante */}
        <div className={cn(
          'relative flex items-center rounded-sm border bg-transparent transition-all',
          error
            ? 'border-negative-2'
            : disabled
              ? 'border-neutral-40 opacity-38'
              : 'border-neutral-80 hover:border-neutral-900 focus-within:border-primary focus-within:border-2',
          className
        )}>
          {/* Leading icon */}
          {leadingIcon && (
            <span
              className={cn(
                'flex items-center pl-3 text-neutral-500',
                error && 'text-negative-2'
              )}
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
          )}

          {/* Input + floating label */}
          <div className="relative flex-1 min-w-0">
            <input
              id={fieldId}
              className={cn(
                'peer w-full h-14 bg-transparent px-4 text-base text-neutral-900 outline-none',
                'placeholder:text-transparent focus:placeholder:text-neutral-500',
                label && 'pt-5 pb-1',
                leadingIcon && 'pl-2',
                trailingIcon && 'pr-2',
                disabled && 'cursor-not-allowed',
              )}
              ref={ref}
              required={required}
              disabled={disabled}
              placeholder={props.placeholder || ' '}
              aria-invalid={!!error}
              aria-describedby={cn(
                error && errorId,
                supportingText && !error && supportId
              ) || undefined}
              {...props}
            />
            {label && (
              <label
                htmlFor={fieldId}
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 text-base transition-all pointer-events-none origin-top-left',
                  'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:scale-75 peer-focus:text-primary',
                  'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-75',
                  leadingIcon && 'left-2',
                  error ? 'text-negative-2' : 'text-neutral-500',
                )}
              >
                {label}
                {required && <span className="text-negative-2 ml-0.5">*</span>}
              </label>
            )}
          </div>

          {/* Trailing icon */}
          {trailingIcon && (
            <span
              className={cn(
                'flex items-center pr-3 text-neutral-500',
                error && 'text-negative-2'
              )}
              aria-hidden="true"
            >
              {trailingIcon}
            </span>
          )}
        </div>

        {/* Error / Supporting text */}
        {error && (
          <p
            id={errorId}
            className="text-xs text-negative-2 px-4"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {supportingText && !error && (
          <p id={supportId} className="text-xs text-neutral-500 px-4">
            {supportingText}
          </p>
        )}
      </div>
    );
  }
);

MizzTextField.displayName = 'MizzTextField';

export { MizzTextField };
