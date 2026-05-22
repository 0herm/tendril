'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/ui/dialog'
import { addWatched, getWatchedById, removeWatched, removeMedia, updateWatchedSeasons, updateShowStatus, updateTotalSeasons, getAllLists } from '@/utils/clientApi'
import { useEffect, useState } from 'react'

type SeasonEntry = { season: number; episodeCount: number }

type ListToolProps = {
    tmdbID: number
    mediaType: MediaType
    media: MovieDetailsProps | ShowDetailsProps
}

export default function WatchedTool({ tmdbID, mediaType, media }: ListToolProps) {
    const [seen, setSeen] = useState<WatchedProps | null>(null)
    const [watchedEntries, setWatchedEntries] = useState<SeasonEntry[]>([])
    const [initialEntries, setInitialEntries] = useState<SeasonEntry[]>([])
    const [listId, setListId] = useState<number | undefined>(undefined)

    useEffect(() => {
        getAllLists().then(({ data }) => setListId(data?.[0]?.id))
    }, [])

    const title = mediaType === 'movie' ? (media as MovieDetailsProps).title : (media as ShowDetailsProps).name
    const totalSeasons = mediaType === 'show' ? (media as ShowDetailsProps).number_of_seasons : undefined
    const showStatus = mediaType === 'show' ? (media as ShowDetailsProps).status : undefined
    const showSeasons = mediaType === 'show' ? (media as ShowDetailsProps).seasons : []

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await getWatchedById(tmdbID)
            if (error) console.error(error)
            setSeen(data ?? null)
            const entries = (data?.watched_seasons ?? []).map((season, i) => ({
                season,
                episodeCount: data?.episode_counts?.[i] ?? 0,
            }))
            setWatchedEntries(entries)
            setInitialEntries(entries)
        }
        fetchData()
    }, [tmdbID])

    useEffect(() => {
        if (mediaType === 'show' && seen) {
            const syncShowState = async () => {
                if (totalSeasons !== seen.total_seasons) {
                    const { error } = await updateTotalSeasons(tmdbID, totalSeasons || 0)
                    if (error) console.error(error)
                }
                if (showStatus !== seen.show_status) {
                    const { error } = await updateShowStatus(tmdbID, showStatus || '')
                    if (error) console.error(error)
                }
            }
            void syncShowState()
        }
    }, [totalSeasons, showStatus, seen, mediaType, tmdbID])

    async function handleToggleMovie() {
        if (seen) {
            const { data, error } = await removeWatched(tmdbID)
            if (error) { console.error(error); return }
            if (data) setSeen(null)
        } else {
            const { data, error } = await addWatched(tmdbID, mediaType, title, totalSeasons, showStatus)
            if (error) { console.error(error); return }
            if (data) {
                setSeen(data)
                if (listId) await removeMedia(tmdbID, listId)
            }
        }
    }

    function airedEpisodeCount(seasonNum: number): number {
        const seasonData = showSeasons?.find((s) => s.season_number === seasonNum)
        const lastEp = mediaType === 'show' ? (media as ShowDetailsProps).last_episode_to_air : null
        if (lastEp && lastEp.season_number === seasonNum) return lastEp.episode_number
        return seasonData?.episode_count ?? 0
    }

    function handleSeasonToggle(season: number) {
        setWatchedEntries((prev) => {
            if (prev.some((e) => e.season === season)) {
                return prev.filter((e) => e.season !== season)
            }
            return [...prev, { season, episodeCount: airedEpisodeCount(season) }]
        })
    }

    async function updateShowWatched() {
        const watchedSeasons = watchedEntries.map((e) => e.season)
        const episodeCounts = watchedEntries.map((e) => e.episodeCount)
        const seasonsChanged =
            JSON.stringify([...watchedSeasons].sort((a, b) => a - b)) !==
            JSON.stringify(initialEntries.map((e) => e.season).sort((a, b) => a - b))

        if (watchedSeasons.length < 1 && seen) {
            const { data, error } = await removeWatched(tmdbID)
            if (error) { console.error(error); return }
            if (data) { setSeen(null); setWatchedEntries([]); setInitialEntries([]) }
        } else if (watchedSeasons.length > 0) {
            if (seen) {
                const { data, error } = await updateWatchedSeasons(
                    tmdbID, watchedSeasons, seasonsChanged ? episodeCounts : undefined
                )
                if (error) { console.error(error); return }
                if (data) {
                    setSeen({ ...seen, watched_seasons: watchedSeasons, episode_counts: seasonsChanged ? episodeCounts : seen.episode_counts })
                    if (seasonsChanged) setInitialEntries(watchedEntries)
                }
            } else {
                const { data, error } = await addWatched(tmdbID, 'show', title, totalSeasons, showStatus, watchedSeasons, episodeCounts)
                if (error) { console.error(error); return }
                if (data) {
                    setSeen(data)
                    setInitialEntries(watchedEntries)
                    if (listId) await removeMedia(tmdbID, listId)
                }
            }
        }
    }

    const allWatched = mediaType === 'show' && !!totalSeasons && watchedEntries.length === totalSeasons

    return mediaType === 'movie' ? (
        <Button variant='secondary' size='icon' className='size-10' onClick={handleToggleMovie}>
            {seen ? <Eye className='size-5' /> : <EyeOff className='size-5' />}
        </Button>
    ) : (
        <Dialog onOpenChange={(open) => { if (!open) updateShowWatched() }}>
            <DialogTrigger asChild>
                <Button variant='secondary' size='icon' className='size-10'>
                    {allWatched ? <Eye className='size-5' /> : <EyeOff className='size-5' />}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Watched Seasons</DialogTitle>
                    <DialogDescription>Select the seasons you have watched.</DialogDescription>
                </DialogHeader>
                <div className='px-5 pt-4 grid grid-cols-2 xs:grid-cols-3 gap-2 max-h-64 overflow-y-auto'>
                    {Array.from({ length: totalSeasons || 0 }, (_, i) => i + 1).map((season) => (
                        <Button
                            key={season}
                            variant={watchedEntries.some((e) => e.season === season) ? 'default' : 'secondary'}
                            onClick={() => handleSeasonToggle(season)}
                        >
                            Season {season}
                        </Button>
                    ))}
                </div>
                <div className='px-5 py-4 flex gap-2 border-t border-border mt-2'>
                    <Button
                        variant='outline'
                        className='flex-1'
                        onClick={() => setWatchedEntries(
                            Array.from({ length: totalSeasons || 0 }, (_, i) => ({
                                season: i + 1,
                                episodeCount: airedEpisodeCount(i + 1),
                            }))
                        )}
                    >
                        All Seasons
                    </Button>
                    <Button
                        variant='destructive'
                        className='flex-1'
                        onClick={() => setWatchedEntries([])}
                    >
                        Clear All
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
