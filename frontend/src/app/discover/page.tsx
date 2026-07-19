import { getMovieGenres, getTvGenres } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import DiscoverBrowser from '@/components/discover/discoverBrowser'
import PageContainer from '@/components/pageContainer'

export default async function DiscoverPage() {
    if (!await getSessionUserId()) redirect('/passkey/login')

    const [movieGenresResult, tvGenresResult] = await Promise.all([
        getMovieGenres(),
        getTvGenres(),
    ])

    const movieGenres = movieGenresResult.data?.genres ?? []
    const tvGenres = tvGenresResult.data?.genres ?? []

    return (
        <PageContainer>
            <DiscoverBrowser movieGenres={movieGenres} tvGenres={tvGenres} />
        </PageContainer>
    )
}
