'use client'

import Link from 'next/link'
import { Button } from '@/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({ reset }: { reset: () => void }) {
    return (
        <div className='w-full flex flex-col items-center justify-center gap-5 py-24 text-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10'>
                <AlertCircle className='h-7 w-7 text-destructive' />
            </div>
            <div className='flex flex-col gap-1.5 -mt-1'>
                <h2 className='text-base font-semibold'>Movie failed to load</h2>
                <p className='text-sm text-muted-foreground max-w-xs leading-relaxed'>
                    Try again or head back to browse.
                </p>
            </div>
            <div className='flex gap-2'>
                <Button onClick={() => reset()}>Try again</Button>
                <Link
                    href='/'
                    className={
                        'inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border/60 ' +
                        'bg-transparent hover:bg-muted active:bg-muted/70 text-foreground text-sm font-medium transition-colors shadow-xs'
                    }
                >
                    Go home
                </Link>
            </div>
        </div>
    )
}
