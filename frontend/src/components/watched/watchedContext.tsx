'use client'

import { addWatched, getWatchedById, removeWatched, removeMedia, updateWatched } from '@/utils/queries'
import { useMediaState } from '@/components/watched/mediaStateContext'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type WatchedContextValue = {
    watched: WatchedProps | null
    watchedLoading: boolean
    seasons: Season[]
    lastWatchedSeason: number
    allWatched: boolean
    airedEpisodeCount: (seasonNumber: number) => number
    watchedUpTo: (seasonNumber: number) => number
    isSeasonWatched: (seasonNumber: number) => boolean
    toggleSeason: (seasonNumber: number) => void
    setAllSeasons: () => void
    clearAll: () => void
    setWatchedUpTo: (seasonNumber: number, episodeNumber: number) => void
}

const WatchedContext = createContext<WatchedContextValue | null>(null)

export function useWatched() {
    return useContext(WatchedContext)
}

type WatchedProviderProps = {
    show: ShowDetailsProps
    seasons?: Season[]
    children: ReactNode
}

export function WatchedProvider({ show, seasons: seasonsProp, children }: WatchedProviderProps) {
    const tmdbID = show.id
    const title = show.name
    const totalSeasons = show.number_of_seasons
    const showStatus = show.status
    const seasons = useMemo(
        () => seasonsProp ?? show.seasons.filter((s) => s.season_number > 0),
        [seasonsProp, show.seasons]
    )

    const ms = useMediaState()
    const [watched, setWatched] = useState<WatchedProps | null>(null)
    const [watchedLoading, setWatchedLoading] = useState(true)

    useEffect(() => {
        setWatchedLoading(true)
        getWatchedById(tmdbID).then(({ data, error }) => {
            if (error) console.error(error)
            setWatched(data ?? null)
            setWatchedLoading(false)
        })
    }, [tmdbID])

    useEffect(() => {
        if (!watched) return
        if (totalSeasons === watched.total_seasons && showStatus === watched.show_status) return
        const syncShowState = async () => {
            const { error } = await updateWatched(tmdbID, { totalSeasons: totalSeasons || 0, showStatus: showStatus || '' })
            if (error) { console.error(error); return }
            setWatched((prev) => (prev ? { ...prev, total_seasons: totalSeasons, show_status: showStatus } : prev))
        }
        void syncShowState()
    }, [watched?.id, totalSeasons, showStatus, tmdbID])

    const airedEpisodeCount = useCallback((seasonNumber: number): number => {
        const seasonData = seasons.find((s) => s.season_number === seasonNumber)
        const lastEp = show.last_episode_to_air
        if (lastEp && lastEp.season_number === seasonNumber) return lastEp.episode_number
        return seasonData?.episode_count ?? 0
    }, [seasons, show.last_episode_to_air])

    function watchedUpTo(seasonNumber: number): number {
        const idx = watched?.watched_seasons?.indexOf(seasonNumber) ?? -1
        if (idx === -1) return 0
        return watched?.episode_counts?.[idx] ?? 0
    }

    function isSeasonWatched(seasonNumber: number): boolean {
        return watched?.watched_seasons?.includes(seasonNumber) ?? false
    }

    const allWatched = seasons.length > 0 && seasons.every((s) => isSeasonWatched(s.season_number))

    const lastWatchedSeason = (watched?.watched_seasons ?? [])
        .filter((s) => seasons.some((x) => x.season_number === s))
        .reduce((max, s) => Math.max(max, s), 0)

    const currentEntries = useMemo(() =>
        (watched?.watched_seasons ?? [])
            .map((season, i) => ({ season, count: (watched?.episode_counts ?? [])[i] ?? 0 }))
            .filter((e) => seasons.some((x) => x.season_number === e.season)),
    [watched, seasons]
    )

    async function commit(entries: { season: number; count: number }[]) {
        const sorted = [...entries].sort((a, b) => a.season - b.season)
        const nextSeasons = sorted.map((e) => e.season)
        const nextCounts = sorted.map((e) => e.count)
        const prev = watched

        if (nextSeasons.length === 0) {
            if (!watched) return
            setWatched(null)
            const { error } = await removeWatched(tmdbID)
            if (error) { console.error(error); setWatched(prev) }
            return
        }

        if (watched) {
            setWatched({ ...watched, watched_seasons: nextSeasons, episode_counts: nextCounts })
            const { error } = await updateWatched(tmdbID, { watchedSeasons: nextSeasons, episodeCounts: nextCounts })
            if (error) { console.error(error); setWatched(prev) }
        } else {
            setWatched({
                id: 0, tmdb_id: tmdbID, type: 'show', added_at: '',
                name: title, watched_seasons: nextSeasons, total_seasons: totalSeasons,
                show_status: showStatus, episode_counts: nextCounts,
            })
            const { data, error } = await addWatched(tmdbID, 'show', title, totalSeasons, showStatus, nextSeasons, nextCounts)
            if (error) { console.error(error); setWatched(prev); return }
            if (data) {
                setWatched(data)
                if (ms?.listId) await removeMedia(tmdbID, ms.listId)
            }
        }
    }

    function toggleSeason(seasonNumber: number) {
        const entries = currentEntries
        if (entries.some((e) => e.season === seasonNumber)) {
            commit(entries.filter((e) => e.season !== seasonNumber))
        } else {
            commit([...entries, { season: seasonNumber, count: airedEpisodeCount(seasonNumber) }])
        }
    }

    function setAllSeasons() {
        commit(seasons.map((s) => ({ season: s.season_number, count: airedEpisodeCount(s.season_number) })))
    }

    function clearAll() {
        commit([])
    }

    function setWatchedUpTo(seasonNumber: number, episodeNumber: number) {
        const entries = currentEntries
        const idx = entries.findIndex((e) => e.season === seasonNumber)
        if (episodeNumber <= 0) {
            if (idx === -1) return
            commit(entries.filter((e) => e.season !== seasonNumber))
        } else if (idx === -1) {
            commit([...entries, { season: seasonNumber, count: episodeNumber }])
        } else {
            const next = [...entries]
            next[idx] = { season: seasonNumber, count: episodeNumber }
            commit(next)
        }
    }

    return (
        <WatchedContext.Provider
            value={{
                watched,
                watchedLoading,
                seasons,
                lastWatchedSeason,
                allWatched,
                airedEpisodeCount,
                watchedUpTo,
                isSeasonWatched,
                toggleSeason,
                setAllSeasons,
                clearAll,
                setWatchedUpTo,
            }}
        >
            {children}
        </WatchedContext.Provider>
    )
}
