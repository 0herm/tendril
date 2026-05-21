export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-6'>

            {/* Hero */}
            <div className='relative -mx-4 sm:-mx-5 min-h-72 sm:min-h-[26rem] bg-muted/40 overflow-hidden flex flex-col justify-end'>
                <div className='absolute inset-0 bg-linear-to-b from-transparent via-background/60 to-background' />
                <div className='relative z-10 px-4 sm:px-5 pb-8 pt-6'>
                    <div className='flex flex-col items-center sm:flex-row sm:items-end gap-5 sm:gap-8'>
                        <div className='w-32 sm:w-44 md:w-52 aspect-[2/3] rounded-xl bg-muted animate-pulse shrink-0' />
                        <div className='flex flex-col gap-3 flex-1 items-center sm:items-start'>
                            <div className='h-3 w-16 bg-muted/80 animate-pulse rounded-full' />
                            <div className='h-9 w-64 bg-muted/80 animate-pulse rounded-lg' />
                            <div className='h-4 w-40 bg-muted/60 animate-pulse rounded-md' />
                            <div className='flex gap-1.5'>
                                {[16, 20, 14].map((w) => (
                                    <div key={w} className={`h-5 w-${w} bg-muted/50 animate-pulse rounded-full`} />
                                ))}
                            </div>
                            <div className='flex gap-2 pt-1'>
                                <div className='h-10 w-10 rounded-lg bg-muted/60 animate-pulse' />
                                <div className='h-10 w-10 rounded-lg bg-muted/60 animate-pulse' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview */}
            <div className='flex flex-col gap-3'>
                <SkeletonHeading width='w-16' />
                <div className='bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5'>
                    <div className='h-3 w-full bg-muted animate-pulse rounded' />
                    <div className='h-3 w-5/6 bg-muted animate-pulse rounded' />
                    <div className='h-3 w-3/4 bg-muted animate-pulse rounded' />
                </div>
            </div>

            {/* Where to Watch */}
            <div className='flex flex-col gap-3'>
                <SkeletonHeading width='w-28' />
                <div className='bg-card border border-border rounded-xl p-4 flex gap-3'>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className='flex flex-col items-center gap-1.5 shrink-0'>
                            <div className='w-11 h-11 rounded-xl bg-muted animate-pulse' />
                            <div className='h-2 w-10 bg-muted animate-pulse rounded' />
                        </div>
                    ))}
                </div>
            </div>

            {/* Seasons */}
            <div className='flex flex-col gap-3'>
                <SkeletonHeading width='w-16' />
                <div className='flex gap-3 overflow-hidden'>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className='flex-none w-28 sm:w-32 bg-card border border-border rounded-xl overflow-hidden shrink-0'>
                            <div className='aspect-[2/3] w-full bg-muted animate-pulse' />
                            <div className='p-2.5 flex flex-col gap-1'>
                                <div className='h-3 w-16 bg-muted animate-pulse rounded' />
                                <div className='h-2.5 w-12 bg-muted/70 animate-pulse rounded' />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Details */}
            <div className='flex flex-col gap-3'>
                <SkeletonHeading width='w-14' />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='bg-card border border-border rounded-xl overflow-hidden'>
                        <div className='px-4 py-3 border-b border-border'>
                            <div className='h-2.5 w-14 bg-muted animate-pulse rounded' />
                        </div>
                        <div className='px-4 py-2 flex flex-col divide-y divide-border'>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className='flex justify-between items-center py-2.5'>
                                    <div className='h-3 w-16 bg-muted animate-pulse rounded' />
                                    <div className='h-3 w-20 bg-muted animate-pulse rounded' />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='bg-card border border-border rounded-xl overflow-hidden'>
                        <div className='px-4 py-3 border-b border-border'>
                            <div className='h-2.5 w-20 bg-muted animate-pulse rounded' />
                        </div>
                        <div className='px-4 py-3 flex flex-col gap-4'>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className='flex flex-col gap-1.5'>
                                    <div className='h-2.5 w-16 bg-muted/70 animate-pulse rounded' />
                                    <div className='flex gap-1'>
                                        <div className='h-5 w-20 bg-muted animate-pulse rounded-md' />
                                        <div className='h-5 w-16 bg-muted animate-pulse rounded-md' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

function SkeletonHeading({ width }: { width: string }) {
    return (
        <div className='flex items-center gap-3'>
            <div className={`h-3.5 ${width} bg-muted animate-pulse rounded shrink-0`} />
            <div className='flex-1 h-px bg-border/40' />
        </div>
    )
}
