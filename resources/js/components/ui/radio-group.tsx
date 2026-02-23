// resources/js/components/ui/radio-group.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

// 1. Creamos un Contexto para pasar los datos del grupo a cada item.
interface RadioGroupContextProps {
    value: string;
    onValueChange: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextProps | null>(null);

// 2. Creamos el componente principal 'RadioGroup'.
interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value: controlledValue, defaultValue, onValueChange, children, ...props }, ref) => {
        // Manejamos el estado internamente si no es un componente controlado.
        const [internalValue, setInternalValue] = React.useState(defaultValue || '');
        
        const value = controlledValue ?? internalValue;

        const handleValueChange = (newValue: string) => {
            if (onValueChange) {
                onValueChange(newValue);
            }
            // Si no es controlado, actualizamos el estado interno.
            if (controlledValue === undefined) {
                setInternalValue(newValue);
            }
        };

        return (
            <RadioGroupContext.Provider value={{ value, onValueChange: handleValueChange }}>
                <div role="radiogroup" ref={ref} className={cn('grid gap-2', className)} {...props}>
                    {children}
                </div>
            </RadioGroupContext.Provider>
        );
    }
);
RadioGroup.displayName = 'RadioGroup';


// 3. Creamos el componente 'RadioGroupItem'.
interface RadioGroupItemProps extends React.HTMLAttributes<HTMLButtonElement> {
    value: string;
    id?: string;
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
    ({ className, value, ...props }, ref) => {
        const context = React.useContext(RadioGroupContext);
        
        if (!context) {
            throw new Error('RadioGroupItem debe ser usado dentro de un RadioGroup');
        }
        
        const isChecked = context.value === value;

        return (
            <button
                ref={ref}
                type="button" // Es un botón, no un submit
                role="radio"
                aria-checked={isChecked}
                onClick={() => context.onValueChange(value)}
                className={cn(
                    'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            >
                {/* Indicador visual (el círculo interior) */}
                {isChecked && (
                    <div className="flex items-center justify-center h-full w-full">
                         <div className="h-2.5 w-2.5 rounded-full bg-current text-current" />
                    </div>
                )}
            </button>
        );
    }
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };