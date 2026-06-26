import { SkeletonHeading } from '@/components/media/sectionHeading'

export function MediaPageSkeleton({ isShow = false }: { isShow?: boolean }) {
    return (
        <div className='relative w-full flex flex-col gap-6 -mt-4'>

            {/* Hero */}
            <div className='relative -mx-5 sm:-mx-6 min-h-72 sm:min-h-[26rem] bg-muted/40 overflow-hidden flex flex-col justify-end'>
                <div className='absolute inset-0 bg-linear-to-b from-transparent via-background/60 to-background' />
                <div className='relative z-10 px-5 sm:px-6 pb-8 pt-6'>
                    <div className='flex flex-col items-center sm:flex-row sm:items-end gap-5 sm:gap-8'>
                        <div className='w-32 sm:w-44 md:w-52 aspect-[2/3] rounded-xl bg-muted animate-pulse shrink-0' />
                        <div className='flex flex-col gap-3 flex-1 items-center sm:items-start'>
                            <div className='h-3 w-14 bg-muted/80 animate-pulse rounded-full' />
                            <div className='flex flex-col gap-1'>
                                <div className='h-9 w-64 bg-muted/80 animate-pulse rounded-lg' />
                            </div>
                            <div className='h-4 w-40 bg-muted/60 animate-pulse rounded-md' />
                            <div className='h-3 w-48 bg-muted/40 animate-pulse rounded' />
                            <div className='flex gap-1.5'>
                                {['w-16', 'w-20', 'w-14'].map((w) => (
                                    <div key={w} className={`h-5 ${w} bg-muted/50 animate-pulse rounded-full`} />
                                ))}
                            </div>
                            <div className='flex gap-2 pt-1'>
                                <div className='h-10 w-10 rounded-lg bg-muted/60 animate-pulse' />
                                <div className='h-10 w-10 rounded-lg bg-muted/60 animate-pulse' />
                                <div className='h-10 w-24 rounded-lg bg-muted/60 animate-pulse' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview */}
            <div className='flex flex-col gap-3'>
                <SkeletonHeading width='w-16' />
                <div className='flex flex-col gap-2.5'>
                    <div className='h-3 w-full bg-muted animate-pulse rounded' />
                    <div className='h-3 w-5/6 bg-muted animate-pulse rounded' />
                    <div className='h-3 w-3/4 bg-muted animate-pulse rounded' />
                </div>
            </div>

            {/* Where to Watch */}
            <div className='flex flex-col gap-3'>
                <SkeletonHeading width='w-28' />
                <div className='bg-card border border-border rounded-xl overflow-hidden'>
                    <div className='px-4 py-3.5'>
                        <div className='h-2 w-10 bg-muted/50 animate-pulse rounded mb-3' />
                        <div className='flex gap-3'>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className='flex flex-col items-center gap-1.5 shrink-0'>
                                    <div className='w-11 h-11 rounded-xl bg-muted animate-pulse' />
                                    <div className='h-2 w-10 bg-muted animate-pulse rounded' />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='border-t border-border px-4 py-3.5'>
                        <div className='h-2 w-8 bg-muted/50 animate-pulse rounded mb-3' />
                        <div className='flex gap-3'>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className='flex flex-col items-center gap-1.5 shrink-0'>
                                    <div className='w-11 h-11 rounded-xl bg-muted animate-pulse' />
                                    <div className='h-2 w-10 bg-muted animate-pulse rounded' />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seasons (shows only) */}
            {isShow && (
                <div className='flex flex-col gap-3'>
                    <SkeletonHeading width='w-16' />
                    <div className='-mx-5 sm:-mx-6 px-5 sm:px-6 flex gap-3 overflow-hidden'>
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
            )}

            {/* Details */}
            <div className='flex flex-col gap-3'>
                <SkeletonHeading width='w-14' />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='bg-card border border-border rounded-xl overflow-hidden'>
                        <div className='px-4 py-3 border-b border-border'>
                            <div className='h-2.5 w-14 bg-muted animate-pulse rounded' />
                        </div>
                        <div className='px-4 py-2 flex flex-col divide-y divide-border'>
                            {Array.from({ length: isShow ? 6 : 5 }, (_, i) => (
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
                            {Array.from({ length: isShow ? 4 : 3 }, (_, i) => (
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

            {/* More Like This */}
            <div className='flex flex-col gap-3'>
                <SkeletonHeading width='w-24' />
                <div className='-mx-5 sm:-mx-6 px-5 sm:px-6 flex gap-3 overflow-hidden'>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className='w-[clamp(7.5rem,20vw,11rem)] shrink-0 aspect-[2/3] rounded-xl bg-muted animate-pulse'
                            style={{ animationDelay: `${i * 50}ms` }}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}
