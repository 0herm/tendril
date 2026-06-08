import MediaPage from '@/components/mediaPage/mediaPage'
import { getDetailsMovie, getSimilarMovies, getMovieCollection } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { getUserSettings } from '@/utils/api'

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params
    const userId = await getSessionUserId()
    const { data, error } = await getDetailsMovie(id)

    if (error || !data) throw new Error('Error loading movie')

    const [{ data: similar }, { data: settings }, { data: collection }] = await Promise.all([
        getSimilarMovies(id),
        userId ? getUserSettings(userId) : Promise.resolve({ data: null, error: null }),
        data.belongs_to_collection
            ? getMovieCollection(data.belongs_to_collection.id)
            : Promise.resolve({ data: null, error: null }),
    ])

    return <MediaPage item={data} media='movie' similar={similar} region={settings?.region} collection={collection} />
}
