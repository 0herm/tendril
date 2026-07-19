import * as React from 'react'
import { ChevronDown } from 'lucide-react'

function Select({ className = '', children, ...props }: React.ComponentProps<'select'>) {
    return (
        <div className='relative inline-flex items-center'>
            <select
                className={
                    'appearance-none h-10 rounded-xl border border-border ' +
                    'bg-white/4 pl-3.5 pr-8 py-2 text-sm text-foreground ' +
                    'shadow-[inset_0_1px_0_oklch(1_0_0/0.05)] ' +
                    'transition-colors outline-none cursor-pointer ' +
                    'focus-visible:border-ambient/50 focus-visible:ring-2 focus-visible:ring-ambient/15 ' +
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
