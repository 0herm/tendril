import MediaPage from '@/components/mediaPage/mediaPage'
import { getDetailsMovie, getSimilarMovies } from '@/utils/tmdbApi'

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params
    const [{ data, error }, { data: similar }] = await Promise.all([
        getDetailsMovie(id),
        getSimilarMovies(id),
    ])

    if (error || !data) throw new Error('Error loading movie')
    return <MediaPage item={data} media='movie' similar={similar} />
}
