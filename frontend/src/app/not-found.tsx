import Link from 'next/link'

export default function Custom404() {
    return (
        <div className='w-full flex flex-col items-center justify-center gap-5 py-24 text-center'>
            <span className='text-8xl font-bold text-foreground/8 tabular-nums select-none tracking-tighter'>
                404
            </span>
            <div className='flex flex-col gap-2 -mt-2'>
                <h1 className='text-base font-semibold'>Page not found</h1>
                <p className='text-sm text-muted-foreground max-w-xs leading-relaxed'>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
            </div>
            <Link
                href='/'
                className='inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-brand hover:bg-brand-dim active:bg-brand-dimmer text-white text-sm font-medium transition-colors'
            >
                Go home
            </Link>
        </div>
    )
}
