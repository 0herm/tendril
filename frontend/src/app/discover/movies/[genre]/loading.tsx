export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
                <div className='h-4 w-16 bg-muted animate-pulse rounded' />
                <div className='h-5 w-32 bg-muted animate-pulse rounded-lg' />
            </div>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3'>
                {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className='aspect-[2/3] rounded-xl bg-muted animate-pulse' style={{ animationDelay: `${i * 40}ms` }} />
                ))}
            </div>
        </div>
    )
}
