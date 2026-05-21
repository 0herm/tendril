'use client'

import { useRouter } from 'next/navigation'
import { Shuffle } from 'lucide-react'

type Candidate = { id: number; type: 'movie' | 'show' }

export function SurpriseButton({ items }: { items: Candidate[] }) {
    const router = useRouter()

    if (items.length === 0) return null

    function handleClick() {
        const pick = items[Math.floor(Math.random() * items.length)]
        router.push(`/${pick.type}/${pick.id}`)
    }

    return (
        <button
            onClick={handleClick}
            className={
                'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg ' +
                'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted ' +
                'text-xs font-medium transition-colors'
            }
        >
            <Shuffle className='h-3.5 w-3.5 shrink-0' />
            Surprise me
        </button>
    )
}
