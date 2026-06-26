'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Play } from 'lucide-react'
import config from '@config'

const INTERVAL = 6000

export default function HeroCarousel({ items }: { items: TrendingItemProps[] }) {
    const slides = items.filter(i => i.backdrop_path).slice(0, 7)
    const [current, setCurrent] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)

    function scrollTo(index: number) {
        scrollRef.current?.scrollTo({ left: index * (scrollRef.current.offsetWidth), behavior: 'smooth' })
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(c => {
                const next = (c + 1) % slides.length
                scrollTo(next)
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
        <div className='relative w-full rounded-2xl overflow-hidden' style={{ height: 'clamp(240px, 50vw, 520px)' }}>
            {/* scrollable track */}
            <div
                ref={scrollRef}
                className='flex w-full h-full overflow-x-auto overscroll-none noscroll'
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
                                src={`${config.url.BACKDROP_URL}${item.backdrop_path}`}
                                alt={title}
                                fill
                                className='object-cover'
                                style={{ objectPosition: 'center 30%' }}
                                priority={i === 0}
                                sizes='100vw'
                                quality={90}
                            />

                            <div className='absolute inset-0 bg-linear-to-t from-background from-[15%] via-background/70 via-[55%] to-transparent' />
                            <div className='absolute inset-0 bg-linear-to-r from-background/55 via-background/15 to-transparent hidden sm:block' />

                            <div className='absolute bottom-0 left-0 p-4 sm:p-6 max-w-[55%]'>
                                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-2 line-clamp-2 [text-shadow:0_2px_20px_rgba(0,0,0,0.8)]'>
                                    {title}
                                </h2>
                                <div className='flex items-center gap-2 text-[11px] font-medium tracking-wide text-white/50 mb-3'>
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
                                    className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm text-white text-sm font-semibold transition-all'
                                >
                                    <Play className='h-3 w-3 fill-current shrink-0' />
                                    View
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* dot indicators */}
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10'>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                            i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/45'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}
