import MediaSection from '@/components/media/mediaSection'
import HeroCarousel from '@/components/media/heroCarousel'
import {
    getTrending, getTrendingDaily,
    getNewMovies, getNewShows,
    getPopularMovies, getPopularShows,
    getTopRatedMovies, getTopRatedShows,
    getUpcomingMovies, getUpcomingShows,
} from '@/utils/tmdbApi'
import { getFilteredContinueWatching } from '@/utils/continueWatching'
import { getAllWatched, getDefaultListState } from '@/utils/queries'
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

export default async function Home() {
    if (!await getSessionUserId()) redirect('/passkey/login')

    const hasToken = !!(process.env.TMDB_ACCESS_TOKEN || process.env.ACCESS_TOKEN)
    if (!hasToken) return <SetupError reason='TMDB API key is not configured.' />

    const [
        cwItems,
        listState,
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
    ] = await Promise.all([
        getFilteredContinueWatching(),
        getDefaultListState(),
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
    ])

    const results = [
        trendingDailyResult, trendingResult, newMoviesResult, newShowsResult,
        popularMoviesResult, popularShowsResult,
        topRatedMoviesResult, topRatedShowsResult,
        upcomingMoviesResult, upcomingShowsResult,
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

    return (
        <MediaStateProvider
            listId={listState.listId}
            watchedIds={(watchedResult.data ?? []).map(w => w.tmdb_id)}
            listedIds={listState.listedIds}
        >
            <div className='flex flex-col gap-6 w-full overflow-hidden'>
                {trendingDailyResult.data?.results?.length ? (
                    <HeroCarousel items={trendingDailyResult.data.results} />
                ) : null}
                <MediaSection title='Top 10 Right Now'  items={trendingDailyResult.data}               ranked />
                <MediaSection title='Continue Watching' items={cwItems.length > 0 ? cwItems : null} type='show' />
                <MediaSection title='Trending'          items={trendingResult.data} />
                <MediaSection title='New Movies'        items={newMoviesResult.data}       type={'movie'} />
                <MediaSection title='New Shows'       items={newShowsResult.data}        type={'show'} />
                <MediaSection title='Popular Movies'  items={popularMoviesResult.data}   type={'movie'} />
                <MediaSection title='Popular Shows'   items={popularShowsResult.data}    type={'show'} />
                <MediaSection title='Top Rated Movies' items={topRatedMoviesResult.data} type={'movie'} />
                <MediaSection title='Top Rated Shows'  items={topRatedShowsResult.data}  type={'show'} />
                <MediaSection title='Upcoming Movies' items={upcomingMoviesResult.data}  type={'movie'} />
                <MediaSection title='Upcoming Shows'  items={upcomingShowsResult.data}   type={'show'} />
            </div>
        </MediaStateProvider>
    )
}
