'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
    Film, Tv, ArrowRight, Zap, Compass, Sparkles, Smile,
    Shield, BookOpen, Heart, Wand2, Landmark, Ghost, Music,
    Eye, Rocket, Clock, Flag, MapPin, Globe, Video, MessageCircle, Star,
} from 'lucide-react'

interface Genre { id: number; name: string }
interface DiscoverBrowserProps { movieGenres: Genre[]; tvGenres: Genre[] }

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

export default function DiscoverBrowser({ movieGenres, tvGenres }: DiscoverBrowserProps) {
    const [tab, setTab] = useState<'movies' | 'shows'>('movies')
    const genres = tab === 'movies' ? movieGenres : tvGenres
    const basePath = tab === 'movies' ? 'movies' : 'shows'

    return (
        <div className='flex flex-col gap-6 w-full'>
            {/* Header — same pattern as MediaSection */}
            <div className='flex items-center gap-3'>
                <h2 className='text-sm font-semibold tracking-tight text-foreground shrink-0'>
                    Discover
                </h2>
                <div className='flex-1 h-px bg-border/60' />
                <div className='flex items-center gap-1 shrink-0'>
                    {(['movies', 'shows'] as const).map((t) => {
                        const Icon = t === 'movies' ? Film : Tv
                        const active = tab === t
                        return (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={
                                    'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg ' +
                                    'text-xs font-medium transition-colors ' +
                                    (active
                                        ? 'text-brand'
                                        : 'text-muted-foreground hover:text-foreground')
                                }
                            >
                                {active && (
                                    <span className='absolute inset-0 bg-brand/10 rounded-lg' />
                                )}
                                <Icon className='relative h-3.5 w-3.5' />
                                <span className='relative capitalize'>{t}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Genre grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2'>
                {genres.map((genre, i) => {
                    const Icon = GENRE_ICONS[genre.name] ?? Film
                    return (
                        <Link
                            key={`${tab}-${genre.id}`}
                            href={
                                `/discover/${basePath}/${genre.id}` +
                                `?name=${encodeURIComponent(genre.name)}`
                            }
                            className={
                                'genre-card-animate group flex flex-col justify-between p-4 h-20 ' +
                                'rounded-xl bg-card ring-1 ring-border/40 ' +
                                'hover:ring-brand/30 hover:bg-muted transition-all duration-200'
                            }
                            style={{ animationDelay: `${i * 25}ms` }}
                        >
                            <Icon
                                className={
                                    'h-4 w-4 text-muted-foreground ' +
                                    'group-hover:text-brand transition-colors duration-200'
                                }
                            />
                            <div className='flex items-end justify-between gap-2'>
                                <span className='text-sm font-medium leading-tight'>
                                    {genre.name}
                                </span>
                                <ArrowRight
                                    className={
                                        'h-3.5 w-3.5 text-brand shrink-0 opacity-0 ' +
                                        'group-hover:opacity-60 -translate-x-1 ' +
                                        'group-hover:translate-x-0 transition-all duration-200'
                                    }
                                />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
