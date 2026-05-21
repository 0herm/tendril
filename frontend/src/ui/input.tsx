import * as React from 'react'

function Input({ className = '', type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            className={
                'flex h-9 w-full min-w-0 rounded-lg border border-border ' +
                'bg-muted/30 px-3 py-2 text-base sm:text-sm text-foreground ' +
                'placeholder:text-muted-foreground/50 ' +
                'transition-colors outline-none ' +
                'focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/10 ' +
                'file:border-0 file:bg-transparent file:text-base sm:file:text-sm file:font-medium file:text-foreground ' +
                'disabled:pointer-events-none disabled:opacity-50 ' +
                `${className}`
            }
            {...props}
        />
    )
}

export { Input }
