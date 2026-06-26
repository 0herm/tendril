'use client'

import { useRouter } from 'next/navigation'
import { Shuffle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { getAllWatched } from '@/utils/queries'

type Candidate = { id: number; type: 'movie' | 'show'; genre_ids?: number[]; runtime?: number }

const MOODS = [
    { label: 'Action', id: 28 }, { label: 'Comedy', id: 35 }, { label: 'Drama', id: 18 },
    { label: 'Horror', id: 27 }, { label: 'Sci-Fi', id: 878 }, { label: 'Thriller', id: 53 },
    { label: 'Romance', id: 10749 }, { label: 'Animation', id: 16 },
]

const TIME_FILTERS = [
    { label: 'Any length', min: 0, max: Infinity },
    { label: 'Under 100 min', min: 0, max: 99 },
    { label: '100–140 min', min: 100, max: 140 },
    { label: '140+ min', min: 141, max: Infinity },
]

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className='flex flex-col gap-2.5'>
            <p className='text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground/50'>{label}</p>
            <div className='flex flex-wrap gap-1.5'>{children}</div>
        </div>
    )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`relative px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                active ? 'text-brand border-brand/30' : 'border-border/60 bg-card text-muted-foreground/70 hover:text-foreground hover:border-border'
            }`}
        >
            {active && <span className='absolute inset-0 bg-brand/10 rounded-xl' />}
            <span className='relative'>{children}</span>
        </button>
    )
}

export function SurpriseButton({ items }: { items: Candidate[] }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [selectedMoods, setSelectedMoods] = useState<number[]>([])
    const [timeFilter, setTimeFilter] = useState(0)
    const [loading, setLoading] = useState(false)

    if (items.length === 0) return null

    function toggleMood(id: number) {
        setSelectedMoods((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id])
    }

    function handleSurprise() {
        const tf = TIME_FILTERS[timeFilter]
        const filtered = items.filter((c) => {
            if (selectedMoods.length > 0 && !selectedMoods.some((m) => c.genre_ids?.includes(m))) return false
            if (tf.max !== Infinity && c.type === 'movie' && (c.runtime == null || c.runtime < tf.min || c.runtime > tf.max)) return false
            return true
        })
        const pool = filtered.length > 0 ? filtered : items
        const pick = pool[Math.floor(Math.random() * pool.length)]
        if (pick) { setOpen(false); router.push(`/${pick.type}/${pick.id}`) }
    }

    async function handleFromHistory() {
        setLoading(true)
        try {
            const { data } = await getAllWatched()
            if (!data?.length) return
            const watched = data[Math.floor(Math.random() * data.length)]
            const recRes = await fetch(`/api/recommendations/${watched.tmdb_id}?type=${watched.type}`)
            const { data: recData } = await recRes.json()
            const results: { id: number }[] = recData?.results ?? []
            const pick = results[Math.floor(Math.random() * results.length)]
            setOpen(false)
            router.push(`/${watched.type}/${pick?.id ?? watched.tmdb_id}`)
        } catch (err) {
            console.error(err)
        } finally { setLoading(false) }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className={
                    'inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border/60' +
                    ' bg-card text-muted-foreground/70 hover:text-foreground hover:bg-muted text-xs font-medium transition-colors'
                }>
                    <Shuffle className='h-3.5 w-3.5 shrink-0' />Surprise me
                </button>
            </DialogTrigger>
            <DialogContent className='max-w-sm'>
                <DialogHeader><DialogTitle>Surprise Me</DialogTitle></DialogHeader>
                <div className='flex flex-col gap-5 px-5 pt-4 pb-5'>
                    <FilterGroup label='Mood'>
                        {MOODS.map((m) => (
                            <Pill key={m.id} active={selectedMoods.includes(m.id)} onClick={() => toggleMood(m.id)}>{m.label}</Pill>
                        ))}
                    </FilterGroup>
                    <FilterGroup label='Length (movies)'>
                        {TIME_FILTERS.map((tf, i) => (
                            <Pill key={i} active={timeFilter === i} onClick={() => setTimeFilter(i)}>{tf.label}</Pill>
                        ))}
                    </FilterGroup>
                    <div className='flex flex-col gap-2'>
                        <Button onClick={handleSurprise} className='w-full'><Shuffle className='h-3.5 w-3.5 mr-1.5' />Pick from my watchlist</Button>
                        <Button variant='outline' onClick={handleFromHistory} disabled={loading} className='w-full'>{loading ? 'Finding…' : 'Pick from my watch history'}</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
