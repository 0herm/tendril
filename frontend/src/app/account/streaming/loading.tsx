export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-8'>
            <div className='flex flex-col gap-0.5'>
                <div className='h-7 w-48 bg-muted animate-pulse rounded-md' />
                <div className='h-3.5 w-56 bg-muted/60 animate-pulse rounded' />
            </div>
            <div className='rounded-2xl border border-border/60 overflow-hidden bg-card'>
                <div className='px-4 pt-4 pb-3'>
                    <div className='h-2.5 w-40 bg-muted animate-pulse rounded' />
                </div>
                <div className='grid grid-cols-[repeat(auto-fill,minmax(5rem,6rem))] gap-3 px-4 pb-4'>
                    {Array.from({ length: 21 }).map((_, i) => (
                        <div key={i} className='flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-muted/30'>
                            <div className='h-10 w-10 rounded-xl bg-muted animate-pulse' />
                            <div className='h-3 w-16 bg-muted/60 animate-pulse rounded' />
                        </div>
                    ))}
                </div>
            </div>
            <div className='h-10 w-full bg-muted animate-pulse rounded-lg' />
        </div>
    )
}
