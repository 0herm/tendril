import * as React from 'react'

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'glass' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
    default:     'bg-brand text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.25),0_1px_2px_oklch(0_0_0/0.4)] hover:bg-brand-dim active:bg-brand-dimmer',
    secondary:   'bg-muted text-foreground shadow-xs hover:bg-muted/70 active:bg-muted/60',
    outline:     'border border-border bg-transparent text-foreground shadow-xs hover:bg-muted active:bg-muted/70',
    destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90 active:bg-destructive/80',
    ghost:       'text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/70',
    glass:       'glass border border-white/10 text-white hover:bg-white/10 active:bg-white/15',
    link:        'text-brand underline-offset-4 hover:underline h-auto p-0',
}

const sizeClasses: Record<ButtonSize, string> = {
    default: 'h-9 px-4 py-2 rounded-xl',
    sm:      'h-8 px-3 text-xs rounded-lg gap-1.5',
    lg:      'h-11 px-5 rounded-xl',
    icon:    'size-9 rounded-xl',
}

interface ButtonProps extends React.ComponentProps<'button'> {
    variant?: ButtonVariant
    size?: ButtonSize
}

function Button({ className = '', variant = 'default', size = 'default', ...props }: ButtonProps) {
    const cls =
        'inline-flex items-center justify-center gap-2 whitespace-nowrap ' +
        'text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform,scale] duration-150 ' +
        'active:scale-[0.98] ' +
        'disabled:pointer-events-none disabled:opacity-40 ' +
        'outline-none focus-visible:ring-2 focus-visible:ring-ambient/40 cursor-pointer ' +
        `${variantClasses[variant]} ${sizeClasses[size]} ${className}`
    return <button className={cls} {...props} />
}

export { Button }
