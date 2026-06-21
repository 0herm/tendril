export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-6'>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {[1, 2, 3].map((i) => (
                    <div key={i} className='bg-card border border-border rounded-xl p-4 flex flex-col gap-2'>
                        <div className='h-3 w-16 bg-muted animate-pulse rounded' />
                        <div className='h-7 w-20 bg-muted animate-pulse rounded-lg' />
                        <div className='h-2.5 w-12 bg-muted/60 animate-pulse rounded' />
                    </div>
                ))}
            </div>

            <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                    <div className='h-3.5 w-20 bg-muted animate-pulse rounded shrink-0' />
                    <div className='flex-1 h-px bg-border/40' />
                </div>
                <div className='bg-card border border-border rounded-xl p-4 flex flex-col gap-3'>
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className='flex items-center gap-3'>
                            <div className='h-3 w-20 bg-muted animate-pulse rounded shrink-0' />
                            <div
                                className='h-3 bg-muted animate-pulse rounded-full'
                                style={{ width: `${60 - i * 5}%`, animationDelay: `${i * 40}ms` }}
                            />
                            <div className='h-3 w-6 bg-muted/60 animate-pulse rounded shrink-0' />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
