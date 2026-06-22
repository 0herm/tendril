export default function Loading() {
    return (
        <div className='w-full flex flex-col gap-4 max-w-xl'>
            {/* Page title */}
            <div className='flex flex-col gap-1.5'>
                <div className='h-6 w-20 bg-muted animate-pulse rounded-md' />
                <div className='h-3.5 w-56 bg-muted/60 animate-pulse rounded' />
            </div>

            {/* Content card, 3 rows (Language, Region, Timezone) */}
            <div className='rounded-xl border border-border overflow-hidden bg-card'>
                <div className='px-4 pt-3 pb-1'>
                    <div className='h-2.5 w-14 bg-muted animate-pulse rounded' />
                </div>
                {[0, 1, 2].map((i) => (
                    <div key={i} className={`flex items-center justify-between px-4 min-h-12 ${i < 2 ? 'border-b border-border' : ''}`}>
                        <div className='h-3.5 w-20 bg-muted animate-pulse rounded' />
                        <div className='h-8 w-36 bg-muted/60 animate-pulse rounded-lg' />
                    </div>
                ))}
            </div>

            {/* Preferences card, 2 rows (toggles) */}
            <div className='rounded-xl border border-border overflow-hidden bg-card'>
                <div className='px-4 pt-3 pb-1'>
                    <div className='h-2.5 w-24 bg-muted animate-pulse rounded' />
                </div>
                {[0, 1].map((i) => (
                    <div key={i} className={`flex items-center justify-between px-4 min-h-12 ${i < 1 ? 'border-b border-border' : ''}`}>
                        <div className='h-3.5 w-36 bg-muted animate-pulse rounded' />
                        <div className='h-4 w-4 bg-muted/60 animate-pulse rounded' />
                    </div>
                ))}
            </div>

            {/* Save button */}
            <div className='h-10 w-full bg-muted animate-pulse rounded-lg' />
        </div>
    )
}
