import GenrePage from '@/components/discover/genrePage'
import { discoverMovies } from '@/utils/tmdbApi'
import { fetchMoreMovies } from '../../actions'

export default async function Page({ params, searchParams }: { params: Promise<{ genre: string }>; searchParams: Promise<{ name?: string }> }) {
    const { genre } = await params
    const { name } = await searchParams
    return <GenrePage genreId={Number(genre)} name={name} defaultName='Movies' typeLabel='Movies' discover={discoverMovies} fetchMore={fetchMoreMovies} />
}
