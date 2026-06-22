'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Play } from 'lucide-react'

const BACKDROP_URL = 'https://image.tmdb.org/t/p/original'
const INTERVAL = 6000

export default function HeroCarousel({ items }: { items: TrendingItemProps[] }) {
    const slides = items.filter(i => i.backdrop_path).slice(0, 7)
    const [current, setCurrent] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollTo = useCallback((index: number) => {
        scrollRef.current?.scrollTo({ left: index * (scrollRef.current.offsetWidth), behavior: 'smooth' })
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(c => {
                const next = (c + 1) % slides.length
                scrollRef.current?.scrollTo({ left: next * (scrollRef.current.offsetWidth), behavior: 'smooth' })
                return next
            })
        }, INTERVAL)
        return () => clearInterval(timer)
    }, [slides.length])

    function handleScroll() {
        if (!scrollRef.current) return
        const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth)
        setCurrent(index)
    }

    function goTo(index: number) {
        setCurrent(index)
        scrollTo(index)
    }

    if (!slides.length) return null

    return (
        <div className='relative w-full' style={{ height: 'clamp(190px, 42vw, 400px)' }}>
            {/* scrollable track */}
            <div
                ref={scrollRef}
                className='flex w-full h-full overflow-x-auto rounded-2xl noscroll'
                style={{ scrollSnapType: 'x mandatory' }}
                onScroll={handleScroll}
            >
                {slides.map((item, i) => {
                    const title = item.title ?? item.name ?? ''
                    const year = (item.release_date ?? '').split('-')[0]
                    const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null
                    const mediaType = item.media_type === 'tv' ? 'show' : 'movie'

                    return (
                        <div
                            key={item.id}
                            className='relative shrink-0 w-full h-full'
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            <Image
                                src={`${BACKDROP_URL}${item.backdrop_path}`}
                                alt={title}
                                fill
                                className='object-cover'
                                style={{ objectPosition: 'center 30%' }}
                                priority={i === 0}
                                sizes='100vw'
                            />

                            <div className='absolute inset-0 bg-linear-to-t from-background via-background/55 to-transparent' />
                            <div className='absolute inset-0 bg-linear-to-r from-background/75 via-background/20 to-transparent' />

                            <div className='absolute bottom-0 left-0 p-4 sm:p-6 max-w-[55%]'>
                                <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight mb-1.5 line-clamp-2'>
                                    {title}
                                </h2>
                                <div className='flex items-center gap-2 text-[11px] sm:text-xs text-white/55 mb-3'>
                                    {rating && (
                                        <span className='flex items-center gap-1 text-white/80'>
                                            <Star className='h-3 w-3 fill-yellow-400 stroke-none' />
                                            {rating}
                                        </span>
                                    )}
                                    {year && <span>{year}</span>}
                                    <span className='capitalize opacity-70'>{mediaType}</span>
                                </div>
                                <Link
                                    href={`/${mediaType}/${item.id}`}
                                    className='inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-brand hover:bg-brand-dim text-white text-xs sm:text-sm font-semibold transition-colors'
                                >
                                    <Play className='h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current shrink-0' />
                                    View
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* dot indicators */}
            <div className='absolute bottom-4 right-4 flex items-center gap-1.5 z-10'>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={`h-1 rounded-full transition-all duration-300 ${
                            i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/55'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}
