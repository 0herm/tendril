'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

const SUGGESTIONS = ['Inception', 'Breaking Bad', 'The Bear', 'Dune', 'Severance', 'Oppenheimer']

export default function SearchPage() {
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    function handleSearch(query?: string) {
        const q = (query ?? inputRef.current?.value ?? '').trim()
        if (!q) return
        router.push(`/search/${encodeURIComponent(q)}`)
    }

    return (
        <div className='w-full flex flex-col gap-8 pt-2 max-w-xl mx-auto'>
            <div className='relative flex items-center'>
                <Search className='absolute left-3.5 h-4 w-4 text-muted-foreground/50 pointer-events-none z-10' />
                <input
                    ref={inputRef}
                    className={
                        'w-full h-12 pl-11 pr-4 rounded-2xl text-base ' +
                        'bg-muted/40 border border-border/60 text-foreground ' +
                        'placeholder:text-muted-foreground/40 ' +
                        'outline-none focus:border-border focus:bg-muted/60 transition-colors'
                    }
                    placeholder='Search movies and shows…'
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                />
            </div>

            <div className='flex flex-col gap-3'>
                <p className='text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground/50'>Suggestions</p>
                <div className='flex flex-wrap gap-2'>
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => handleSearch(s)}
                            className='px-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-sm text-muted-foreground/70 hover:text-foreground hover:border-border/80 hover:bg-muted/60 transition-all'
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
