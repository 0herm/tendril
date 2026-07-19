'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/ui/button'
import { Check } from 'lucide-react'
import config from '@config'

type Props = {
    providers: WatchProvider[]
    saved: number[]
    saveAction: (ids: number[]) => Promise<void>
}

export default function StreamingClient({ providers, saved, saveAction }: Props) {
    const [selected, setSelected] = useState<Set<number>>(new Set(saved))
    const [pending, startTransition] = useTransition()

    function toggle(id: number) {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    function handleSave() {
        startTransition(() => saveAction(Array.from(selected)))
    }

    return (
        <div className='w-full flex flex-col gap-8'>
            <div className='flex flex-col gap-1'>
                <h1 className='display text-2xl sm:text-3xl font-bold'>Streaming Services</h1>
                <p className='text-xs text-muted-foreground/70'>Choose the services you subscribe to.</p>
            </div>

            <div className='rounded-2xl border border-border/60 overflow-hidden bg-surface-1'>
                <p className='text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em] px-4 pt-4 pb-3'>
                    Available in your region
                </p>
                <div className='grid grid-cols-[repeat(auto-fill,minmax(5rem,6rem))] gap-3 px-4 pb-4'>
                    {providers.map((p) => {
                        const active = selected.has(p.provider_id)
                        return (
                            <button
                                key={p.provider_id}
                                onClick={() => toggle(p.provider_id)}
                                className={
                                    'relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center cursor-pointer ' +
                                    (active
                                        ? 'border-ambient/60 bg-ambient/10 ring-1 ring-ambient/20'
                                        : 'border-border/50 bg-white/4 hover:bg-white/8 hover:border-border-strong')
                                }
                            >
                                {active && (
                                    <span className='absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ambient'>
                                        <Check className='h-2.5 w-2.5 text-white' strokeWidth={3} />
                                    </span>
                                )}
                                <div className='relative h-10 w-10 rounded-xl overflow-hidden shrink-0'>
                                    <Image
                                        src={`${config.url.IMAGE_URL}${p.logo_path}`}
                                        alt={p.provider_name}
                                        fill
                                        className='object-cover'
                                        sizes='40px'
                                    />
                                </div>
                                <span className='text-[11px] font-medium text-foreground/70 leading-tight line-clamp-2'>
                                    {p.provider_name}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className='flex items-center gap-3'>
                <Button onClick={handleSave} disabled={pending} className='flex-1'>
                    {pending ? 'Saving…' : `Save${selected.size > 0 ? ` (${selected.size} selected)` : ''}`}
                </Button>
                {selected.size > 0 && (
                    <button
                        onClick={() => setSelected(new Set())}
                        className='px-3 h-10 text-sm text-muted-foreground/60 hover:text-foreground transition-colors'
                    >
                        Clear all
                    </button>
                )}
            </div>
        </div>
    )
}
