'use server'

import { discoverMovies } from '@/utils/tmdbApi'

export async function fetchMoreMovies(genreId: number, page: number): Promise<MediaItemProps[]> {
    const { data } = await discoverMovies(genreId, page)
    return data?.results ?? []
}
