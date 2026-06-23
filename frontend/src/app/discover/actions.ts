'use server'

import { discoverMovies, discoverShows } from '@/utils/tmdbApi'

export async function fetchMoreMovies(genreId: number, page: number): Promise<MediaItemProps[]> {
    const { data } = await discoverMovies(genreId, page)
    return data?.results ?? []
}

export async function fetchMoreShows(genreId: number, page: number): Promise<MediaItemProps[]> {
    const { data } = await discoverShows(genreId, page)
    return data?.results ?? []
}
