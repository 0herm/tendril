import React from 'react'

type Props = {
    children: React.ReactNode
    count?: number | string
    action?: React.ReactNode
}

export default function SectionHeading({ children, count, action }: Props) {
    return (
        <div className='flex items-center gap-2'>
            <h2 className='text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground shrink-0'>{children}</h2>
            {count != null && (
                <span className='text-[11px] text-muted-foreground/50 tabular-nums font-medium shrink-0'>{count}</span>
            )}
            {action && <div className='ml-auto'>{action}</div>}
        </div>
    )
}

export function SkeletonHeading({ width }: { width: string }) {
    return (
        <div className='flex items-center gap-2'>
            <div className={`h-2.5 ${width} bg-muted animate-pulse rounded shrink-0`} />
        </div>
    )
}
