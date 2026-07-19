'use client'

import * as React from 'react'

interface SegmentedOption<T extends string> {
    value: T
    label: React.ReactNode
}

interface SegmentedProps<T extends string> {
    options: SegmentedOption<T>[]
    value: T
    onChange: (value: T) => void
    className?: string
}

function Segmented<T extends string>({ options, value, onChange, className = '' }: SegmentedProps<T>) {
    const index = Math.max(0, options.findIndex((o) => o.value === value))
    return (
        <div
            role='tablist'
            className={`relative inline-grid auto-cols-fr grid-flow-col p-1 rounded-xl border border-border bg-white/4 ${className}`}
        >
            <div
                aria-hidden
                className='absolute top-1 bottom-1 rounded-lg bg-surface-3 border border-white/10 shadow-sm transition-transform duration-300 ease-spring'
                style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)`, left: '0.25rem' }}
            />
            {options.map((option) => (
                <button
                    key={option.value}
                    role='tab'
                    aria-selected={option.value === value}
                    onClick={() => onChange(option.value)}
                    className={
                        'relative z-10 px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ' +
                        (option.value === value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
                    }
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}

export { Segmented }
