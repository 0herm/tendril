'use client'

import { Home, Search, User, Compass } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { href: string; icon: React.ElementType; label: string; exact?: boolean }

const tabs: Tab[] = [
    { href: '/', icon: Home, label: 'Home', exact: true },
    { href: '/discover', icon: Compass, label: 'Discover' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/account', icon: User, label: 'Account' },
]

export default function BottomNav() {
    const pathname = usePathname()

    if (pathname.startsWith('/passkey')) return null

    function isActive({ href, exact }: Tab) {
        return exact ? pathname === href : pathname.startsWith(href)
    }

    return (
        <nav
            className='fixed bottom-0 left-0 right-0 sm:hidden z-50'
            style={{
                paddingBottom: 'max(0px, calc(env(safe-area-inset-bottom, 0px) - 24px))',
                viewTransitionName: 'bottom-nav',
            }}
        >
            <div className='mx-5'>
                <div
                    className={
                        'flex items-stretch bg-surface-1/95 border border-white/8 rounded-2xl ' +
                        'shadow-[inset_0_1px_0_oklch(1_0_0/0.08),0_20px_25px_-5px_oklch(0_0_0/0.4)] overflow-hidden h-[3.75rem]'
                    }
                >
                    {tabs.map((tab) => {
                        const { href, icon: Icon, label } = tab
                        const active = isActive(tab)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                                    active ? 'text-ambient' : 'text-muted-foreground/60 hover:text-foreground'
                                }`}
                            >
                                {active && (
                                    <span
                                        aria-hidden
                                        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ambient/20 blur-lg [will-change:filter]'
                                    />
                                )}
                                <Icon
                                    className={`relative h-5 w-5 transition-transform duration-300 ease-spring ${active ? 'scale-110' : ''}`}
                                />
                                {active && (
                                    <span className='relative text-[10px] font-semibold leading-none animate-[fade-scale-in_300ms_var(--ease-out)_both]'>
                                        {label}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
