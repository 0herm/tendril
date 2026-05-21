import MediaCard from '@components/mediaCard/mediaCard'

type SectionProps = {
    title: string
    items: MediaListProps | null
    type?: MediaType
}

export default function MediaSection({ title, items, type }: SectionProps) {
    const results = items?.results ?? []

    if (results.length === 0) return null

    return (
        <section className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
                <h2 className='text-sm font-semibold tracking-tight text-foreground shrink-0'>{title}</h2>
                <div className='flex-1 h-px bg-border/60' />
                <span className='text-xs text-muted-foreground tabular-nums shrink-0'>{results.length}</span>
            </div>
            <div className='flex flex-row gap-3 w-full overflow-x-auto noscroll pb-1'>
                {results.map((item, index) => (
                    <div key={index} className='w-[clamp(7.5rem,20vw,11rem)] shrink-0'>
                        <MediaCard item={item} type={type} />
                    </div>
                ))}
            </div>
        </section>
    )
}
