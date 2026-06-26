import type { ReactNode } from 'react'

export default function PasskeyLayout({ children }: { children: ReactNode }) {
    return (
        <div className='fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center'>
            {children}
        </div>
    )
}
