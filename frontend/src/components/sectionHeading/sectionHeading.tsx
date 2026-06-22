import React from 'react'

type Props = {
    children: React.ReactNode
    count?: number | string
    action?: React.ReactNode
}

export default function SectionHeading({ children, count, action }: Props) {
    return (
        <div className='flex items-center gap-3'>
            <h2 className='text-sm font-semibold tracking-tight text-foreground shrink-0'>{children}</h2>
            <div className='flex-1 h-px bg-border/60' />
            {count != null && (
                <span className='text-xs text-muted-foreground tabular-nums shrink-0'>{count}</span>
            )}
            {action}
        </div>
    )
}
