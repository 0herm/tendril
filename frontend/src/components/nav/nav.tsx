'use client'

import { Bell, Clapperboard, Compass, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

export default function NavBar() {
    const desktopInputRef = useRef<HTMLInputElement>(null)
    const mobileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

    const handleSearch = (value?: string) => {
        const query = value?.trim()
        if (!query) return
        router.push(`/search/${encodeURIComponent(query)}`)
        setMobileSearchOpen(false)
        if (desktopInputRef.current) desktopInputRef.current.value = ''
        if (mobileInputRef.current) mobileInputRef.current.value = ''
    }

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                desktopInputRef.current?.focus()
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <div className='relative flex flex-col w-full h-full'>
            <div className='flex flex-row justify-between items-center w-full h-full px-5'>
                <Link href='/' className='flex items-center gap-2.5 h-full shrink-0'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-xl bg-brand/12 shrink-0'>
                        <Clapperboard className='h-3.5 w-3.5 text-brand' />
                    </div>
                    <span className='font-bold text-sm tracking-tight hidden xs:block'>
                        Tendril
                    </span>
                </Link>

                <div className='flex items-center gap-2'>
                    <div className='relative hidden sm:flex items-center'>
                        <Search className='absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10' />
                        <Input
                            className='w-64 h-9 pl-9 pr-16 text-sm rounded-xl bg-white/5 border-white/8 focus:border-white/20 focus:bg-white/8 transition-colors'
                            placeholder='Search movies & shows'
                            ref={desktopInputRef}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch(desktopInputRef.current?.value)
                            }}
                        />
                        <div className='absolute right-2.5 flex items-center pointer-events-none select-none'>
                            <kbd className='inline-flex items-center px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-muted-foreground/50 font-mono font-medium'>
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    <Link
                        href='/discover'
                        className='hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-transparent hover:bg-white/8 text-muted-foreground hover:text-foreground transition-all'
                        aria-label='Discover'
                    >
                        <Compass className='h-3.5 w-3.5' />
                    </Link>

                    <Link
                        href='/account/notifications'
                        className='hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-transparent hover:bg-white/8 text-muted-foreground hover:text-foreground transition-all'
                        aria-label='Notifications'
                    >
                        <Bell className='h-3.5 w-3.5' />
                    </Link>

                    <Link
                        href='/account'
                        className='hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-transparent hover:bg-white/8 text-muted-foreground hover:text-foreground transition-all'
                        aria-label='Account'
                    >
                        <User className='h-3.5 w-3.5' />
                    </Link>

                    <Button
                        variant='ghost'
                        size='icon'
                        className='sm:hidden h-9 w-9 rounded-xl'
                        onClick={() => {
                            setMobileSearchOpen((o) => !o)
                            setTimeout(() => mobileInputRef.current?.focus(), 50)
                        }}
                        aria-label='Search'
                    >
                        <Search className='w-4 h-4' />
                    </Button>
                </div>
            </div>

            {mobileSearchOpen && (
                <div className='absolute top-full left-0 right-0 border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 py-2.5 sm:hidden z-50'>
                    <div className='relative flex items-center'>
                        <Search className='absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none' />
                        <Input
                            ref={mobileInputRef}
                            className='w-full h-11 pl-10 pr-24 text-base rounded-xl bg-white/5 border-white/8'
                            placeholder='Search movies or shows...'
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch(mobileInputRef.current?.value)
                                if (e.key === 'Escape') setMobileSearchOpen(false)
                            }}
                        />
                        <Button
                            className='absolute right-1.5 h-8 px-3 text-xs rounded-lg'
                            onClick={() => handleSearch(mobileInputRef.current?.value)}
                        >
                            Search
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
