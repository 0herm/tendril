'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Play } from 'lucide-react'
import config from '@config'
import { armSharedElement, rememberOrigin } from '@/utils/viewTransition'

const INTERVAL = 6000

export default function HeroCarousel({ items, ambient = {} }: {
    items: TrendingItemProps[]
    ambient?: Record<number, string>
}) {
    const [current, setCurrent] = useState(0)
    const [paused, setPaused] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    function scrollTo(index: number) {
        scrollRef.current?.scrollTo({ left: index * (scrollRef.current.offsetWidth), behavior: 'smooth' })
    }

    useEffect(() => {
        if (paused || items.length < 2) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const timer = setTimeout(() => {
            const next = (current + 1) % items.length
            setCurrent(next)
            scrollTo(next)
        }, INTERVAL)
        return () => clearTimeout(timer)
    }, [current, paused, items.length])

    function handleScroll() {
        if (scrollTimer.current) clearTimeout(scrollTimer.current)
        scrollTimer.current = setTimeout(() => {
            if (!scrollRef.current) return
            const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth)
            setCurrent(index)
        }, 50)
    }

    function goTo(index: number) {
        setCurrent(index)
        scrollTo(index)
    }

    if (!items.length) return null

    return (
        <div
            className='relative w-full overflow-hidden'
            style={{ height: 'clamp(340px, 62vh, 640px)' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            <div
                ref={scrollRef}
                className='flex w-full h-full overflow-x-auto overscroll-none noscroll will-change-transform'
                style={{ scrollSnapType: 'x mandatory' }}
                onScroll={handleScroll}
            >
                {items.map((item, i) => {
                    const title = item.title ?? item.name ?? ''
                    const year = (item.release_date ?? '').split('-')[0]
                    const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null
                    const mediaType = item.media_type === 'tv' ? 'show' : 'movie'
                    const slideAmbient = ambient[item.id]

                    return (
                        <div
                            key={item.id}
                            data-hero-slide
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
                                loading={i === 0 ? undefined : 'eager'}
                                fetchPriority={i === 0 ? 'high' : 'auto'}
                                sizes='100vw'
                                quality={75}
                            />

                            <div className='absolute inset-0 bg-linear-to-t from-background from-[8%] via-background/55 via-[42%] to-transparent' />
                            <div className='absolute inset-0 bg-linear-to-r from-background/60 via-background/10 to-transparent hidden sm:block' />

                            {slideAmbient && (
                                <div
                                    aria-hidden
                                    className='absolute inset-x-0 bottom-0 h-2/3 pointer-events-none mix-blend-screen'
                                    style={{
                                        background: `radial-gradient(70% 85% at 22% 100%, color-mix(in oklab, ${slideAmbient} 28%, transparent), transparent 70%)`,
                                    }}
                                />
                            )}

                            <div className='absolute bottom-0 left-0 p-5 pb-8 sm:p-10 sm:pb-12 max-w-[80%] sm:max-w-[55%]'>
                                <h2
                                    className={
                                        'display font-black text-white leading-[0.95] mb-3 line-clamp-2 ' +
                                        '[text-shadow:0_2px_24px_rgba(0,0,0,0.85)]'
                                    }
                                    style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
                                >
                                    {title}
                                </h2>
                                <div className='flex items-center gap-2.5 text-xs font-medium tracking-wide text-white/55 mb-4'>
                                    {rating && (
                                        <span className='flex items-center gap-1 text-white/85 tabular-nums'>
                                            <Star className='h-3 w-3 fill-yellow-400 stroke-none' />
                                            {rating}
                                        </span>
                                    )}
                                    {year && <span className='tabular-nums'>{year}</span>}
                                    <span className='capitalize opacity-70'>{mediaType}</span>
                                </div>
                                <Link
                                    href={`/${mediaType}/${item.id}`}
                                    onClick={(e) => {
                                        const slide = e.currentTarget.closest<HTMLElement>('[data-hero-slide]')
                                        if (slide) armSharedElement('media-backdrop', slide)
                                        rememberOrigin('backdrop', String(item.id))
                                    }}
                                    className={
                                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-white/15 ' +
                                        'hover:bg-white/10 active:bg-white/15 text-white text-sm font-semibold transition-colors'
                                    }
                                >
                                    <Play className='h-3 w-3 fill-current shrink-0' />
                                    View
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10'>
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={`relative h-1 rounded-full overflow-hidden transition-all duration-300 cursor-pointer ${
                            i === current ? 'w-8 bg-white/25' : 'w-4 bg-white/20 hover:bg-white/40'
                        }`}
                    >
                        {i === current && (
                            <span
                                key={current}
                                aria-hidden
                                className='absolute inset-y-0 left-0 bg-white rounded-full'
                                style={{
                                    animation: `hero-progress ${INTERVAL}ms linear both`,
                                    animationPlayState: paused ? 'paused' : 'running',
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
