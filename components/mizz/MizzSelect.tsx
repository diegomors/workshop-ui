import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../ui/utils';

/** Opção para o select */
export interface MizzSelectOption {
  /** Valor da opção */
  value: string;
  /** Rótulo da opção */
  label: string;
  /** Desabilita esta opção */
  disabled?: boolean;
}

/** Propriedades para o componente MizzSelect */
export interface MizzSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Rótulo do campo */
  label?: string;
  /** Opções disponíveis */
  options: MizzSelectOption[];
  /** Texto placeholder quando nenhum valor está selecionado */
  placeholder?: string;
  /** Mensagem de erro */
  error?: string;
  /** Texto de suporte abaixo do campo */
  supportingText?: string;
  /** Ícone no início do campo */
  leadingIcon?: ReactNode;
}

/**
 * MizzSelect - Select/dropdown do Design System Mizz.
 * Estilo outlined. Estados: enabled, hovered, focused, error, disabled.
 */
const MizzSelect = forwardRef<HTMLSelectElement, MizzSelectProps>(
  ({ className, label, options, placeholder, error, supportingText, leadingIcon, id, required, disabled, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const supportId = `${fieldId}-support`;

    return (
      <div className="flex flex-col gap-1 w-full">
        <div
          className={cn(
            'relative flex items-center rounded-sm border bg-transparent transition-all',
            error
              ? 'border-negative-2'
              : disabled
                ? 'border-neutral-40 opacity-38'
                : 'border-neutral-80 hover:border-neutral-900 focus-within:border-primary focus-within:border-2',
            className
          )}
        >
          {leadingIcon && (
            <span
              className={cn('flex items-center pl-3 text-neutral-500', error && 'text-negative-2')}
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
          )}

          <div className="relative flex-1 min-w-0">
            <select
              id={fieldId}
              ref={ref}
              required={required}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={
                cn(error && errorId, supportingText && !error && supportId) || undefined
              }
              className={cn(
                'peer w-full h-14 bg-transparent px-4 text-base text-neutral-900 outline-none appearance-none',
                label && 'pt-5 pb-1',
                leadingIcon && 'pl-2',
                'pr-10',
                disabled && 'cursor-not-allowed',
              )}
              {...props}
            >
              {placeholder && (
                <option value="" disabled hidden>
                  {placeholder}
                </option>
              )}
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>

            {label && (
              <label
                htmlFor={fieldId}
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 text-base transition-all pointer-events-none origin-top-left',
                  'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:scale-75 peer-focus:text-primary',
                  'peer-[:not([value=""])]:top-2 peer-[:not([value=""])]:translate-y-0 peer-[:not([value=""])]:scale-75',
                  'peer-has-[option:checked:not([value=""])]:top-2 peer-has-[option:checked:not([value=""])]:translate-y-0 peer-has-[option:checked:not([value=""])]:scale-75',
                  leadingIcon && 'left-2',
                  error ? 'text-negative-2' : 'text-neutral-500',
                )}
              >
                {label}
                {required && <span className="text-negative-2 ml-0.5">*</span>}
              </label>
            )}
          </div>

          {/* Dropdown arrow */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {error && (
          <p id={errorId} className="text-xs text-negative-2 px-4" role="alert" aria-live="polite">
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

MizzSelect.displayName = 'MizzSelect';

export { MizzSelect };
