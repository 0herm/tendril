import { getAllLists, getMediaByListId, getAllWatched, getContinueWatching } from '@/utils/api'
import MediaSection from '@/components/mediaSection/mediasection'
import { getDetailsShow, getDetailsMovie } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { SurpriseButton } from '@/components/surpriseButton/surpriseButton'

async function fetchDetails(media: MediaProps | WatchedProps) {
    if (media.type === 'show') {
        const { data } = await getDetailsShow(media.tmdb_id)
        return data ? { ...data, media_type: 'tv' as const } : null
    }
    const { data } = await getDetailsMovie(media.tmdb_id)
    return data ? { ...data, media_type: 'movie' as const } : null
}

export default async function Page() {
    const userId = await getSessionUserId()
    if (!userId) redirect('/passkey/login')

    const { data: listsData } = await getAllLists()
    const lists: ListProps[] = listsData ?? []

    const [listsMedia, watchedResults, continueWatchingResults] = await Promise.all([
        Promise.all(lists.map(async (list) => {
            const { data: mediaItems } = await getMediaByListId(list.id)
            const items = mediaItems ?? []
            const results = (await Promise.all(items.map(fetchDetails))).filter(Boolean) as (ShowDetailsProps | MovieDetailsProps)[]
            const candidates = items.map((m) => ({ id: m.tmdb_id, type: m.type }))
            return { list, data: { page: 1, total_pages: 1, total_results: results.length, results }, candidates }
        })),
        getAllWatched().then(({ data }) => Promise.all((data ?? []).map(fetchDetails))),
        getContinueWatching().then(({ data }) =>
            Promise.all((data ?? []).map(async (item) => {
                const details = await fetchDetails(item)
                return details ? {
                    details,
                    watchedSeasons: item.watched_seasons ?? [],
                    episodeCounts: item.episode_counts ?? [],
                } : null
            }))
        ),
    ])

    const today = new Date()
    const continueWatchingFiltered = continueWatchingResults
        .filter((r): r is { details: NonNullable<typeof r>['details']; watchedSeasons: number[]; episodeCounts: number[] } => {
            if (!r) return false
            const { details, watchedSeasons, episodeCounts } = r
            if (!('seasons' in details)) return true

            // Unwatched season with available episodes
            if (details.seasons.some(
                (s) => s.season_number > 0 && !watchedSeasons.includes(s.season_number) && s.episode_count > 0 && !!s.air_date && new Date(s.air_date) <= today
            )) return true

            // Watched season now has more aired episodes than when the user last saved
            if (details.seasons.some((s) => {
                const idx = watchedSeasons.indexOf(s.season_number)
                if (idx === -1) return false
                const stored = episodeCounts[idx]
                if (stored === undefined || stored === 0) return false
                const lastEp = details.last_episode_to_air
                const airedCount = lastEp?.season_number === s.season_number
                    ? lastEp.episode_number
                    : s.episode_count
                return airedCount > stored
            })) return true

            // Upcoming episode in a season the user has already marked watched
            if (details.next_episode_to_air) {
                const { season_number, air_date } = details.next_episode_to_air
                if (watchedSeasons.includes(season_number) && new Date(air_date) <= today) return true
            }

            return false
        })
        .map((r) => r.details)

    const hasMedia =
        watchedResults.some(Boolean) ||
        continueWatchingFiltered.length > 0 ||
        listsMedia.some((l) => l.data.results.length > 0)

    const surpriseCandidates = listsMedia.flatMap((l) => l.candidates)

    return (
        <div className='w-full flex flex-col gap-6'>
            {hasMedia ? (
                <div className='flex flex-col gap-6'>
                    {surpriseCandidates.length > 0 && (
                        <div className='flex justify-end'>
                            <SurpriseButton items={surpriseCandidates} />
                        </div>
                    )}
                    <MediaSection
                        title='Continue Watching'
                        items={{
                            page: 1, total_pages: 1,
                            total_results: continueWatchingFiltered.length,
                            results: continueWatchingFiltered as (ShowDetailsProps | MovieDetailsProps)[]
                        }}
                    />
                    <MediaSection
                        title='Watched'
                        items={{
                            page: 1, total_pages: 1,
                            total_results: watchedResults.filter(Boolean).length,
                            results: watchedResults.filter(Boolean) as (ShowDetailsProps | MovieDetailsProps)[]
                        }}
                    />
                    {listsMedia.map((listMedia) => (
                        <MediaSection
                            key={listMedia.list.id}
                            title={listMedia.list.name}
                            items={listMedia.data}
                        />
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted'>
                        <BookOpen className='h-7 w-7 text-muted-foreground' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <p className='text-sm font-medium'>Your library is empty</p>
                        <p className='text-xs text-muted-foreground max-w-xs'>
                            Browse movies and shows and save them to your lists to see them here.
                        </p>
                    </div>
                    <Link
                        href='/'
                        className={
                            'inline-flex items-center gap-2 h-9 px-4 rounded-lg ' +
                            'bg-brand hover:bg-brand-dim active:bg-brand-dimmer text-white text-sm font-medium transition-colors'
                        }
                    >
                        Browse
                    </Link>
                </div>
            )}

        </div>
    )
}
