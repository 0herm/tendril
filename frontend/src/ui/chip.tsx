import * as React from 'react'

const baseClasses =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ' +
    'text-xs font-medium leading-none transition-colors '

const stateClasses = (selected: boolean) => selected
    ? 'border-ambient/60 bg-ambient/15 text-foreground'
    : 'border-border bg-white/4 text-foreground/70'

interface ChipButtonProps extends React.ComponentProps<'button'> {
    selected?: boolean
}

function Chip({ className = '', selected = false, ...props }: ChipButtonProps) {
    return (
        <button
            className={
                baseClasses + stateClasses(selected) +
                ' cursor-pointer hover:text-foreground ' +
                (selected ? 'hover:bg-ambient/20 ' : 'hover:bg-white/8 hover:border-border-strong ') +
                className
            }
            {...props}
        />
    )
}

interface ChipLabelProps extends React.ComponentProps<'span'> {
    selected?: boolean
}

function ChipLabel({ className = '', selected = false, ...props }: ChipLabelProps) {
    return <span className={`${baseClasses}${stateClasses(selected)} ${className}`} {...props} />
}

export { Chip, ChipLabel }
