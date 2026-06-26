'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

export function TrailerButton({ videos }: { videos: VideoItem[] }) {
    const [open, setOpen] = useState(false)

    const trailer =
        videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
        videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
        videos.find((v) => v.site === 'YouTube')

    if (!trailer) return null

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className='inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/12 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-all'
            >
                <Play className='h-3.5 w-3.5 shrink-0 fill-current' />
                <span className='hidden xs:inline'>Trailer</span>
            </button>

            {open && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4'
                    onClick={() => setOpen(false)}
                >
                    <div
                        className='relative w-full max-w-4xl'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setOpen(false)}
                            className='absolute -top-10 right-0 flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm'
                        >
                            <X className='h-4 w-4' />
                            Close
                        </button>
                        <div className='relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10'>
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
                                title={trailer.name}
                                allow='autoplay; encrypted-media; fullscreen'
                                allowFullScreen
                                className='absolute inset-0 w-full h-full'
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
