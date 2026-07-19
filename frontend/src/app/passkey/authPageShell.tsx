import { Clapperboard, Fingerprint } from 'lucide-react'
import type { ReactNode } from 'react'

export function PasskeyButton({ onClick, loading, children }: {
    onClick: () => void
    loading: boolean
    children: ReactNode
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={
                'group w-full h-[3.25rem] flex items-center justify-center gap-2.5 rounded-2xl cursor-pointer ' +
                'bg-brand hover:bg-brand-dim active:bg-brand-dimmer active:scale-[0.99] text-white text-sm font-semibold ' +
                'transition-all duration-200 shadow-[inset_0_1px_0_oklch(1_0_0/0.25),0_8px_32px_oklch(0.72_0.19_155/25%)] ' +
                'disabled:opacity-60 disabled:pointer-events-none'
            }
        >
            <Fingerprint className='h-[1.125rem] w-[1.125rem] transition-transform group-hover:scale-105' />
            {children}
        </button>
    )
}

export default function AuthPageShell({ title, description, children }: {
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <div className='w-full h-full flex flex-col items-center justify-center px-6'>
            <div className='absolute inset-0 pointer-events-none overflow-hidden opacity-[0.07]'>
                <div
                    className={
                        'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56rem] h-[56rem] rounded-full ' +
                        'bg-brand blur-[160px] animate-[ambient-breathe_9s_ease-in-out_infinite] [will-change:filter]'
                    }
                />
            </div>

            <div className='relative w-full max-w-[22rem] flex flex-col items-center gap-14'>
                <div className='flex flex-col items-center gap-2.5'>
                    <div
                        className={
                            'w-14 h-14 rounded-[18px] bg-brand/10 border border-brand/20 flex items-center justify-center ' +
                            'shadow-[0_0_0_6px_oklch(0.72_0.19_155/6%)]'
                        }
                    >
                        <Clapperboard className='h-7 w-7 text-brand' />
                    </div>
                    <span className='display text-[11px] font-bold tracking-[0.2em] uppercase text-brand/70 mt-0.5'>Tendril</span>
                </div>

                <div className='flex flex-col items-center gap-3 text-center'>
                    <h1 className='display text-[2.25rem] font-black leading-none'>{title}</h1>
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
