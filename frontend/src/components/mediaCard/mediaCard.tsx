'use client'

import Image from 'next/image'
import config from '@config'
import Link from 'next/link'
import { Image as ImageIcon, Star, Bookmark, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { addMedia, removeMedia, checkMediaInList, addWatched, removeWatched, getWatchedById, getShowDetails, getAllLists } from '@/utils/api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog'
import { WatchedProvider } from '@components/watched/watchedContext'
import { WatchedSeasonsBody, WatchedSeasonsSkeleton } from '@components/watched/watchedSeasonsDialog'

interface MediaCardProps {
    item: MediaItemProps
    type?: MediaType
}

export default function MediaCard({ item, type }: MediaCardProps) {
    const mediaType: MediaType = type ?? (item.media_type === 'tv' ? 'show' : 'movie')
    const [listId, setListId] = useState<number | undefined>(undefined)

    const title = ('title' in item ? item.title : null) ?? ('name' in item ? item.name : null) ?? ''

    const dates = item as { release_date?: string; first_air_date?: string }
    const year = (dates.release_date ?? dates.first_air_date ?? '').split('-')[0]

    const rating = item.vote_average && item.vote_average > 0 ? item.vote_average.toFixed(1) : null

    const [inList, setInList] = useState(false)
    const [watched, setWatched] = useState(false)
    const [showDetails, setShowDetails] = useState<ShowDetailsProps | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        getAllLists().then(({ data }) => setListId(data?.[0]?.id))
    }, [])

    useEffect(() => {
        if (listId) checkMediaInList(item.id, listId).then(({ data }) => setInList(data ?? false))
        getWatchedById(item.id).then(({ data }) => setWatched(!!data))
    }, [item.id, listId])

    async function handleSave() {
        if (!listId) return
        if (inList) {
            const { data, error } = await removeMedia(item.id, listId)
            if (error) { console.error(error); return }
            if (data) setInList(false)
        } else {
            const { data, error } = await addMedia(item.id, mediaType, listId)
            if (error) { console.error(error); return }
            if (data) setInList(true)
        }
    }

    async function handleWatchedMovie() {
        if (watched) {
            const { data, error } = await removeWatched(item.id)
            if (error) { console.error(error); return }
            if (data) setWatched(false)
        } else {
            const { data, error } = await addWatched(item.id, mediaType, title)
            if (error) { console.error(error); return }
            if (data) {
                setWatched(true)
                if (inList && listId) { await removeMedia(item.id, listId); setInList(false) }
            }
        }
    }

    // Prefetch the full show (seasons + last_episode_to_air) so the watched dialog opens instantly.
    function loadShowDetails() {
        if (mediaType !== 'show' || showDetails) return
        const existing = item as Partial<ShowDetailsProps>
        if (existing.seasons && existing.number_of_seasons != null) {
            setShowDetails(existing as ShowDetailsProps)
            return
        }
        getShowDetails(item.id).then((data) => { if (data) setShowDetails(data) })
    }

    const watchedBtn = (isWatched: boolean, onClick?: () => void) => (
        <button
            onClick={onClick}
            className={'flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs ' +
                `font-medium transition-colors ${isWatched ? 'bg-brand/80 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        >
            {isWatched ? <Eye className='h-3.5 w-3.5' /> : <EyeOff className='h-3.5 w-3.5' />}
            Watched
        </button>
    )

    return (
        <div className='group relative w-full' onPointerEnter={loadShowDetails} onFocus={loadShowDetails}>
            <Link href={`/${mediaType}/${item.id}`}>
                <div className='relative aspect-2/3 w-full overflow-hidden rounded-xl shadow-md ring-1 ring-border/40'>
                    {item.poster_path ? (
                        <Image
                            src={`${config.url.IMAGE_URL}${item.poster_path}`}
                            alt={title || 'poster'}
                            fill
                            className='object-cover transition-transform duration-300 group-hover:scale-105'
                            sizes='(max-width: 640px) 45vw, (max-width: 1024px) 20vw, 11rem'
                        />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center bg-muted'>
                            <ImageIcon className='h-8 w-8 text-muted-foreground' />
                        </div>
                    )}
                    {rating && (
                        <div className='absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 z-10'>
                            <Star className='h-2.5 w-2.5 fill-yellow-400 stroke-none' />
                            <span className='text-[10px] font-semibold text-white leading-none'>{rating}</span>
                        </div>
                    )}
                    <div className={
                        'absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent ' +
                        'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                    } />
                    <div className='absolute bottom-10 left-0 right-0 px-2 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300'>
                        {title && <p className='text-white text-xs font-semibold line-clamp-2 leading-tight'>{title}</p>}
                        {year && <p className='text-white/60 text-[10px] mt-0.5'>{year}</p>}
                    </div>
                </div>
            </Link>

            <div className='absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10'>
                <div className='flex rounded-lg overflow-hidden bg-black/65 backdrop-blur-sm border border-white/10'>
                    <button
                        onClick={handleSave}
                        className={'flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs ' +
                            `font-medium transition-colors ${inList ? 'bg-foreground/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    >
                        <Bookmark className={`h-3.5 w-3.5${inList ? ' fill-current' : ''}`} />
                        Save
                    </button>
                    <div className='w-px bg-white/10' />
                    {mediaType === 'show' ? (
                        <Dialog open={dialogOpen} onOpenChange={(open) => { if (open) loadShowDetails(); setDialogOpen(open) }}>
                            <DialogTrigger asChild>{watchedBtn(watched)}</DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Watched Seasons</DialogTitle>
                                    <DialogDescription>Select the seasons you have watched.</DialogDescription>
                                </DialogHeader>
                                {showDetails ? (
                                    <WatchedProvider show={showDetails}>
                                        <WatchedSeasonsBody />
                                    </WatchedProvider>
                                ) : (
                                    <WatchedSeasonsSkeleton />
                                )}
                            </DialogContent>
                        </Dialog>
                    ) : (
                        watchedBtn(watched, handleWatchedMovie)
                    )}
                </div>
            </div>
        </div>
    )
}
