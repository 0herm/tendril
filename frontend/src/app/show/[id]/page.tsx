import MediaPage from '@/components/mediaPage/mediaPage'
import { getDetailsShow, getSimilarShows } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { getUserSettings } from '@/utils/api'

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params
    const userId = await getSessionUserId()
    const [{ data, error }, { data: similar }, { data: settings }] = await Promise.all([
        getDetailsShow(id),
        getSimilarShows(id),
        userId ? getUserSettings(userId) : Promise.resolve({ data: null, error: null }),
    ])

    if (error || !data) throw new Error('Error loading TV show')
    return <MediaPage item={data} media='show' similar={similar} region={settings?.region} />
}
