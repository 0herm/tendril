function SkeletonRow({ titleW, count = 7 }: { titleW: number; count?: number }) {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
                <div className={`h-3.5 w-${titleW} bg-muted animate-pulse rounded shrink-0`} />
                <div className='flex-1 h-px bg-border/40' />
                <div className='h-3 w-5 bg-muted animate-pulse rounded' />
            </div>
            <div className='flex gap-3 overflow-hidden'>
                {Array.from({ length: count }, (_, i) => (
                    <div
                        key={i}
                        className='w-[clamp(7.5rem,20vw,11rem)] shrink-0 aspect-[2/3] rounded-xl bg-muted animate-pulse'
                        style={{ animationDelay: `${i * 60}ms` }}
                    />
                ))}
            </div>
        </div>
    )
}

const ROWS: { titleW: number; count?: number }[] = [
    { titleW: 36, count: 5 },  // Continue Watching
    { titleW: 28, count: 10 }, // Top 10 Right Now
    { titleW: 20 },            // Trending
    { titleW: 24 },            // New Movies
    { titleW: 20 },            // New Shows
    { titleW: 28 },            // Popular Movies
    { titleW: 24 },            // Popular Shows
    { titleW: 32 },            // Top Rated Movies
    { titleW: 28 },            // Top Rated Shows
    { titleW: 28 },            // Upcoming Movies
    { titleW: 24 },            // Upcoming Shows
]

export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-6'>
            {ROWS.map(({ titleW, count }, s) => (
                <SkeletonRow key={s} titleW={titleW} count={count} />
            ))}
        </div>
    )
}
