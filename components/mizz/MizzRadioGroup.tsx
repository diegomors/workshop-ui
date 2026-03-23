import { forwardRef, useId } from 'react';
import { cn } from '../ui/utils';

/** Representação de uma opção de rádio */
export interface MizzRadioOption {
  /** Valor da opção */
  value: string;
  /** Rótulo da opção */
  label: string;
  /** Se verdadeiro, desabilita esta opção específica */
  disabled?: boolean;
}

/** Propriedades para o componente MizzRadioGroup */
export interface MizzRadioGroupProps {
  /** Nome do grupo de radio buttons */
  name: string;
  /** Opções disponíveis */
  options: MizzRadioOption[];
  /** Valor selecionado */
  value?: string;
  /** Callback quando o valor muda */
  onChange?: (value: string) => void;
  /** Rótulo do grupo */
  label?: string;
  /** Se verdadeiro, marca o campo como obrigatório */
  required?: boolean;
  /** Mensagem de erro */
  error?: string;
  /** Orientação do layout */
  orientation?: 'vertical' | 'horizontal';
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * MizzRadioGroup - Radio button do Design System Mizz (estilo Material).
 * Estados: enabled, hovered, focused, pressed, disabled.
 * Selected: true/false.
 */
const MizzRadioGroup = forwardRef<HTMLDivElement, MizzRadioGroupProps>(
  ({
    name,
    options,
    value,
    onChange,
    label,
    required,
    error,
    orientation = 'vertical',
    className,
  }, ref) => {
    const groupId = useId();
    const errorId = `${groupId}-error`;

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)}>
        {label && (
          <span className="text-sm font-medium text-neutral-900">
            {label}
            {required && <span className="text-negative-2 ml-0.5">*</span>}
          </span>
        )}

        <div
          role="radiogroup"
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'flex gap-3',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}
        >
          {options.map((option, index) => {
            const isChecked = value === option.value;
            const optionId = `${groupId}-${index}`;

            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  'inline-flex items-center gap-3 cursor-pointer group',
                  option.disabled && 'opacity-38 cursor-not-allowed'
                )}
              >
                <span className="relative flex items-center justify-center">
                  <input
                    id={optionId}
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => !option.disabled && onChange?.(e.target.value)}
                    disabled={option.disabled}
                    className="peer sr-only"
                  />
                  {/* Outer circle */}
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
                      isChecked
                        ? 'border-primary'
                        : error
                          ? 'border-negative-2'
                          : 'border-neutral-80 group-hover:border-neutral-900',
                      'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2'
                    )}
                  >
                    {/* Inner filled circle */}
                    <span
                      className={cn(
                        'w-2.5 h-2.5 rounded-full bg-primary transition-transform',
                        isChecked ? 'scale-100' : 'scale-0'
                      )}
                    />
                  </span>
                </span>
                <span className="text-base text-neutral-900">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>

        {error && (
          <p
            id={errorId}
            className="text-xs text-negative-2"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

MizzRadioGroup.displayName = 'MizzRadioGroup';

export { MizzRadioGroup };
