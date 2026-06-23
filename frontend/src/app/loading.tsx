function SkeletonRow({ titleW, count = 7 }: { titleW: string; count?: number }) {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
                <div className={`h-3.5 ${titleW} bg-muted animate-pulse rounded shrink-0`} />
                <div className='flex-1 h-px bg-border/40' />
                <div className='h-3 w-5 bg-muted animate-pulse rounded' />
            </div>
            <div className='-mx-4 sm:-mx-5 px-4 sm:px-5 flex gap-3 overflow-hidden'>
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

function SkeletonRankedRow() {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
                <div className='h-3.5 w-32 bg-muted animate-pulse rounded shrink-0' />
                <div className='flex-1 h-px bg-border/40' />
            </div>
            <div className='-mx-4 sm:-mx-5 pl-2 pr-4 sm:pr-5 flex gap-3 overflow-hidden pt-2'>
                {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className='shrink-0 relative' style={{ width: 'clamp(10rem, calc(20vw + 2.5rem), 13.5rem)' }}>
                        <div className='ml-10'>
                            <div
                                className='aspect-[2/3] rounded-xl bg-muted animate-pulse'
                                style={{ animationDelay: `${i * 60}ms` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-6'>
            {/* Hero carousel */}
            <div className='w-full rounded-2xl bg-muted animate-pulse' style={{ height: 'clamp(190px, 42vw, 400px)' }} />

            <SkeletonRankedRow />                          {/* Top 10 Right Now */}
            <SkeletonRow titleW='w-36' count={5} />        {/* Continue Watching */}
            <SkeletonRow titleW='w-20' />                  {/* Trending */}
            <SkeletonRow titleW='w-24' />                  {/* New Movies */}
            <SkeletonRow titleW='w-20' />                  {/* New Shows */}
            <SkeletonRow titleW='w-28' />                  {/* Popular Movies */}
            <SkeletonRow titleW='w-24' />                  {/* Popular Shows */}
            <SkeletonRow titleW='w-32' />                  {/* Top Rated Movies */}
            <SkeletonRow titleW='w-28' />                  {/* Top Rated Shows */}
            <SkeletonRow titleW='w-28' />                  {/* Upcoming Movies */}
            <SkeletonRow titleW='w-24' />                  {/* Upcoming Shows */}
        </div>
    )
}
