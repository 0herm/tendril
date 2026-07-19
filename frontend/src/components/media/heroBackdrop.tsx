'use client'

import { useLayoutEffect, useRef } from 'react'
import { armSharedElement } from '@/utils/viewTransition'

export default function HeroBackdrop({ id, children }: { id: number; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (ref.current && sessionStorage.getItem('vt-backdrop-id') === String(id)) {
            armSharedElement('media-backdrop', ref.current)
            sessionStorage.removeItem('vt-backdrop-id')
        }
    }, [id])

    return <div ref={ref} className='absolute inset-0'>{children}</div>
}
