import MediaSection from '@/components/mediaSection/mediasection'
import {
    getTrending, getTrendingDaily,
    getNewMovies, getNewShows,
    getPopularMovies, getPopularShows,
    getTopRatedMovies, getTopRatedShows,
    getUpcomingMovies, getUpcomingShows,
    getDetailsShow,
} from '@/utils/tmdbApi'
import { getContinueWatching } from '@/utils/api'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'

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
    if (!hasToken) return <SetupError reason="TMDB API key is not configured." />

    const [
        continueWatchingResult,
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
        getContinueWatching(),
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

    const cwItems = continueWatchingResult.data ?? []
    const cwDetailResults = await Promise.all(cwItems.map((item) => getDetailsShow(item.tmdb_id)))
    const cwDetails = cwDetailResults.map((r) => r.data).filter((d): d is ShowDetailsProps => d !== null)
    const continueWatchingData: MediaListProps | null = cwDetails.length > 0
        ? { page: 1, total_pages: 1, total_results: cwDetails.length, results: cwDetails }
        : null

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
        if (isInvalidKey) return <SetupError reason="Invalid TMDB API key. Check your TMDB_ACCESS_TOKEN." />
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
        <div className='flex flex-col gap-6 w-full overflow-hidden'>
            <MediaSection title='Continue Watching' items={continueWatchingData}                    type={'show'} />
            <MediaSection title='Top 10 Right Now'  items={trendingDailyResult.data}               ranked />
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
    )
}
