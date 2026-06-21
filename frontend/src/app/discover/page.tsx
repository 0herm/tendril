import { getMovieGenres, getTvGenres } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DiscoverPage() {
    if (!await getSessionUserId()) redirect('/passkey/login')

    const [movieGenresResult, tvGenresResult] = await Promise.all([
        getMovieGenres(),
        getTvGenres(),
    ])

    const movieGenres = movieGenresResult.data?.genres ?? []
    const tvGenres = tvGenresResult.data?.genres ?? []

    return (
        <div className='flex flex-col gap-8 w-full'>
            <section className='flex flex-col gap-3'>
                <h2 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>Movie Genres</h2>
                <div className='flex flex-wrap gap-2'>
                    {movieGenres.map((genre) => (
                        <Link
                            key={genre.id}
                            href={`/discover/movies/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                            className='px-3 py-1.5 rounded-full text-sm font-medium bg-muted hover:bg-accent hover:text-accent-foreground transition-colors'
                        >
                            {genre.name}
                        </Link>
                    ))}
                </div>
            </section>

            <section className='flex flex-col gap-3'>
                <h2 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>TV Genres</h2>
                <div className='flex flex-wrap gap-2'>
                    {tvGenres.map((genre) => (
                        <Link
                            key={genre.id}
                            href={`/discover/shows/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                            className='px-3 py-1.5 rounded-full text-sm font-medium bg-muted hover:bg-accent hover:text-accent-foreground transition-colors'
                        >
                            {genre.name}
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}
