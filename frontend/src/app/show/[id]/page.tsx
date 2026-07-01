import MediaPage from '@/components/media/mediaPage'
import { getDetailsShow, getSimilarShows } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { getUserSettings, getAllWatched, getDefaultListState } from '@/utils/queries'
import { MediaStateProvider } from '@/components/watched/mediaStateContext'

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params
    const userId = await getSessionUserId()
    const [{ data, error }, { data: similar }, { data: settings }, { data: watchedData }, listState] = await Promise.all([
        getDetailsShow(id),
        getSimilarShows(id),
        userId ? getUserSettings(userId) : Promise.resolve({ data: null, error: null }),
        getAllWatched(),
        getDefaultListState(),
    ])

    if (error || !data) throw new Error('Error loading TV show')

    const watchedIdList = (watchedData ?? []).map(w => w.tmdb_id)
    const watchedIds = new Set(watchedIdList)
    const watchedInSimilar = similar?.results.filter(r => watchedIds.has(r.id)).length ?? 0

    return (
        <MediaStateProvider
            listId={listState.listId}
            watchedIds={watchedIdList}
            listedIds={listState.listedIds}
        >
            <MediaPage item={data} media='show' similar={similar} region={settings?.region} language={settings?.language} watchedInSimilar={watchedInSimilar} />
        </MediaStateProvider>
    )
}
