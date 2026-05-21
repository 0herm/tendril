import MediaCard from '@/components/mediaCard/mediaCard'
import { getSearch } from '@/utils/tmdbApi'
import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'

export default async function Page({ params }: { params: Promise<{ search: string }> }) {
    const param = (await params).search
    const query = decodeURIComponent(param)

    const { data: searchResult } = await getSearch(param)

    const sortedResults = searchResult
        ? [...searchResult.results].sort((a, b) =>
            wilsonLowerBound(b.vote_average, b.vote_count) - wilsonLowerBound(a.vote_average, a.vote_count)
        )
        : []

    const results = sortedResults.filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
    )

    return (
        <div className='w-full flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
                <Link
                    href='/search'
                    className='flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0'
                >
                    <ArrowLeft className='h-4 w-4' />
                    <span className='hidden xs:inline'>Search</span>
                </Link>
                <h1 className='text-base font-semibold truncate'>
                    {results.length > 0 ? `Results for "${query}"` : `No results for "${query}"`}
                </h1>
            </div>

            {results.length > 0 ? (
                <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3'>
                    {results.map((item, index) => (
                        <MediaCard key={index} item={item} />
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted'>
                        <SearchX className='h-7 w-7 text-muted-foreground' />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <p className='text-sm font-medium'>No results found</p>
                        <p className='text-xs text-muted-foreground max-w-xs'>
                            Try a different search term or check your spelling.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

function wilsonLowerBound(voteAverage: number, voteCount: number, z = 1.96): number {
    if (voteCount === 0) return 0
    const p = voteAverage / 10
    const denominator = 1 + (z ** 2) / voteCount
    const center = p + (z ** 2) / (2 * voteCount)
    const margin = z * Math.sqrt((p * (1 - p) + (z ** 2) / (4 * voteCount)) / voteCount)
    return (center - margin) / denominator
}
