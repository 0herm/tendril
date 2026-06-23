'use server'

import { getSearch } from '@/utils/tmdbApi'

export async function fetchMoreSearch(query: string, page: number): Promise<TrendingItemProps[]> {
    const { data } = await getSearch(query, page)
    return (data?.results ?? []).filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
    )
}
