import React from 'react'
import MediaCard from '@components/mediaCard/mediaCard'

type SectionProps = {
    title: React.ReactNode
    items: MediaListProps | null
    type?: MediaType
    ranked?: boolean
}

export default function MediaSection({ title, items, type, ranked }: SectionProps) {
    const all = items?.results ?? []
    const results = ranked ? all.slice(0, 10) : all

    if (results.length === 0) return null

    return (
        <section className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
                <h2 className='text-sm font-semibold tracking-tight text-foreground shrink-0'>{title}</h2>
                <div className='flex-1 h-px bg-border/60' />
                {!ranked && <span className='text-xs text-muted-foreground tabular-nums shrink-0'>{results.length}</span>}
            </div>
            <div className='flex flex-row gap-3 w-full overflow-x-auto noscroll pb-1'>
                {results.map((item, index) => (
                    <div key={index} className={`shrink-0 ${ranked ? 'w-[clamp(7rem,18vw,10rem)] pt-2 pl-2' : 'w-[clamp(7.5rem,20vw,11rem)]'}`}>
                        <div className='relative'>
                            {ranked && (
                                <span className='absolute -top-2 -left-2 z-20 min-w-[1.375rem] h-[1.375rem] flex items-center justify-center bg-foreground text-background text-[10px] font-bold rounded-full px-1 shadow-sm'>
                                    {index + 1}
                                </span>
                            )}
                            <MediaCard item={item} type={type} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
