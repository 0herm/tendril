import React from 'react'
import MediaCard from '@/components/media/mediaCard'
import SectionHeading from '@/components/media/sectionHeading'

type SectionProps = {
    title: React.ReactNode
    items: MediaListProps | MediaItemProps[] | null
    type?: MediaType
    ranked?: boolean
    action?: React.ReactNode
    progressMap?: Map<number, number>
}

export default function MediaSection({ title, items, type, ranked, action, progressMap }: SectionProps) {
    const all = Array.isArray(items) ? items : (items?.results ?? [])
    const results = ranked ? all.slice(0, 10) : all

    if (results.length === 0) return null

    return (
        <section className='flex flex-col gap-3'>
            <SectionHeading count={!ranked ? results.length : undefined} action={action}>
                {title}
            </SectionHeading>
            <div className={ranked
                ? 'flex flex-row gap-3 -mx-5 sm:-mx-6 pl-5 sm:pl-6 pr-5 sm:pr-6 pt-2 overflow-x-auto overscroll-x-contain noscroll pb-1 will-change-transform'
                : 'flex flex-row gap-3 -mx-5 sm:-mx-6 px-5 sm:px-6 overflow-x-auto overscroll-x-contain noscroll pb-1 will-change-transform'
            }>
                {results.map((item, index) => (
                    <div
                        key={index}
                        className={`shrink-0 relative${!ranked ? ' w-[clamp(7.5rem,20vw,11rem)]' : ''}`}
                        style={ranked ? { width: 'clamp(10rem, calc(20vw + 2.5rem), 13.5rem)' } : undefined}
                    >
                        {ranked && (
                            <span
                                className='absolute left-0 bottom-0 z-10 text-7xl font-black italic leading-none select-none pointer-events-none'
                                style={{
                                    WebkitTextStroke: '1.5px var(--foreground)',
                                    color: 'oklch(0.22 0 0)',
                                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,1))',
                                    letterSpacing: index === 9 ? '0' : '-0.15em',
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
        </section>
    )
}
