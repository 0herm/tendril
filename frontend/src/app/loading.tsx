export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-6'>
            {[20, 28, 22, 24, 18].map((titleW, s) => (
                <div key={s} className='flex flex-col gap-3'>
                    <div className='flex items-center gap-3'>
                        <div className={`h-3.5 w-${titleW} bg-muted animate-pulse rounded shrink-0`} />
                        <div className='flex-1 h-px bg-border/40' />
                        <div className='h-3 w-5 bg-muted animate-pulse rounded' />
                    </div>
                    <div className='flex gap-3 overflow-hidden'>
                        {Array.from({ length: 7 }, (_, i) => (
                            <div
                                key={i}
                                className='w-[clamp(7.5rem,20vw,11rem)] shrink-0 aspect-[2/3] rounded-xl bg-muted animate-pulse'
                                style={{ animationDelay: `${i * 60}ms` }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
