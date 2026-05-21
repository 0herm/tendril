'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'

export default function SearchPage() {
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    function handleSearch() {
        const query = inputRef.current?.value.trim()
        if (!query) return
        router.push(`/search/${encodeURIComponent(query)}`)
    }

    return (
        <div className='w-full flex flex-col gap-6 pt-2'>
            <div className='relative flex items-center'>
                <Search className='absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none' />
                <Input
                    ref={inputRef}
                    className='h-12 pl-10 pr-24 text-base rounded-xl'
                    placeholder='Search movies and shows...'
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch()
                    }}
                />
                <Button
                    className='absolute right-1.5 h-9 px-4 rounded-lg'
                    onClick={handleSearch}
                >
                    Search
                </Button>
            </div>
        </div>
    )
}
