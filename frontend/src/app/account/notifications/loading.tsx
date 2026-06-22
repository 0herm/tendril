function SkeletonCard({ rows = 1 }: { rows?: number }) {
    return (
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
            {/* Card header row */}
            <div className='flex items-center gap-3 px-4 py-4 border-b border-border'>
                <div className='h-9 w-9 rounded-lg bg-muted animate-pulse shrink-0' />
                <div className='flex flex-col gap-1.5'>
                    <div className='h-3.5 w-32 bg-muted animate-pulse rounded' />
                    <div className='h-3 w-44 bg-muted/60 animate-pulse rounded' />
                </div>
            </div>
            {/* Card body */}
            <div className='px-4 py-4 flex flex-col gap-3'>
                {Array.from({ length: rows }, (_, i) => (
                    <div key={i} className='h-9 w-full bg-muted animate-pulse rounded-lg' />
                ))}
            </div>
        </div>
    )
}

function SkeletonAlertCard() {
    return (
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
            <div className='flex items-center gap-3 px-4 py-4 border-b border-border'>
                <div className='h-9 w-9 rounded-lg bg-muted animate-pulse shrink-0' />
                <div className='flex flex-col gap-1.5'>
                    <div className='h-3.5 w-28 bg-muted animate-pulse rounded' />
                    <div className='h-3 w-44 bg-muted/60 animate-pulse rounded' />
                </div>
            </div>
            <div className='divide-y divide-border'>
                {[1, 2, 3].map((i) => (
                    <div key={i} className='flex items-start gap-3 px-4 py-3'>
                        <div className='h-4 w-4 bg-muted animate-pulse rounded mt-0.5 shrink-0' />
                        <div className='flex flex-col gap-1.5 flex-1 min-w-0'>
                            <div className='h-3.5 w-40 bg-muted animate-pulse rounded' />
                            <div className='h-3 w-56 bg-muted/60 animate-pulse rounded' />
                            <div className='h-3 w-20 bg-muted/40 animate-pulse rounded' />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-4 max-w-xl'>
            <div className='flex flex-col gap-1'>
                <div className='h-6 w-32 bg-muted animate-pulse rounded-md' />
                <div className='h-3.5 w-60 bg-muted/60 animate-pulse rounded' />
            </div>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonAlertCard />
        </div>
    )
}
