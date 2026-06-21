import MediaPage from '@/components/mediaPage/mediaPage'
import { getDetailsShow, getSimilarShows } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { getUserSettings, getAllWatched } from '@/utils/api'

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params
    const userId = await getSessionUserId()
    const [{ data, error }, { data: similar }, { data: settings }, { data: watchedData }] = await Promise.all([
        getDetailsShow(id),
        getSimilarShows(id),
        userId ? getUserSettings(userId) : Promise.resolve({ data: null, error: null }),
        getAllWatched(),
    ])

    if (error || !data) throw new Error('Error loading TV show')

    const watchedIds = new Set((watchedData ?? []).map(w => w.tmdb_id))
    const watchedInSimilar = similar?.results.filter(r => watchedIds.has(r.id)).length ?? 0

    return <MediaPage item={data} media='show' similar={similar} region={settings?.region} watchedInSimilar={watchedInSimilar} />
}
