import { SkeletonHeading } from '@/components/media/sectionHeading'

export function MediaPageSkeleton({ isShow = false }: { isShow?: boolean }) {
    return (
        <div className='relative w-full flex flex-col'>

            {/* Hero */}
            <div className='relative w-full min-h-[55vh] sm:min-h-[min(72vh,43.75rem)] bg-muted/30 overflow-hidden flex flex-col justify-end'>
                <div className='absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent' />
                <div className='relative z-10 w-full px-5 sm:px-6'>
                    <div className='max-w-6xl mx-auto flex items-end gap-8 pb-8 sm:pb-12'>
                        <div className='hidden sm:block w-36 md:w-44 aspect-[2/3] rounded-2xl bg-muted animate-pulse shrink-0' />
                        <div className='flex flex-col gap-3.5 flex-1'>
                            <div className='h-3 w-14 bg-muted/80 animate-pulse rounded-full' />
                            <div className='h-12 sm:h-16 w-3/4 max-w-md bg-muted/80 animate-pulse rounded-lg' />
                            <div className='h-3 w-48 bg-muted/40 animate-pulse rounded' />
                            <div className='flex gap-1.5'>
                                {['w-16', 'w-20', 'w-14'].map((w) => (
                                    <div key={w} className={`h-6 ${w} bg-muted/50 animate-pulse rounded-full`} />
                                ))}
                            </div>
                            <div className='flex gap-2 pt-1'>
                                <div className='h-9 w-9 rounded-xl bg-muted/60 animate-pulse' />
                                <div className='h-9 w-9 rounded-xl bg-muted/60 animate-pulse' />
                                <div className='h-9 w-24 rounded-xl bg-muted/60 animate-pulse' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='w-full px-5 sm:px-6'>
                <div className='max-w-6xl mx-auto flex flex-col gap-10 pt-10'>

                    {/* Overview */}
                    <div className='flex flex-col gap-3'>
                        <SkeletonHeading width='w-28' />
                        <div className='flex flex-col gap-2.5'>
                            <div className='h-3.5 w-full max-w-3xl bg-muted animate-pulse rounded' />
                            <div className='h-3.5 w-5/6 max-w-2xl bg-muted animate-pulse rounded' />
                            <div className='h-3.5 w-3/4 max-w-xl bg-muted animate-pulse rounded' />
                        </div>
                    </div>

                    {/* Where to Watch */}
                    <div className='flex flex-col gap-4'>
                        <SkeletonHeading width='w-40' />
                        <div className='flex flex-col gap-3'>
                            <div className='h-2 w-12 bg-muted/50 animate-pulse rounded' />
                            <div className='flex gap-3'>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className='flex flex-col items-center gap-2 shrink-0'>
                                        <div className='w-13 h-13 rounded-2xl bg-muted animate-pulse' />
                                        <div className='h-2 w-10 bg-muted animate-pulse rounded' />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Seasons (shows only) */}
                    {isShow && (
                        <div className='flex flex-col gap-3'>
                            <SkeletonHeading width='w-24' />
                            <div className='flex gap-3 overflow-hidden'>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className='flex-none w-28 sm:w-32 bg-surface-1 border border-border rounded-xl overflow-hidden shrink-0'>
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
                    <div className='flex flex-col gap-4'>
                        <SkeletonHeading width='w-24' />
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-10'>
                            {[0, 1].map((col) => (
                                <div key={col} className='flex flex-col divide-y divide-border/60'>
                                    {Array.from({ length: isShow ? 5 : 4 }, (_, i) => (
                                        <div key={i} className='flex justify-between items-center py-3'>
                                            <div className='h-3 w-16 bg-muted animate-pulse rounded' />
                                            <div className='h-3 w-24 bg-muted animate-pulse rounded' />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* More Like This */}
                    <div className='flex flex-col gap-3'>
                        <SkeletonHeading width='w-40' />
                        <div className='flex gap-3 overflow-hidden'>
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
            </div>
        </div>
    )
}
