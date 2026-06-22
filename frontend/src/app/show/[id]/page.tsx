import MediaPage from '@/components/mediaPage/mediaPage'
import { getDetailsShow, getSimilarShows } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { getUserSettings, getAllWatched, getDefaultListState } from '@/utils/api'
import { MediaStateProvider } from '@/components/mediaState/mediaStateContext'

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

    const watchedIds = new Set((watchedData ?? []).map(w => w.tmdb_id))
    const watchedInSimilar = similar?.results.filter(r => watchedIds.has(r.id)).length ?? 0

    return (
        <MediaStateProvider
            listId={listState.listId}
            watchedIds={(watchedData ?? []).map(w => w.tmdb_id)}
            listedIds={listState.listedIds}
        >
            <MediaPage item={data} media='show' similar={similar} region={settings?.region} watchedInSimilar={watchedInSimilar} />
        </MediaStateProvider>
    )
}
