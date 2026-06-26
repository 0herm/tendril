'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
    Film, Tv, ArrowRight, Zap, Compass, Sparkles, Smile,
    Shield, BookOpen, Heart, Wand2, Landmark, Ghost, Music,
    Eye, Rocket, Clock, Flag, MapPin, Globe, Video, MessageCircle, Star,
} from 'lucide-react'

const GENRE_ICONS: Record<string, React.ElementType> = {
    'Action':             Zap,
    'Adventure':          Compass,
    'Animation':          Sparkles,
    'Comedy':             Smile,
    'Crime':              Shield,
    'Documentary':        BookOpen,
    'Drama':              Film,
    'Family':             Heart,
    'Fantasy':            Wand2,
    'History':            Landmark,
    'Horror':             Ghost,
    'Music':              Music,
    'Mystery':            Eye,
    'Romance':            Heart,
    'Science Fiction':    Rocket,
    'TV Movie':           Tv,
    'Thriller':           Clock,
    'War':                Flag,
    'Western':            MapPin,
    'Action & Adventure': Zap,
    'Kids':               Star,
    'News':               Globe,
    'Reality':            Video,
    'Sci-Fi & Fantasy':   Rocket,
    'Soap':               Sparkles,
    'Talk':               MessageCircle,
    'War & Politics':     Flag,
}

export default function DiscoverBrowser({ movieGenres, tvGenres }: { movieGenres: Genre[]; tvGenres: Genre[] }) {
    const [tab, setTab] = useState<'movies' | 'shows'>('movies')
    const genres = tab === 'movies' ? movieGenres : tvGenres

    return (
        <div className='flex flex-col gap-6 w-full'>
            <div className='flex items-center justify-between'>
                <h2 className='text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground'>
                    Discover
                </h2>
                <div className='flex items-center gap-1'>
                    {(['movies', 'shows'] as const).map((t) => {
                        const Icon = t === 'movies' ? Film : Tv
                        const active = tab === t
                        return (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={
                                    'relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl ' +
                                    'text-xs font-medium transition-all ' +
                                    (active
                                        ? 'text-brand'
                                        : 'text-muted-foreground/60 hover:text-foreground')
                                }
                            >
                                {active && <span className='absolute inset-0 bg-brand/8 rounded-xl' />}
                                <Icon className='relative h-3.5 w-3.5' />
                                <span className='relative capitalize'>{t}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5'>
                {genres.map((genre, i) => {
                    const Icon = GENRE_ICONS[genre.name] ?? Film
                    return (
                        <Link
                            key={`${tab}-${genre.id}`}
                            href={`/discover/${tab}/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                            className={
                                'genre-card-animate group flex flex-col justify-between p-4 h-24 ' +
                                'rounded-2xl bg-card border border-border/50 ' +
                                'hover:border-brand/25 hover:bg-accent transition-all duration-200'
                            }
                            style={{ animationDelay: `${i * 25}ms` }}
                        >
                            <Icon className='h-4 w-4 text-muted-foreground/60 group-hover:text-brand transition-colors duration-200' />
                            <div className='flex items-end justify-between gap-2'>
                                <span className='text-sm font-semibold leading-tight tracking-tight'>
                                    {genre.name}
                                </span>
                                <ArrowRight className='h-3.5 w-3.5 text-brand shrink-0 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-200' />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
