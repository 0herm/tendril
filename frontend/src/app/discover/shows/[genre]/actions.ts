'use server'

import { discoverShows } from '@/utils/tmdbApi'

export async function fetchMoreShows(genreId: number, page: number): Promise<MediaItemProps[]> {
    const { data } = await discoverShows(genreId, page)
    return data?.results ?? []
}
