function SkeletonRow({ titleW, count = 7, action = false }: { titleW: string; count?: number; action?: boolean }) {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
                <div className={`h-3.5 ${titleW} bg-muted animate-pulse rounded shrink-0`} />
                <div className='flex-1 h-px bg-border/60' />
                {action && <div className='h-7 w-20 bg-muted animate-pulse rounded-lg shrink-0' />}
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

export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-6'>
            <SkeletonRow titleW='w-36' count={5} action />
            <SkeletonRow titleW='w-16' count={7} />
            <SkeletonRow titleW='w-28' />
            <SkeletonRow titleW='w-24' />
        </div>
    )
}
