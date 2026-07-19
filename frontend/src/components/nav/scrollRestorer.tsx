'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollRestorer() {
    const pathname = usePathname()

    useLayoutEffect(() => {
        if (!sessionStorage.getItem('vt-restore-scroll')) return
        sessionStorage.removeItem('vt-restore-scroll')
        const y = Number(sessionStorage.getItem('vt-scroll'))
        sessionStorage.removeItem('vt-scroll')
        if (Number.isFinite(y)) window.scrollTo({ top: y, left: 0, behavior: 'instant' })
    }, [pathname])

    return null
}
