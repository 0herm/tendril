import * as React from 'react'

type BadgeVariant = 'default' | 'glass' | 'brand' | 'ambient' | 'outline'

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-surface-3 text-foreground/90',
    glass:   'bg-black/60 backdrop-blur-sm text-white',
    brand:   'bg-brand/15 text-brand',
    ambient: 'bg-ambient/15 text-ambient',
    outline: 'border border-border-strong text-foreground/80',
}

interface BadgeProps extends React.ComponentProps<'span'> {
    variant?: BadgeVariant
}

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 ' +
                'text-[10px] font-semibold leading-none tabular-nums whitespace-nowrap ' +
                `${variantClasses[variant]} ${className}`
            }
            {...props}
        />
    )
}

export { Badge }
