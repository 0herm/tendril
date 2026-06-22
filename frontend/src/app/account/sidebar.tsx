'use client'

import { Bell, BarChart2, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/account', icon: LayoutDashboard, label: 'Overview', exact: true },
    { href: '/account/stats', icon: BarChart2, label: 'Stats', exact: false },
    { href: '/account/settings', icon: Settings, label: 'Settings', exact: false },
    { href: '/account/notifications', icon: Bell, label: 'Notifications', exact: false },
]

export default function AccountSidebar({ logoutAction }: { logoutAction: () => Promise<void> }) {
    const pathname = usePathname()

    return (
        <>
            <nav className='sm:hidden -mx-4 bg-background border-b border-border/60'>
                <div className='flex overflow-x-auto noscroll px-3 py-1.5 gap-1'>
                    {navItems.map(({ href, icon: Icon, label, exact }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                                    active ? 'bg-brand/10 text-brand' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}
                            >
                                <Icon className='h-3.5 w-3.5 shrink-0' />
                                {label}
                            </Link>
                        )
                    })}

                    <div className='w-px bg-border/60 my-1 mx-0.5 shrink-0' />

                    <form action={logoutAction} className='flex shrink-0'>
                        <button
                            type='submit'
                            className={
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ' +
                                'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                            }
                        >
                            <LogOut className='h-3.5 w-3.5 shrink-0' />
                            Sign out
                        </button>
                    </form>
                </div>
            </nav>

            <aside className='hidden sm:flex flex-col w-44 shrink-0'>
                <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 pb-2 pt-0.5'>
                    Account
                </p>
                <nav className='flex flex-col gap-0.5'>
                    {navItems.map(({ href, icon: Icon, label, exact }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all overflow-hidden ${
                                    active
                                        ? 'bg-brand-subtle text-foreground font-medium'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}
                            >
                                {active && (
                                    <span className='absolute left-0 inset-y-1 w-[3px] bg-brand rounded-r-full' />
                                )}
                                <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${active ? 'text-brand' : ''}`} />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                <div className='mt-auto pt-4 border-t border-border/60'>
                    <form action={logoutAction}>
                        <button
                            type='submit'
                            className={
                                'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ' +
                                'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
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
