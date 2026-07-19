'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
    Film, Tv, ArrowRight, Zap, Compass, Sparkles, Smile,
    Shield, BookOpen, Heart, Wand2, Landmark, Ghost, Music,
    Eye, Rocket, Clock, Flag, MapPin, Globe, Video, MessageCircle, Star,
} from 'lucide-react'

import { Segmented } from '@/ui/segmented'

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
            <div className='flex items-center justify-between gap-4'>
                <h1 className='display text-2xl sm:text-3xl font-bold'>Discover</h1>
                <Segmented
                    value={tab}
                    onChange={setTab}
                    options={[
                        { value: 'movies', label: <span className='flex items-center gap-1.5'><Film className='h-3.5 w-3.5' />Movies</span> },
                        { value: 'shows', label: <span className='flex items-center gap-1.5'><Tv className='h-3.5 w-3.5' />Shows</span> },
                    ]}
                />
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5'>
                {genres.map((genre, i) => {
                    const Icon = GENRE_ICONS[genre.name] ?? Film
                    return (
                        <Link
                            key={`${tab}-${genre.id}`}
                            href={`/discover/${tab}/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                            className={
                                'genre-card-animate group relative flex flex-col justify-between p-4 h-24 overflow-hidden ' +
                                'rounded-2xl bg-surface-1 border border-border/50 ' +
                                'hover:border-border-strong hover:bg-surface-2 hover:-translate-y-0.5 transition-[border-color,background-color,transform] duration-200'
                            }
                            style={{ animationDelay: `${i * 25}ms` }}
                        >
                            <Icon className='relative h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors duration-200' />
                            <div className='relative flex items-end justify-between gap-2'>
                                <span className='text-sm font-semibold leading-tight tracking-tight'>
                                    {genre.name}
                                </span>
                                <ArrowRight
                                    className={
                                        'h-3.5 w-3.5 text-foreground/70 shrink-0 opacity-0 -translate-x-1 ' +
                                        'group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200'
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
