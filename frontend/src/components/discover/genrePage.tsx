import LoadMore from '@/components/media/loadMore'
import { getSessionUserId } from '@/utils/auth'
import { getAllWatched, getDefaultListState } from '@/utils/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MediaStateProvider } from '@/components/watched/mediaStateContext'

type DiscoverResult = { data?: { results?: unknown[]; total_pages?: number } | null }

type Props = {
    genreId: number
    name?: string
    defaultName: string
    typeLabel: string
    discover: (genreId: number) => Promise<DiscoverResult>
    fetchMore: (genreId: number, page: number) => Promise<unknown>
}

export default async function GenrePage({ genreId, name, defaultName, typeLabel, discover, fetchMore: fetchMoreFn }: Props) {
    if (!await getSessionUserId()) redirect('/passkey/login')

    const [{ data }, { data: watchedData }, listState] = await Promise.all([
        discover(genreId),
        getAllWatched(),
        getDefaultListState(),
    ])
    const results = data?.results ?? []
    const totalPages = data?.total_pages ?? 1
    const fetchMore = fetchMoreFn.bind(null, genreId)

    return (
        <MediaStateProvider
            listId={listState.listId}
            watchedIds={(watchedData ?? []).map(w => w.tmdb_id)}
            listedIds={listState.listedIds}
        >
            <div className='w-full flex flex-col gap-6'>
                <div className='flex items-center gap-3'>
                    <Link href='/discover' className='flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/8 text-muted-foreground/60 hover:text-foreground transition-all shrink-0'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                    <div className='flex flex-col gap-0.5 min-w-0'>
                        <h1 className='text-base font-black tracking-tight truncate'>{name ?? defaultName}</h1>
                        <p className='text-[11px] text-muted-foreground/50'>{typeLabel}</p>
                    </div>
                </div>
                <LoadMore initialItems={results} totalPages={totalPages} fetchMore={fetchMore} />
            </div>
        </MediaStateProvider>
    )
}
