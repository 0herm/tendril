import { Clapperboard } from 'lucide-react'
import type { ReactNode } from 'react'

export default function AuthPageShell({ title, description, children }: {
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <div className='w-full h-full flex flex-col items-center justify-center px-6'>
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56rem] h-[56rem] rounded-full bg-brand blur-[160px] opacity-[0.045]' />
            </div>

            <div className='relative w-full max-w-[22rem] flex flex-col items-center gap-14'>
                <div className='flex flex-col items-center gap-2.5'>
                    <div className='w-14 h-14 rounded-[18px] bg-brand/10 border border-brand/20 flex items-center justify-center shadow-[0_0_0_6px_oklch(0.68_0.18_155/6%)]'>
                        <Clapperboard className='h-7 w-7 text-brand' />
                    </div>
                    <span className='text-[11px] font-bold tracking-[0.2em] uppercase text-brand/70 mt-0.5'>Tendril</span>
                </div>

                <div className='flex flex-col items-center gap-3 text-center'>
                    <h1 className='text-[2.25rem] font-black tracking-tight leading-none'>{title}</h1>
                    <p className='text-[13px] text-muted-foreground/60 leading-relaxed max-w-[16rem]'>{description}</p>
                </div>

                <div className='w-full flex flex-col gap-3'>
                    {children}
                </div>
            </div>

            <div className='absolute bottom-0 left-0 right-0 flex items-center justify-center' style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
                <p className='text-[11px] text-muted-foreground/30 tracking-wide'>Secured with WebAuthn</p>
            </div>
        </div>
    )
}
