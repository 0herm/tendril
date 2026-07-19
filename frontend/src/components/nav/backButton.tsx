'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const btnCls = (className?: string) =>
    'flex items-center justify-center w-8 h-8 rounded-xl bg-transparent hover:bg-white/8 text-white/75 hover:text-foreground transition-all shrink-0 ' +
    (className ?? '')

function markBack() {
    document.documentElement.classList.add('vt-back')
    setTimeout(() => document.documentElement.classList.remove('vt-back'), 600)
}

export default function BackButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
    const router = useRouter()
    const [origin, setOrigin] = useState<string | null>(null)

    useEffect(() => {
        setOrigin(sessionStorage.getItem('vt-origin'))
    }, [])

    if (origin) {
        return (
            <Link
                href={origin}
                prefetch={true}
                scroll={false}
                onClick={() => {
                    markBack()
                    sessionStorage.removeItem('vt-origin')
                    sessionStorage.setItem('vt-restore-scroll', '1')
                }}
                aria-label='Go back'
                style={style}
                className={btnCls(className)}
            >
                <ArrowLeft className='h-4 w-4' />
            </Link>
        )
    }

    return (
        <button
            onClick={() => {
                markBack()
                router.back()
            }}
            aria-label='Go back'
            style={style}
            className={btnCls(className)}
        >
            <ArrowLeft className='h-4 w-4' />
        </button>
    )
}
