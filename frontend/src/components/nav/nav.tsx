'use client'

import { Bell, Clapperboard, Compass, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import SearchPalette from '@/components/nav/searchPalette'

const iconLinkClasses =
    'hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-transparent hover:bg-white/8 ' +
    'text-muted-foreground [[data-transparent]_&]:text-white/75 hover:text-foreground transition-all'

export default function NavBar() {
    const [paletteOpen, setPaletteOpen] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setPaletteOpen(true)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <div className='relative flex flex-col w-full h-full'>
            <div className='flex flex-row justify-between items-center w-full h-full px-5 sm:px-6'>
                <Link href='/' className='flex items-center gap-2 h-full shrink-0'>
                    <Clapperboard className='h-4.5 w-4.5 text-brand' />
                    <span className='display font-bold text-[15px] hidden xs:block'>
                        Tendril
                    </span>
                </Link>

                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => setPaletteOpen(true)}
                        className={
                            'hidden sm:flex items-center gap-2.5 w-64 h-9 pl-3 pr-2 rounded-xl cursor-pointer ' +
                            'bg-white/5 border border-white/8 hover:border-white/16 hover:bg-white/8 transition-colors'
                        }
                        aria-label='Search'
                    >
                        <Search className='h-3.5 w-3.5 text-muted-foreground [[data-transparent]_*]:text-white/75 shrink-0' />
                        <span className='flex-1 text-left text-sm text-muted-foreground/60 [[data-transparent]_&]:text-white/50'>Search…</span>
                        <kbd
                            className={
                                'inline-flex items-center px-1.5 py-0.5 bg-white/5 border border-white/10 ' +
                                'rounded-md text-[10px] text-muted-foreground/50 [[data-transparent]_&]:text-white/40 font-mono font-medium'
                            }
                        >
                            ⌘K
                        </kbd>
                    </button>

                    <Link href='/discover' className={iconLinkClasses} aria-label='Discover'>
                        <Compass className='h-3.5 w-3.5' />
                    </Link>

                    <Link href='/account/notifications' className={iconLinkClasses} aria-label='Notifications'>
                        <Bell className='h-3.5 w-3.5' />
                    </Link>

                    <Link href='/account' className={iconLinkClasses} aria-label='Account'>
                        <User className='h-3.5 w-3.5' />
                    </Link>

                    <button
                        onClick={() => setPaletteOpen(true)}
                        className={
                            'sm:hidden flex items-center justify-center h-9 w-9 rounded-xl cursor-pointer ' +
                            'text-muted-foreground [[data-transparent]_&]:text-white/75 hover:text-foreground hover:bg-white/8 transition-colors'
                        }
                        aria-label='Search'
                    >
                        <Search className='w-4 h-4' />
                    </button>
                </div>
            </div>

            <SearchPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </div>
    )
}
