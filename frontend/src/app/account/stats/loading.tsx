function SkeletonBarList({ rows, leftW }: { rows: number; leftW: string }) {
    return (
        <div className='rounded-xl border border-border bg-card overflow-hidden'>
            {Array.from({ length: rows }, (_, i) => (
                <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-2.5 ${i < rows - 1 ? 'border-b border-border' : ''}`}
                >
                    <div className={`${leftW} h-3 bg-muted animate-pulse rounded shrink-0`}
                        style={{ animationDelay: `${i * 40}ms` }}
                    />
                    <div className='flex items-center gap-2.5 flex-1 min-w-0'>
                        <div
                            className='flex-1 h-1.5 rounded-full bg-muted animate-pulse'
                            style={{ maxWidth: `${Math.max(20, 80 - i * 8)}%`, animationDelay: `${i * 40}ms` }}
                        />
                    </div>
                    <div className='h-3 w-4 bg-muted/60 animate-pulse rounded shrink-0' />
                </div>
            ))}
        </div>
    )
}

export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-6 max-w-xl'>
            {/* Page title */}
            <div className='flex flex-col gap-1'>
                <div className='h-6 w-10 bg-muted animate-pulse rounded-md' />
                <div className='h-3.5 w-52 bg-muted/60 animate-pulse rounded' />
            </div>

            {/* 3 stat cards */}
            <div className='grid grid-cols-3 gap-3'>
                {[1, 2, 3].map((i) => (
                    <div key={i} className='flex flex-col gap-2 rounded-xl border border-border bg-card p-4'>
                        <div className='flex items-center gap-1.5'>
                            <div className='h-4 w-4 bg-muted animate-pulse rounded' />
                            <div className='h-3 w-10 bg-muted animate-pulse rounded' />
                        </div>
                        <div className='h-7 w-14 bg-muted animate-pulse rounded-lg' />
                    </div>
                ))}
            </div>

            {/* Genres section — icon + label header (no divider line, matches actual page) */}
            <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-2'>
                    <div className='h-3.5 w-3.5 bg-muted animate-pulse rounded' />
                    <div className='h-3.5 w-14 bg-muted animate-pulse rounded' />
                </div>
                <SkeletonBarList rows={8} leftW='w-20' />
            </div>

            {/* Years section */}
            <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-2'>
                    <div className='h-3.5 w-3.5 bg-muted animate-pulse rounded' />
                    <div className='h-3.5 w-36 bg-muted animate-pulse rounded' />
                </div>
                <SkeletonBarList rows={6} leftW='w-10' />
            </div>
        </div>
    )
}
