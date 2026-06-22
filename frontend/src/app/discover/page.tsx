import { getMovieGenres, getTvGenres } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import DiscoverBrowser from './DiscoverBrowser'

export default async function DiscoverPage() {
    if (!await getSessionUserId()) redirect('/passkey/login')

    const [movieGenresResult, tvGenresResult] = await Promise.all([
        getMovieGenres(),
        getTvGenres(),
    ])

    const movieGenres = movieGenresResult.data?.genres ?? []
    const tvGenres = tvGenresResult.data?.genres ?? []

    return <DiscoverBrowser movieGenres={movieGenres} tvGenres={tvGenres} />
}
