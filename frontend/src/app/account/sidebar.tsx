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
            <aside className='hidden sm:flex flex-col w-44 shrink-0'>
                <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 pb-2 pt-0.5'>
                    Account
                </p>
                <div className='flex flex-col gap-0.5'>
                    {navItems.map(({ href, icon: Icon, label, exact }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors overflow-hidden ${
                                    active
                                        ? 'bg-brand-subtle text-foreground font-medium'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                }`}
                            >
                                {active && (
                                    <span className='absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-0.5 bg-brand rounded-r-full' />
                                )}
                                <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-brand' : ''}`} />
                                {label}
                            </Link>
                        )
                    })}
                </div>

                <div className='mt-auto pt-3 border-t border-border'>
                    <form action={logoutAction}>
                        <button
                            type='submit'
                            className='flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors'
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
