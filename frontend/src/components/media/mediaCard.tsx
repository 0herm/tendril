'use client'

import Image from 'next/image'
import config from '@config'
import Link from 'next/link'
import { Image as ImageIcon, Star, Bookmark, Eye, EyeOff } from 'lucide-react'
import { useRef, useState, useLayoutEffect } from 'react'
import { addMedia, removeMedia, addWatched, removeWatched, getShowDetails } from '@/utils/queries'
import { useMediaState } from '@/components/watched/mediaStateContext'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog'
import { Badge } from '@/ui/badge'
import { WatchedProvider } from '@/components/watched/watchedContext'
import { WatchedSeasonsBody, WatchedSeasonsSkeleton } from '@/components/watched/watchedSeasonsDialog'
import { armSharedElement, rememberOrigin } from '@/utils/viewTransition'

function armPoster(el: HTMLElement) {
    document.querySelectorAll<HTMLElement>('.vt-poster-hero').forEach((hero) => {
        if (hero !== el) hero.style.viewTransitionName = 'none'
    })
    armSharedElement('active-poster', el)
}

interface MediaCardProps {
    item: MediaItemProps
    type?: MediaType
    progress?: number
}

export default function MediaCard({ item, type, progress }: MediaCardProps) {
    const ms = useMediaState()
    const mediaType: MediaType = type ?? (item.media_type === 'tv' ? 'show' : 'movie')
    const listId = ms?.listId

    const streamingProviders = ms?.streamingProviders ?? []
    const region = ms?.region ?? 'GB'
    const flatrate = ('watch/providers' in item)
        ? ((item['watch/providers'] as WatchProviders)?.results?.[region]?.flatrate ?? [])
        : []
    const matchedProviders = streamingProviders.length > 0
        ? flatrate.filter(p => streamingProviders.includes(p.provider_id))
        : []

    const title = ('title' in item ? item.title : null) ?? ('name' in item ? item.name : null) ?? ''

    const dates = item as { release_date?: string; first_air_date?: string }
    const year = (dates.release_date ?? dates.first_air_date ?? '').split('-')[0]

    const rating = item.vote_average && item.vote_average > 0 ? item.vote_average.toFixed(1) : null

    const [inList, setInList] = useState(() => ms?.isListed(item.id) ?? false)
    const [watched, setWatched] = useState(() => ms?.isWatched(item.id) ?? false)
    const [showDetails, setShowDetails] = useState<ShowDetailsProps | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const posterRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const key = sessionStorage.getItem('vt-poster-id')
        if (!key || !posterRef.current) return
        const [id, index] = key.split(':')
        if (id !== String(item.id)) return
        const nodes = document.querySelectorAll(`[data-vt-id="${id}"]`)
        if (nodes[Number(index)] !== posterRef.current) return
        armPoster(posterRef.current)
        sessionStorage.removeItem('vt-poster-id')
    }, [item.id])

    function armTransition() {
        if (!posterRef.current) return
        armPoster(posterRef.current)
        const nodes = document.querySelectorAll(`[data-vt-id="${item.id}"]`)
        const index = Array.prototype.indexOf.call(nodes, posterRef.current)
        rememberOrigin('poster', `${item.id}:${index}`)
    }

    async function handleSave() {
        if (!listId) return
        if (inList) {
            const { data, error } = await removeMedia(item.id, listId)
            if (error) { console.error(error); return }
            if (data) { setInList(false); ms?.setListed(item.id, false) }
        } else {
            const { data, error } = await addMedia(item.id, mediaType, listId)
            if (error) { console.error(error); return }
            if (data) { setInList(true); ms?.setListed(item.id, true) }
        }
    }

    async function handleWatchedMovie() {
        if (watched) {
            const { data, error } = await removeWatched(item.id)
            if (error) { console.error(error); return }
            if (data) { setWatched(false); ms?.setWatched(item.id, false) }
        } else {
            const { data, error } = await addWatched(item.id, mediaType, title)
            if (error) { console.error(error); return }
            if (data) {
                setWatched(true)
                ms?.setWatched(item.id, true)
                if (inList && listId) {
                    const { error: removeErr } = await removeMedia(item.id, listId)
                    if (removeErr) console.error(removeErr)
                    else { setInList(false); ms?.setListed(item.id, false) }
                }
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
                `font-medium transition-colors ${isWatched ? 'bg-brand/40 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        >
            {isWatched ? <Eye className='h-3.5 w-3.5' /> : <EyeOff className='h-3.5 w-3.5' />}
            Watched
        </button>
    )

    return (
        <div className='group relative w-full' onMouseEnter={loadShowDetails} onFocus={loadShowDetails}>
            <Link href={`/${mediaType}/${item.id}`} onClick={armTransition}>
                <div
                    ref={posterRef}
                    data-vt-id={item.id}
                    className='relative aspect-2/3 w-full overflow-hidden rounded-xl shadow-poster ring-1 ring-white/8 transition-shadow duration-300 group-hover:ring-white/30'
                >
                    {item.poster_path ? (
                        <Image
                            src={`${config.url.IMAGE_URL}${item.poster_path}`}
                            alt={title || 'poster'}
                            fill
                            loading='eager'
                            className={'object-cover transition-transform duration-300 group-hover:scale-[1.04] ' +
                                'bg-muted flex items-center justify-center text-center text-xs text-muted-foreground'}
                            sizes='(max-width: 640px) 45vw, (max-width: 1024px) 20vw, 11rem'
                        />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center bg-muted'>
                            <ImageIcon className='h-8 w-8 text-muted-foreground' />
                        </div>
                    )}
                    {rating && (
                        <Badge variant='glass' className='absolute top-1.5 right-1.5 z-10'>
                            <Star className='h-2.5 w-2.5 fill-yellow-400 stroke-none' />
                            {rating}
                        </Badge>
                    )}
                    <div className='absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent pointer-events-none' />
                    {matchedProviders.length > 0 && (
                        <div className='absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-md px-1 py-1 z-10'>
                            {matchedProviders.slice(0, 2).map((p) => (
                                <img
                                    key={p.provider_id}
                                    src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                                    alt={p.provider_name}
                                    title={p.provider_name}
                                    className='h-[1.125rem] w-[1.125rem] rounded-[3px] object-cover'
                                />
                            ))}
                            {matchedProviders.length > 2 && (
                                <span className='text-[8px] font-bold text-white/80 leading-none px-0.5'>
                                    +{matchedProviders.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                    {progress != null && progress > 0 && (
                        <div className='absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 pointer-events-none'>
                            <div
                                className='h-full bg-ambient transition-[width] duration-500 rounded-r-full'
                                style={{ width: `${Math.round(progress * 100)}%` }}
                            />
                        </div>
                    )}
                    <div className={
                        'absolute inset-0 bg-linear-to-t from-black/90 via-black/40' +
                        ' to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none'
                    } />
                    <div
                        className={
                            'absolute bottom-10 left-0 right-0 px-2 translate-y-1 group-hover:translate-y-0 ' +
                            'opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-300'
                        }
                    >
                        {title && (
                            <p className='text-white text-xs font-semibold line-clamp-2 leading-tight [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]'>
                                {title}
                            </p>
                        )}
                        {year && <p className='text-white/70 text-[10px] mt-0.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]'>{year}</p>}
                    </div>
                </div>
            </Link>

            <div className='absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10'>
                <div className='flex rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/30'>
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
