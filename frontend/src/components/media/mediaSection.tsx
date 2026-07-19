'use client'

import { useState } from 'react'
import MediaCard from '@/components/media/mediaCard'
import SectionHeading from '@/components/media/sectionHeading'
import { useMediaState } from '@/components/watched/mediaStateContext'

type SectionProps = {
    title: React.ReactNode
    items: MediaListProps | MediaItemProps[] | null
    type?: MediaType
    ranked?: boolean
    action?: React.ReactNode
    progressMap?: Map<number, number>
    filterable?: boolean
}

function hasStreamingMatch(item: MediaItemProps, providerIds: number[], region: string): boolean {
    if (!('watch/providers' in item)) return false
    const wp = item['watch/providers'] as WatchProviders
    const flatrate = wp?.results?.[region]?.flatrate ?? []
    return flatrate.some(p => providerIds.includes(p.provider_id))
}

export default function MediaSection({ title, items, type, ranked, action, progressMap, filterable }: SectionProps) {
    const ms = useMediaState()
    const streamingProviders = ms?.streamingProviders ?? []
    const region = ms?.region ?? 'GB'
    const canFilter = filterable && streamingProviders.length > 0

    const [filterStreaming, setFilterStreaming] = useState(false)

    const all = Array.isArray(items) ? items : (items?.results ?? [])
    const sliced = ranked ? all.slice(0, 10) : all
    const results = canFilter && filterStreaming
        ? sliced.filter(item => hasStreamingMatch(item, streamingProviders, region))
        : sliced

    if (!canFilter && sliced.length === 0) return null
    if (canFilter && !filterStreaming && sliced.length === 0) return null

    const filterToggle = canFilter ? (
        <button
            onClick={() => setFilterStreaming(f => !f)}
            className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors ${
                filterStreaming
                    ? 'bg-brand/15 text-brand'
                    : 'text-muted-foreground hover:bg-white/5'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${filterStreaming ? 'bg-brand' : 'bg-muted-foreground'}`} />
            My services
        </button>
    ) : null

    return (
        <section className='flex flex-col gap-3'>
            <SectionHeading
                count={!ranked ? results.length : undefined}
                action={(action || filterToggle) ? (
                    <div className='flex items-center gap-2'>{action}{filterToggle}</div>
                ) : undefined}
            >
                {title}
            </SectionHeading>
            {results.length === 0 ? (
                <p className='text-xs text-muted-foreground/50 py-2'>
                    None of these are on your streaming services.
                </p>
            ) : (
                <div className={ranked
                    ? 'flex flex-row gap-3 -mx-5 sm:-mx-6 pl-5 sm:pl-6 pr-5 sm:pr-6 pt-2 overflow-x-auto overscroll-x-contain noscroll pb-1 will-change-transform'
                    : 'flex flex-row gap-3 -mx-5 sm:-mx-6 px-5 sm:px-6 pt-px overflow-x-auto overscroll-x-contain noscroll pb-1 will-change-transform'
                }>
                    {results.map((item, index) => (
                        <div
                            key={index}
                            className={`shrink-0 relative${!ranked ? ' w-[clamp(7.5rem,20vw,11rem)]' : ''}`}
                            style={ranked ? { width: 'clamp(10rem, calc(20vw + 2.5rem), 13.5rem)' } : undefined}
                        >
                            {ranked && (
                                <span
                                    className='display absolute left-0 bottom-0 z-10 text-7xl font-black leading-none select-none pointer-events-none'
                                    style={{
                                        WebkitTextStroke: '1.5px color-mix(in oklab, var(--ambient) 45%, var(--foreground))',
                                        color: 'oklch(0.17 0 0)',
                                        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,1))',
                                        letterSpacing: index === 9 ? '0' : '-0.12em',
                                    }}
                                >
                                    {index === 9 ? (
                                        <>
                                            <span style={{ display: 'inline-block', position: 'relative', zIndex: 1 }}>1</span>
                                            <span style={{ display: 'inline-block', position: 'relative', zIndex: 2, marginLeft: '-0.15em' }}>0</span>
                                        </>
                                    ) : (index + 1)}
                                </span>
                            )}
                            <div className={ranked ? 'ml-10 relative z-20' : ''}>
                                <MediaCard item={item} type={type} progress={progressMap?.get(item.id)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
