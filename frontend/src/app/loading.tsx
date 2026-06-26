function SkeletonRow({ titleW, count = 7 }: { titleW: string; count?: number }) {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
                <div className={`h-2.5 ${titleW} bg-muted animate-pulse rounded shrink-0`} />
            </div>
            <div className='-mx-5 sm:-mx-6 px-5 sm:px-6 flex gap-3 overflow-hidden'>
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
            <div className='flex items-center gap-2'>
                <div className='h-2.5 w-32 bg-muted animate-pulse rounded shrink-0' />
            </div>
            <div className='-mx-5 sm:-mx-6 pl-5 sm:pl-6 pr-5 sm:pr-6 flex gap-3 overflow-hidden pt-2'>
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
        <div className='w-full flex flex-col gap-8'>
            <div className='w-full rounded-2xl bg-muted animate-pulse' style={{ height: 'clamp(240px, 50vw, 520px)' }} />
            <SkeletonRankedRow />
            <SkeletonRow titleW='w-36' count={5} />
            <SkeletonRow titleW='w-20' />
            <SkeletonRow titleW='w-24' />
            <SkeletonRow titleW='w-20' />
            <SkeletonRow titleW='w-28' />
            <SkeletonRow titleW='w-24' />
        </div>
    )
}
