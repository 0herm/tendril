'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function isFullBleed(pathname: string) {
    return pathname === '/' || pathname.startsWith('/movie/') || pathname.startsWith('/show/')
}

export default function HeaderShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const sentinelRef = useRef<HTMLDivElement>(null)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const el = sentinelRef.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const transparent = isFullBleed(pathname) && !scrolled

    return (
        <>
            <div ref={sentinelRef} aria-hidden className='absolute top-0 left-0 w-px h-6 pointer-events-none' />
            <header
                data-transparent={transparent ? '' : undefined}
                className='fixed top-0 left-0 right-0 z-50 print:hidden'
                style={{
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    viewTransitionName: 'site-header',
                }}
            >
                <div
                    aria-hidden
                    className={
                        'absolute inset-0 bg-background/95 border-b border-border ' +
                        `shadow-[inset_0_1px_0_oklch(1_0_0/0.04)] transition-opacity duration-200 ${transparent ? 'opacity-0' : 'opacity-100'}`
                    }
                />
                <div
                    aria-hidden
                    className={
                        'absolute inset-x-0 top-0 h-[150%] bg-linear-to-b from-black/50 to-transparent pointer-events-none ' +
                        `transition-opacity duration-200 ${transparent ? 'opacity-100' : 'opacity-0'}`
                    }
                />
                <div className='relative h-14'>{children}</div>
            </header>
        </>
    )
}
