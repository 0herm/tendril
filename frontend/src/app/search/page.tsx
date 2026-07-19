'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import PageContainer from '@/components/pageContainer'
import { Chip } from '@/ui/chip'

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
        <PageContainer className='flex flex-col gap-8 max-w-xl mx-auto'>
            <div className='flex flex-col gap-5'>
                <h1 className='display text-2xl sm:text-3xl font-bold'>Search</h1>
                <div className='relative flex items-center'>
                    <Search className='absolute left-4 h-4 w-4 text-muted-foreground/50 pointer-events-none z-10' />
                    <input
                        ref={inputRef}
                        className={
                            'w-full h-12 pl-11 pr-4 rounded-2xl text-base ' +
                            'bg-white/4 border border-border text-foreground ' +
                            'shadow-[inset_0_1px_0_oklch(1_0_0/0.05)] ' +
                            'placeholder:text-muted-foreground/40 ' +
                            'outline-none focus:border-ambient/50 focus:ring-2 focus:ring-ambient/15 focus:bg-white/6 transition-colors'
                        }
                        placeholder='Search movies and shows…'
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                    />
                </div>
            </div>

            <div className='flex flex-col gap-3'>
                <p className='text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground/50'>Suggestions</p>
                <div className='flex flex-wrap gap-2'>
                    {SUGGESTIONS.map((s) => (
                        <Chip key={s} onClick={() => handleSearch(s)}>
                            {s}
                        </Chip>
                    ))}
                </div>
            </div>
        </PageContainer>
    )
}
