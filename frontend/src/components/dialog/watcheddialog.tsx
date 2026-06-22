'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog'
import { addWatched, getWatchedById, removeWatched, removeMedia, getAllLists } from '@/utils/api'
import { useWatched } from '@components/watched/watchedContext'
import { WatchedSeasonsBody } from '@components/watched/watchedSeasonsDialog'
import { useEffect, useState } from 'react'

type ListToolProps = {
    tmdbID: number
    mediaType: MediaType
    media: MovieDetailsProps | ShowDetailsProps
}

export default function WatchedTool({ tmdbID, mediaType, media }: ListToolProps) {
    const ctx = useWatched()
    const [seen, setSeen] = useState<WatchedProps | null>(null)
    const [listId, setListId] = useState<number | undefined>(undefined)

    useEffect(() => {
        if (mediaType !== 'movie') return
        getAllLists().then(({ data }) => setListId(data?.[0]?.id))
    }, [mediaType])

    useEffect(() => {
        if (mediaType !== 'movie') return
        getWatchedById(tmdbID).then(({ data, error }) => {
            if (error) console.error(error)
            setSeen(data ?? null)
        })
    }, [mediaType, tmdbID])

    async function handleToggleMovie() {
        const title = (media as MovieDetailsProps).title
        if (seen) {
            const { data, error } = await removeWatched(tmdbID)
            if (error) { console.error(error); return }
            if (data) setSeen(null)
        } else {
            const { data, error } = await addWatched(tmdbID, mediaType, title)
            if (error) { console.error(error); return }
            if (data) {
                setSeen(data)
                if (listId) await removeMedia(tmdbID, listId)
            }
        }
    }

    if (mediaType === 'movie') {
        return (
            <Button variant='secondary' size='icon' className='size-10' onClick={handleToggleMovie}>
                {seen ? <Eye className='size-5' /> : <EyeOff className='size-5' />}
            </Button>
        )
    }

    if (!ctx) return null

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='secondary' size='icon' className='size-10'>
                    {ctx.allWatched ? <Eye className='size-5' /> : <EyeOff className='size-5' />}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Watched Seasons</DialogTitle>
                    <DialogDescription>Select the seasons you have watched.</DialogDescription>
                </DialogHeader>
                <WatchedSeasonsBody />
            </DialogContent>
        </Dialog>
    )
}
