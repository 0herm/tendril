'use client'

import { useState } from 'react'

export default function ExpandableText({ text, threshold = 280 }: { text: string; threshold?: number }) {
    const [expanded, setExpanded] = useState(false)
    const clampable = text.length > threshold

    return (
        <div className='flex flex-col items-start gap-1.5'>
            <p className={`text-[15px] leading-relaxed text-foreground/75 max-w-3xl ${!expanded && clampable ? 'line-clamp-3' : ''}`}>
                {text}
            </p>
            {clampable && (
                <button
                    onClick={() => setExpanded(e => !e)}
                    className='text-xs font-semibold text-ambient hover:opacity-80 transition-opacity cursor-pointer'
                >
                    {expanded ? 'Less' : 'More'}
                </button>
            )}
        </div>
    )
}
