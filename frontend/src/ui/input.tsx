import * as React from 'react'

function Input({ className = '', type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            className={
                'flex h-10 w-full min-w-0 rounded-xl border border-border ' +
                'bg-white/4 px-3.5 py-2 text-base sm:text-sm text-foreground ' +
                'shadow-[inset_0_1px_0_oklch(1_0_0/0.05)] ' +
                'placeholder:text-muted-foreground/50 ' +
                'transition-colors outline-none ' +
                'focus-visible:border-ambient/50 focus-visible:ring-2 focus-visible:ring-ambient/15 focus-visible:bg-white/6 ' +
                'file:border-0 file:bg-transparent file:text-base sm:file:text-sm file:font-medium file:text-foreground ' +
                'disabled:pointer-events-none disabled:opacity-50 ' +
                `${className}`
            }
            {...props}
        />
    )
}

export { Input }
