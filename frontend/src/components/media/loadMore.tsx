'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import MediaCard from '@/components/media/mediaCard'

type Props = {
    initialItems: MediaItemProps[]
    totalPages: number
    fetchMore: (page: number) => Promise<MediaItemProps[]>
}

export default function LoadMore({ initialItems, totalPages, fetchMore }: Props) {
    const [items, setItems] = useState(initialItems)
    const [page, setPage] = useState(1)
    const [isPending, startTransition] = useTransition()
    const sentinelRef = useRef<HTMLDivElement>(null)
    const pageRef = useRef(1)

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && pageRef.current < totalPages && !isPending) {
                const nextPage = pageRef.current + 1
                pageRef.current = nextPage
                setPage(nextPage)
                startTransition(async () => {
                    const newItems = await fetchMore(nextPage)
                    setItems(prev => [...prev, ...newItems])
                })
            }
        }, { rootMargin: '200px' })

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [totalPages, fetchMore, isPending])

    return (
        <>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3'>
                {items.map((item, index) => (
                    <MediaCard key={`${item.id}-${index}`} item={item} />
                ))}
            </div>
            {page < totalPages && (
                <div ref={sentinelRef} className='flex justify-center py-6'>
                    {isPending && <span className='text-sm text-muted-foreground'>Loading...</span>}
                </div>
            )}
        </>
    )
}
