'use client'

import { Home, Search, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { href: string; icon: React.ElementType; label: string; exact?: boolean }

const tabs: Tab[] = [
    { href: '/', icon: Home, label: 'Home', exact: true },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/account', icon: User, label: 'Account' },
]

export default function BottomNav() {
    const pathname = usePathname()

    function isActive({ href, exact }: Tab) {
        return exact ? pathname === href : pathname.startsWith(href)
    }

    return (
        <nav
            className='fixed bottom-0 left-0 right-0 sm:hidden z-50'
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
            <div className='mx-5'>
                <div className='flex items-stretch bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg overflow-hidden h-16'>
                    {tabs.map((tab) => {
                        const { href, icon: Icon, label } = tab
                        const active = isActive(tab)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                                    active ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {active && (
                                    <span className='absolute inset-x-3 inset-y-2 bg-brand/10 rounded-xl' />
                                )}
                                <Icon className={`relative h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} />
                                <span className='relative text-[10px] font-medium leading-none'>{label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
