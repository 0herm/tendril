import React from 'react'
import MediaCard from '@components/mediaCard/mediaCard'
import SectionHeading from '@components/sectionHeading/sectionHeading'

type SectionProps = {
    title: React.ReactNode
    items: MediaListProps | null
    type?: MediaType
    ranked?: boolean
    action?: React.ReactNode
}

export default function MediaSection({ title, items, type, ranked, action }: SectionProps) {
    const all = items?.results ?? []
    const results = ranked ? all.slice(0, 10) : all

    if (results.length === 0) return null

    return (
        <section className='flex flex-col gap-3'>
            <SectionHeading count={!ranked ? results.length : undefined} action={action}>
                {title}
            </SectionHeading>
            <div className={`flex flex-row gap-3 w-full overflow-x-auto overscroll-x-contain noscroll pb-1${ranked ? ' pt-2 pl-2' : ''}`}>
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
                            <MediaCard item={item} type={type} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
