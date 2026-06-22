import { getAllLists, getMediaByListId, getAllWatched } from '@/utils/api'
import { MediaStateProvider } from '@/components/mediaState/mediaStateContext'
import { getFilteredContinueWatching } from '@/utils/continueWatching'
import MediaSection from '@/components/mediaSection/mediasection'
import { getDetailsShow, getDetailsMovie } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { Library } from 'lucide-react'
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

    const [listsMedia, watchedResults, continueWatchingFiltered] = await Promise.all([
        Promise.all(lists.map(async (list) => {
            const { data: mediaItems } = await getMediaByListId(list.id)
            const items = mediaItems ?? []
            const results = (await Promise.all(items.map(fetchDetails))).filter(Boolean) as (ShowDetailsProps | MovieDetailsProps)[]
            const candidates = results.map((d) => ({
                id: d.id,
                type: ('title' in d ? 'movie' : 'show') as 'movie' | 'show',
                genre_ids: d.genres?.map((g: { id: number }) => g.id),
                runtime: ('runtime' in d ? d.runtime : (d as ShowDetailsProps).episode_run_time?.[0]) ?? undefined,
            }))
            return { list, data: { page: 1, total_pages: 1, total_results: results.length, results }, candidates }
        })),
        getAllWatched().then(({ data }) => Promise.all((data ?? []).map(fetchDetails))),
        getFilteredContinueWatching(),
    ])

    const hasMedia =
        watchedResults.some(Boolean) ||
        continueWatchingFiltered.length > 0 ||
        listsMedia.some((l) => l.data.results.length > 0)

    const surpriseCandidates = listsMedia.flatMap((l) => l.candidates)
    const continueItems = continueWatchingFiltered as (ShowDetailsProps | MovieDetailsProps)[]

    const defaultListId = lists[0]?.id
    const defaultListItems = defaultListId
        ? (listsMedia.find(l => l.list.id === defaultListId)?.data.results ?? [])
        : []
    const watchedItemIds = (watchedResults.filter(Boolean) as (ShowDetailsProps | MovieDetailsProps)[]).map(w => w.id)

    return (
        <MediaStateProvider
            listId={defaultListId}
            watchedIds={watchedItemIds}
            listedIds={defaultListItems.map(r => r.id)}
        >
        <div className='w-full flex flex-col gap-6'>
            {hasMedia ? (
                <div className='flex flex-col gap-6'>
                    {surpriseCandidates.length > 0 && continueItems.length === 0 && (
                        <div className='flex justify-end'>
                            <SurpriseButton items={surpriseCandidates} />
                        </div>
                    )}

                    <MediaSection
                        title='Continue Watching'
                        items={{ page: 1, total_pages: 1, total_results: continueItems.length, results: continueItems }}
                        action={surpriseCandidates.length > 0 ? <SurpriseButton items={surpriseCandidates} /> : undefined}
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
                <div className='flex flex-col items-center justify-center gap-5 py-20 text-center'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border/60'>
                        <Library className='h-7 w-7 text-muted-foreground' />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <p className='text-sm font-semibold'>Your library is empty</p>
                        <p className='text-xs text-muted-foreground max-w-xs leading-relaxed'>
                            Browse movies and shows and save them to your lists to see them here.
                        </p>
                    </div>
                    <Link
                        href='/'
                        className={
                            'inline-flex items-center gap-2 h-9 px-5 rounded-lg ' +
                            'bg-brand hover:bg-brand-dim active:bg-brand-dimmer text-white text-sm font-medium transition-colors'
                        }
                    >
                        Browse
                    </Link>
                </div>
            )}
        </div>
        </MediaStateProvider>
    )
}
