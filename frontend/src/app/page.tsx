import MediaSection from '@/components/media/mediaSection'
import HeroCarousel from '@/components/media/heroCarousel'
import {
    getTrending, getTrendingDaily,
    getNewMovies, getNewShows,
    getPopularMovies, getPopularShows,
    getTopRatedMovies, getTopRatedShows,
    getUpcomingMovies, getUpcomingShows,
    getThisWeekMovies, getThisWeekShows,
    getDetailsShow, getDetailsMovie,
} from '@/utils/tmdbApi'
import { getFilteredContinueWatching } from '@/utils/continueWatching'
import { getAllWatched, getDefaultList, getMediaByListId, getUserSettings } from '@/utils/queries'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { MediaStateProvider } from '@/components/watched/mediaStateContext'

function SetupError({ reason }: { reason: string }) {
    return (
        <div className='w-full flex flex-col items-center justify-center gap-3 py-16 text-center'>
            <p className='text-sm font-medium'>Setup required</p>
            <p className='text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-1.5 max-w-sm'>{reason}</p>
            <p className='text-xs text-muted-foreground'>Set <code>TMDB_ACCESS_TOKEN</code> in your environment and restart.</p>
        </div>
    )
}

async function fetchDetail(item: { tmdb_id: number; type: 'movie' | 'show' }) {
    if (item.type === 'show') {
        const { data } = await getDetailsShow(item.tmdb_id)
        return data ? { ...data, media_type: 'tv' as const } : null
    }
    const { data } = await getDetailsMovie(item.tmdb_id)
    return data ? { ...data, media_type: 'movie' as const } : null
}

export default async function Home() {
    const userId = await getSessionUserId()
    if (!userId) redirect('/passkey/login')

    const hasToken = !!(process.env.TMDB_ACCESS_TOKEN || process.env.ACCESS_TOKEN)
    if (!hasToken) return <SetupError reason='TMDB API key is not configured.' />

    const [
        settingsResult,
        cwItems,
        watchlistResult,
        watchedResult,
        trendingDailyResult,
        trendingResult,
        newMoviesResult,
        newShowsResult,
        popularMoviesResult,
        popularShowsResult,
        topRatedMoviesResult,
        topRatedShowsResult,
        upcomingMoviesResult,
        upcomingShowsResult,
        thisWeekMoviesResult,
        thisWeekShowsResult,
    ] = await Promise.all([
        getUserSettings(userId),
        getFilteredContinueWatching(),
        (async () => {
            const { data: list } = await getDefaultList()
            if (!list?.id) return { listId: undefined as number | undefined, listedIds: [] as number[], details: [] as (ShowDetailsProps | MovieDetailsProps)[] }
            const { data: items } = await getMediaByListId(list.id)
            const listedIds = (items ?? []).map(i => i.tmdb_id)
            if (!listedIds.length) return { listId: list.id, listedIds, details: [] as (ShowDetailsProps | MovieDetailsProps)[] }
            const details = (await Promise.all((items ?? []).map(fetchDetail))).filter(Boolean) as (ShowDetailsProps | MovieDetailsProps)[]
            return { listId: list.id, listedIds, details }
        })(),
        getAllWatched(),
        getTrendingDaily(),
        getTrending(),
        getNewMovies(),
        getNewShows(),
        getPopularMovies(),
        getPopularShows(),
        getTopRatedMovies(),
        getTopRatedShows(),
        getUpcomingMovies(),
        getUpcomingShows(),
        getThisWeekMovies(),
        getThisWeekShows(),
    ])

    const results = [
        trendingDailyResult, trendingResult, newMoviesResult, newShowsResult,
        popularMoviesResult, popularShowsResult,
        topRatedMoviesResult, topRatedShowsResult,
        upcomingMoviesResult, upcomingShowsResult,
        thisWeekMoviesResult, thisWeekShowsResult,
    ]
    const hasContent = results.some((r) => (r.data as MediaListProps | null)?.results?.length)

    if (!hasContent) {
        const tmdbError = results.find((r) => r.error)?.error
        const isInvalidKey = tmdbError?.includes('Invalid API key')
        if (isInvalidKey) return <SetupError reason='Invalid TMDB API key. Check your TMDB_ACCESS_TOKEN.' />
        return (
            <div className='w-full flex flex-col items-center justify-center gap-2 py-16 text-center'>
                <p className='text-sm text-muted-foreground'>No content available.</p>
                {tmdbError && (
                    <p className='text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-1.5 max-w-sm'>{tmdbError}</p>
                )}
            </div>
        )
    }

    const progressMap = new Map<number, number>()
    for (const show of cwItems) {
        const watched = watchedResult.data?.find(w => w.tmdb_id === show.id)
        if (!watched) continue
        const today = new Date()
        const lastEp = show.last_episode_to_air
        const airedSeasons = show.seasons.filter(s =>
            s.season_number > 0 && s.episode_count > 0 &&
            !!s.air_date && new Date(s.air_date) <= today
        )
        let totalAired = 0
        for (const s of airedSeasons) {
            totalAired += lastEp?.season_number === s.season_number
                ? lastEp.episode_number
                : s.episode_count
        }
        if (!totalAired) continue
        let watchedEps = 0
        const watchedSeasons = watched.watched_seasons ?? []
        const episodeCounts = watched.episode_counts ?? []
        for (const season of airedSeasons) {
            const idx = watchedSeasons.indexOf(season.season_number)
            if (idx === -1) continue
            const count = episodeCounts[idx]
            const airedInSeason = lastEp?.season_number === season.season_number
                ? lastEp.episode_number
                : season.episode_count
            watchedEps += count != null ? count : airedInSeason
        }
        progressMap.set(show.id, Math.min(watchedEps / totalAired, 0.97))
    }

    return (
        <MediaStateProvider
            listId={watchlistResult.listId}
            watchedIds={(watchedResult.data ?? []).map(w => w.tmdb_id)}
            listedIds={watchlistResult.listedIds}
            streamingProviders={settingsResult.data?.streaming_providers ?? []}
            region={settingsResult.data?.region ?? 'GB'}
        >
            <div className='flex flex-col gap-8 w-full overflow-hidden'>
                {trendingDailyResult.data?.results?.length ? (
                    <HeroCarousel items={trendingDailyResult.data.results} />
                ) : null}
                <MediaSection title='Top 10 Right Now' items={trendingDailyResult.data} ranked />
                {cwItems.length > 0 && (
                    <MediaSection title='Continue Watching' items={cwItems} type='show' progressMap={progressMap} filterable />
                )}
                {watchlistResult.details.length > 0 && (
                    <MediaSection title='Want to Watch' items={watchlistResult.details} filterable />
                )}
                <MediaSection
                    title='New This Week'
                    items={[
                        ...(thisWeekMoviesResult.data?.results ?? []),
                        ...(thisWeekShowsResult.data?.results ?? []),
                    ].sort((a, b) => b.popularity - a.popularity)}
                />
                <MediaSection title='Trending' items={trendingResult.data} />

                <div className='flex flex-col gap-6'>
                    <div className='-mx-5 sm:-mx-6 h-px bg-white/[0.04]' />
                    <MediaSection title='New Movies'       items={newMoviesResult.data}      type='movie' />
                    <MediaSection title='New Shows'        items={newShowsResult.data}       type='show' />
                    <MediaSection title='Popular Movies'   items={popularMoviesResult.data}  type='movie' />
                    <MediaSection title='Popular Shows'    items={popularShowsResult.data}   type='show' />
                    <MediaSection title='Top Rated Movies' items={topRatedMoviesResult.data} type='movie' />
                    <MediaSection title='Top Rated Shows'  items={topRatedShowsResult.data}  type='show' />
                    <MediaSection title='Upcoming Movies'  items={upcomingMoviesResult.data} type='movie' />
                    <MediaSection title='Upcoming Shows'   items={upcomingShowsResult.data}  type='show' />
                </div>
            </div>
        </MediaStateProvider>
    )
}
