import GenrePage from '@/components/discover/genrePage'
import { discoverShows } from '@/utils/tmdbApi'
import { fetchMoreShows } from '../../actions'

export default async function Page({ params, searchParams }: { params: Promise<{ genre: string }>; searchParams: Promise<{ name?: string }> }) {
    const { genre } = await params
    const { name } = await searchParams
    return <GenrePage genreId={Number(genre)} name={name} defaultName='Shows' typeLabel='TV Shows' discover={discoverShows} fetchMore={fetchMoreShows} />
}
