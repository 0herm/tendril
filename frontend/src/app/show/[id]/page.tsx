import MediaPage from '@/components/mediaPage/mediaPage'
import { getDetailsShow, getSimilarShows } from '@/utils/tmdbApi'

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params
    const [{ data, error }, { data: similar }] = await Promise.all([
        getDetailsShow(id),
        getSimilarShows(id),
    ])

    if (error || !data) throw new Error('Error loading TV show')
    return <MediaPage item={data} media='show' similar={similar} />
}
