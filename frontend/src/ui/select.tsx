import * as React from 'react'
import { ChevronDown } from 'lucide-react'

function Select({ className = '', children, ...props }: React.ComponentProps<'select'>) {
    return (
        <div className='relative inline-flex items-center'>
            <select
                className={
                    'appearance-none h-9 rounded-xl border border-border/60 ' +
                    'bg-muted/30 pl-3 pr-8 py-2 text-sm text-foreground ' +
                    'transition-colors outline-none cursor-pointer ' +
                    'focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/10 ' +
                    'disabled:pointer-events-none disabled:opacity-50 ' +
                    `${className}`
                }
                {...props}
            >
                {children}
            </select>
            <ChevronDown className='pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground' />
        </div>
    )
}

export { Select }
