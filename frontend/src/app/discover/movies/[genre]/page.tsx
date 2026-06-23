import LoadMore from '@/components/media/loadMore'
import { discoverMovies } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { getAllWatched, getDefaultListState } from '@/utils/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { fetchMoreMovies } from '../../actions'
import { MediaStateProvider } from '@/components/watched/mediaStateContext'

export default async function Page({ params, searchParams }: { params: Promise<{ genre: string }>; searchParams: Promise<{ name?: string }> }) {
    if (!await getSessionUserId()) redirect('/passkey/login')

    const { genre } = await params
    const { name } = await searchParams
    const [{ data }, { data: watchedData }, listState] = await Promise.all([
        discoverMovies(Number(genre)),
        getAllWatched(),
        getDefaultListState(),
    ])
    const results = data?.results ?? []
    const totalPages = data?.total_pages ?? 1

    const fetchMore = fetchMoreMovies.bind(null, Number(genre))

    return (
        <MediaStateProvider
            listId={listState.listId}
            watchedIds={(watchedData ?? []).map(w => w.tmdb_id)}
            listedIds={listState.listedIds}
        >
            <div className='w-full flex flex-col gap-4'>
                <div className='flex items-center gap-3'>
                    <Link href='/discover' className='flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0'>
                        <ArrowLeft className='h-4 w-4' />
                        <span className='hidden xs:inline'>Discover</span>
                    </Link>
                    <h1 className='text-base font-semibold truncate'>{name ?? 'Movies'}</h1>
                </div>
                <LoadMore initialItems={results} totalPages={totalPages} fetchMore={fetchMore} />
            </div>
        </MediaStateProvider>
    )
}
