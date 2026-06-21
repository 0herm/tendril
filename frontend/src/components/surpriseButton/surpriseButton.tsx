'use client'

import { useRouter } from 'next/navigation'
import { Shuffle } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { getAllWatched } from '@/utils/api'

type Candidate = { id: number; type: 'movie' | 'show'; genre_ids?: number[]; runtime?: number }

const MOODS = [
    { label: 'Action', id: 28 },
    { label: 'Comedy', id: 35 },
    { label: 'Drama', id: 18 },
    { label: 'Horror', id: 27 },
    { label: 'Sci-Fi', id: 878 },
    { label: 'Thriller', id: 53 },
    { label: 'Romance', id: 10749 },
    { label: 'Animation', id: 16 },
]

const TIME_FILTERS = [
    { label: 'Any length', min: 0, max: Infinity },
    { label: 'Under 100 min', min: 0, max: 99 },
    { label: '100–140 min', min: 100, max: 140 },
    { label: '140+ min', min: 141, max: Infinity },
]

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

    function getFiltered() {
        return items.filter((c) => {
            if (selectedMoods.length > 0 && !selectedMoods.some((m) => c.genre_ids?.includes(m))) return false
            const tf = TIME_FILTERS[timeFilter]
            if (tf.max !== Infinity && c.type === 'movie') {
                if (c.runtime == null || c.runtime < tf.min || c.runtime > tf.max) return false
            }
            return true
        })
    }

    function pickRandom<T>(arr: T[]): T | null {
        return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null
    }

    function handleSurprise() {
        const filtered = getFiltered()
        const pick = pickRandom(filtered.length > 0 ? filtered : items)
        if (pick) { setOpen(false); router.push(`/${pick.type}/${pick.id}`) }
    }

    async function handleFromHistory() {
        setLoading(true)
        try {
            const { data } = await getAllWatched()
            if (!data?.length) return
            const watched = pickRandom(data as { tmdb_id: number; type: 'movie' | 'show' }[])
            if (!watched) return
            const recRes = await fetch(`/api/recommendations/${watched.tmdb_id}?type=${watched.type}`)
            const { data: recData } = await recRes.json()
            const results: { id: number }[] = recData?.results ?? []
            const pick = pickRandom(results)
            if (pick) { setOpen(false); router.push(`/${watched.type}/${pick.id}`) }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className='inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors'>
                    <Shuffle className='h-3.5 w-3.5 shrink-0' />
                    Surprise me
                </button>
            </DialogTrigger>
            <DialogContent className='max-w-sm'>
                <DialogHeader>
                    <DialogTitle>Surprise Me</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col gap-4 pt-1'>
                    <div className='flex flex-col gap-2'>
                        <p className='text-xs text-muted-foreground font-medium'>Mood</p>
                        <div className='flex flex-wrap gap-1.5'>
                            {MOODS.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => toggleMood(m.id)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${selectedMoods.includes(m.id) ? 'bg-brand text-brand-foreground border-brand' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <p className='text-xs text-muted-foreground font-medium'>Length (movies)</p>
                        <div className='flex flex-wrap gap-1.5'>
                            {TIME_FILTERS.map((tf, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTimeFilter(i)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${timeFilter === i ? 'bg-brand text-brand-foreground border-brand' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Button onClick={handleSurprise} className='w-full'>
                            <Shuffle className='h-3.5 w-3.5 mr-1.5' />
                            Pick from my watchlist
                        </Button>
                        <Button variant='outline' onClick={handleFromHistory} disabled={loading} className='w-full'>
                            {loading ? 'Finding…' : 'Pick from my watch history'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
