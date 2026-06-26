'use client'

import { Bell, BarChart2, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/account',               icon: LayoutDashboard, label: 'Overview',      exact: true },
    { href: '/account/stats',         icon: BarChart2,       label: 'Stats',         exact: false },
    { href: '/account/settings',      icon: Settings,        label: 'Settings',      exact: false },
    { href: '/account/notifications', icon: Bell,            label: 'Notifications', exact: false },
]

export default function AccountSidebar({ logoutAction }: { logoutAction: () => Promise<void> }) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile — horizontal scroll tab bar */}
            <nav className='sm:hidden -mx-5 border-b border-border/40 bg-background'>
                <div className='flex overflow-x-auto noscroll px-3 py-1.5 gap-1'>
                    {navItems.map(({ href, icon: Icon, label, exact }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                                    active ? 'bg-brand/8 text-brand' : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5'
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
                            className='flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8'
                        >
                            <LogOut className='h-3.5 w-3.5 shrink-0' />
                            Sign out
                        </button>
                    </form>
                </div>
            </nav>

            {/* Desktop — sticky sidebar */}
            <aside
                className='hidden sm:flex flex-col w-52 shrink-0 sticky overflow-y-auto noscroll'
                style={{
                    top: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
                    height: 'calc(100vh - 3.5rem - env(safe-area-inset-top, 0px) - 1.25rem)',
                }}
            >
                {/* Nav */}
                <nav className='flex flex-col gap-0.5 rounded-2xl bg-card border border-border/50 p-1.5'>
                    {navItems.map(({ href, icon: Icon, label, exact }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all overflow-hidden ${
                                    active
                                        ? 'bg-white/8 text-foreground font-medium'
                                        : 'text-muted-foreground/55 hover:text-foreground hover:bg-white/5'
                                }`}
                            >
                                {active && (
                                    <span className='absolute left-0 inset-y-2 w-[2.5px] bg-brand rounded-r-full' />
                                )}
                                <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${active ? 'text-brand' : ''}`} />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sign out */}
                <div className='mt-auto pt-3'>
                    <form action={logoutAction} className='rounded-2xl bg-card border border-border/50 p-1.5'>
                        <button
                            type='submit'
                            className='flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8'
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
