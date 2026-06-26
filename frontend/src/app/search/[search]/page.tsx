import LoadMore from '@/components/media/loadMore'
import { getSearch } from '@/utils/tmdbApi'
import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'
import { fetchMoreSearch } from './actions'

export default async function Page({ params }: { params: Promise<{ search: string }> }) {
    const param = (await params).search
    const query = decodeURIComponent(param)

    const { data: searchResult } = await getSearch(param)
    const totalPages = searchResult?.total_pages ?? 1

    const sortedResults = searchResult
        ? [...searchResult.results].sort((a, b) =>
            wilsonLowerBound(b.vote_average, b.vote_count) - wilsonLowerBound(a.vote_average, a.vote_count)
        )
        : []

    const results = sortedResults.filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
    )

    const fetchMore = fetchMoreSearch.bind(null, param)

    return (
        <div className='w-full flex flex-col gap-6'>
            <div className='flex items-center gap-3'>
                <Link
                    href='/search'
                    className='flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/8 text-muted-foreground/60 hover:text-foreground transition-all shrink-0'
                >
                    <ArrowLeft className='h-4 w-4' />
                </Link>
                <div className='flex flex-col gap-0.5 min-w-0'>
                    <h1 className='text-base font-black tracking-tight truncate'>&ldquo;{query}&rdquo;</h1>
                    {results.length > 0 && <p className='text-[11px] text-muted-foreground/50'>{results.length} results</p>}
                </div>
            </div>

            {results.length > 0 ? (
                <LoadMore initialItems={results} totalPages={totalPages} fetchMore={fetchMore} />
            ) : (
                <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60'>
                        <SearchX className='h-6 w-6 text-muted-foreground/40' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <p className='text-sm font-semibold'>No results found</p>
                        <p className='text-xs text-muted-foreground/60 max-w-xs leading-relaxed'>
                            Try a different spelling or a more general term.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

function wilsonLowerBound(voteAverage: number, voteCount: number): number {
    if (voteCount === 0) return 0
    const z = 1.96
    const p = voteAverage / 10
    const denominator = 1 + (z ** 2) / voteCount
    const center = p + (z ** 2) / (2 * voteCount)
    const margin = z * Math.sqrt((p * (1 - p) + (z ** 2) / (4 * voteCount)) / voteCount)
    return (center - margin) / denominator
}
