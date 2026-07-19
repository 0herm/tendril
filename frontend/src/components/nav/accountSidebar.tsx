'use client'

import { Bell, BarChart2, LayoutDashboard, LogOut, Settings, Tv2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/account',               icon: LayoutDashboard, label: 'Overview',      exact: true },
    { href: '/account/stats',         icon: BarChart2,       label: 'Stats',         exact: false },
    { href: '/account/settings',      icon: Settings,        label: 'Settings',      exact: false },
    { href: '/account/notifications', icon: Bell,            label: 'Notifications', exact: false },
    { href: '/account/streaming',     icon: Tv2,             label: 'Streaming',     exact: false },
]

const ITEM_STRIDE = 42

export default function AccountSidebar({ logoutAction }: { logoutAction: () => Promise<void> }) {
    const pathname = usePathname()
    const activeIndex = navItems.findIndex(({ href, exact }) => exact ? pathname === href : pathname.startsWith(href))

    return (
        <>
            {/* Mobile — horizontal scroll tab bar */}
            <nav className='sm:hidden -mx-5 border-b border-border/40 bg-background'>
                <div className='flex overflow-x-auto noscroll px-3 py-1.5 gap-1'>
                    {navItems.map(({ href, icon: Icon, label }, i) => {
                        const active = i === activeIndex
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                                    active
                                        ? 'bg-ambient/12 text-ambient border border-ambient/25'
                                        : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <Icon className='h-3.5 w-3.5 shrink-0' />
                                {label}
                            </Link>
                        )
                    })}
                    <div className='w-px bg-border/50 my-1 mx-0.5 shrink-0' />
                    <form action={logoutAction} className='flex shrink-0'>
                        <button
                            type='submit'
                            className={
                                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ' +
                                'transition-all text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 cursor-pointer'
                            }
                        >
                            <LogOut className='h-3.5 w-3.5 shrink-0' />
                            Sign out
                        </button>
                    </form>
                </div>
            </nav>

            {/* Desktop */}
            <aside
                className='hidden sm:flex flex-col w-52 shrink-0 sticky overflow-y-auto noscroll'
                style={{
                    top: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
                    height: 'calc(100vh - 3.5rem - env(safe-area-inset-top, 0px) - 1.25rem)',
                }}
            >
                <nav className='relative flex flex-col gap-0.5'>
                    {activeIndex >= 0 && (
                        <span
                            aria-hidden
                            className='absolute left-0 right-0 h-10 rounded-xl bg-ambient/8 border border-ambient/15 transition-transform duration-300 ease-spring'
                            style={{ transform: `translateY(${activeIndex * ITEM_STRIDE}px)` }}
                        />
                    )}
                    {navItems.map(({ href, icon: Icon, label }, i) => {
                        const active = i === activeIndex
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative z-10 flex items-center gap-2.5 px-3 h-10 rounded-xl text-sm transition-colors ${
                                    active
                                        ? 'text-foreground font-medium'
                                        : 'text-muted-foreground/55 hover:text-foreground'
                                }`}
                            >
                                <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${active ? 'text-ambient' : ''}`} />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sign out */}
                <div className='mt-auto pt-3 mb-4 border-t border-border/40'>
                    <form action={logoutAction}>
                        <button
                            type='submit'
                            className={
                                'flex w-full items-center gap-2.5 px-3 h-10 rounded-xl text-sm transition-colors cursor-pointer ' +
                                'text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8'
                            }
                        >
                            <LogOut className='h-3.5 w-3.5 shrink-0' />
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}
