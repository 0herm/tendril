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
                    <div key={index} className='shrink-0 w-[clamp(7.5rem,20vw,11rem)]'>
                        <div className='relative'>
                            {ranked && (
                                <span className={
                                    'absolute -top-2 -left-2 z-20 min-w-[1.375rem] h-[1.375rem] px-1 shadow-sm ' +
                                    'flex items-center justify-center bg-foreground text-background text-[10px] font-bold rounded-full'
                                }>
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
