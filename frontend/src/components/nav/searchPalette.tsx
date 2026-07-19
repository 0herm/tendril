'use client'

import { ArrowRight, Film, ImageIcon, Loader2, Search, Tv } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Dialog, DialogContent } from '@/ui/dialog'
import { fetchMoreSearch } from '@/app/search/[search]/actions'

export default function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<TrendingItemProps[]>([])
    const [activeIndex, setActiveIndex] = useState(-1)
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        if (!open) return
        setQuery('')
        setResults([])
        setActiveIndex(-1)
        const t = setTimeout(() => inputRef.current?.focus(), 50)
        return () => clearTimeout(t)
    }, [open])

    useEffect(() => {
        const q = query.trim()
        if (q.length < 2) {
            setResults([])
            setActiveIndex(-1)
            return
        }
        const t = setTimeout(() => {
            setIsPending(true)
            fetchMoreSearch(encodeURIComponent(q), 1)
                .then((items) => {
                    setResults(items.slice(0, 8))
                    setActiveIndex(items.length ? 0 : -1)
                })
                .finally(() => setIsPending(false))
        }, 250)
        return () => clearTimeout(t)
    }, [query])

    function goTo(item: TrendingItemProps) {
        router.push(`/${item.media_type === 'movie' ? 'movie' : 'show'}/${item.id}`)
        onOpenChange(false)
    }

    function goToAll() {
        const q = query.trim()
        if (!q) return
        router.push(`/search/${encodeURIComponent(q)}`)
        onOpenChange(false)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((i) => (results.length ? (i + 1) % results.length : -1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : -1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            const item = results[activeIndex]
            if (item) goTo(item)
            else goToAll()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className='sm:max-w-xl h-[min(32rem,calc(100dvh-2rem))]'>
                <div className='flex flex-col h-full'>
                    <div className='flex items-center gap-3 px-4 border-b border-border shrink-0'>
                        <Search className='h-4 w-4 text-muted-foreground/60 shrink-0' />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className='w-full h-13 bg-transparent text-base sm:text-sm text-foreground placeholder:text-muted-foreground/50 outline-none'
                            placeholder='Search movies and shows…'
                            aria-label='Search movies and shows'
                        />
                        {isPending && <Loader2 className='h-4 w-4 text-muted-foreground/50 animate-spin shrink-0' />}
                        <kbd
                            className={
                                'hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white/5 border border-white/10 ' +
                                'rounded-md text-[10px] text-muted-foreground/50 font-mono shrink-0'
                            }
                        >
                            esc
                        </kbd>
                    </div>

                    <div className='flex-1 overflow-y-auto noscroll py-2'>
                        {results.length > 0 ? (
                            <ul>
                                {results.map((item, i) => {
                                    const title = item.title ?? item.name ?? ''
                                    const year = item.release_date?.slice(0, 4)
                                    return (
                                        <li key={`${item.media_type}-${item.id}`}>
                                            <button
                                                onClick={() => goTo(item)}
                                                onMouseEnter={() => setActiveIndex(i)}
                                                className={
                                                    'flex items-center gap-3 w-full px-4 py-2 text-left transition-colors cursor-pointer ' +
                                                    (i === activeIndex ? 'bg-white/6' : '')
                                                }
                                            >
                                                <div className='relative w-9 aspect-2/3 rounded-md overflow-hidden bg-muted shrink-0 ring-1 ring-white/10'>
                                                    {item.poster_path ? (
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                            alt=''
                                                            fill
                                                            className='object-cover'
                                                            sizes='36px'
                                                        />
                                                    ) : (
                                                        <div className='flex h-full w-full items-center justify-center'>
                                                            <ImageIcon className='h-3.5 w-3.5 text-muted-foreground/50' />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='flex flex-col gap-0.5 min-w-0'>
                                                    <span className='text-sm font-medium text-foreground truncate'>{title}</span>
                                                    <span className='flex items-center gap-1.5 text-[11px] text-muted-foreground/70'>
                                                        {item.media_type === 'movie'
                                                            ? <Film className='h-3 w-3' />
                                                            : <Tv className='h-3 w-3' />}
                                                        {item.media_type === 'movie' ? 'Movie' : 'Show'}
                                                        {year && <span className='tabular-nums'>· {year}</span>}
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <div className='flex flex-col items-center justify-center h-full gap-2 text-center px-6'>
                                <Search className='h-5 w-5 text-muted-foreground/30' />
                                <p className='text-xs text-muted-foreground/60'>
                                    {query.trim().length >= 2 && !isPending
                                        ? 'No results — try a different spelling.'
                                        : 'Start typing to search movies and shows.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {results.length > 0 && (
                        <button
                            onClick={goToAll}
                            className={
                                'flex items-center justify-center gap-2 w-full px-4 py-3 border-t border-border shrink-0 ' +
                                'text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/4 transition-colors cursor-pointer'
                            }
                        >
                            See all results
                            <ArrowRight className='h-3.5 w-3.5' />
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
