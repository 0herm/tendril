import MediaPage from '@/components/mediaPage/mediaPage'
import { getDetailsMovie, getSimilarMovies, getMovieCollection } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { getUserSettings, getAllWatched, getDefaultListState } from '@/utils/api'
import { MediaStateProvider } from '@/components/mediaState/mediaStateContext'

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params
    const userId = await getSessionUserId()
    const { data, error } = await getDetailsMovie(id)

    if (error || !data) throw new Error('Error loading movie')

    const [{ data: similar }, { data: settings }, { data: collection }, { data: watchedData }, listState] = await Promise.all([
        getSimilarMovies(id),
        userId ? getUserSettings(userId) : Promise.resolve({ data: null, error: null }),
        data.belongs_to_collection
            ? getMovieCollection(data.belongs_to_collection.id)
            : Promise.resolve({ data: null, error: null }),
        getAllWatched(),
        getDefaultListState(),
    ])

    const watchedIds = new Set((watchedData ?? []).map(w => w.tmdb_id))
    const watchedInSimilar = similar?.results.filter(r => watchedIds.has(r.id)).length ?? 0

    return (
        <MediaStateProvider
            listId={listState.listId}
            watchedIds={(watchedData ?? []).map(w => w.tmdb_id)}
            listedIds={listState.listedIds}
        >
            <MediaPage item={data} media='movie' similar={similar} region={settings?.region} collection={collection} watchedInSimilar={watchedInSimilar} />
        </MediaStateProvider>
    )
}
