import config from '@config'

const accessToken = process.env.TMDB_ACCESS_TOKEN || process.env.ACCESS_TOKEN
const baseURL = config.url.API_URL
const { LANGUAGE, REGION, INCLUDE_ADULT, TIMEZONE } = config.setting

const REVALIDATE_CONFIG = 60 * 60 * 24
const REVALIDATE_LISTS = 60 * 30
const REVALIDATE_DETAILS = 60 * 60 * 6
const REVALIDATE_SEARCH = 60 * 5

function qs(params: Record<string, string | undefined | null>): string {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) p.append(k, v)
    return p.toString()
}

export async function getCountries(): Promise<ApiResult<Country[]>> {
    return getWrapper<Country[]>(`3/configuration/countries?${qs({ language: LANGUAGE })}`, REVALIDATE_CONFIG)
}

export async function getLanguages(): Promise<ApiResult<Language[]>> {
    return getWrapper<Language[]>('3/configuration/languages', REVALIDATE_CONFIG)
}

export async function getTimezones(): Promise<ApiResult<Timezone[]>> {
    return getWrapper<Timezone[]>('3/configuration/timezones', REVALIDATE_CONFIG)
}

export async function getTrending(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/trending/all/week?${qs({ language: LANGUAGE })}`, REVALIDATE_LISTS)
}

export async function getTrendingDaily(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/trending/all/day?${qs({ language: LANGUAGE })}`, REVALIDATE_LISTS)
}

export async function getNewMovies(): Promise<ApiResult<NewMoviesProps>> {
    return getWrapper<NewMoviesProps>(`3/movie/now_playing?${qs({ language: LANGUAGE, region: REGION })}`, REVALIDATE_LISTS)
}

export async function getPopularMovies(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/movie/popular?${qs({ language: LANGUAGE, region: REGION })}`, REVALIDATE_LISTS)
}

export async function getTopRatedMovies(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/movie/top_rated?${qs({ language: LANGUAGE, region: REGION })}`, REVALIDATE_LISTS)
}

export async function getUpcomingMovies(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/movie/upcoming?${qs({ language: LANGUAGE, region: REGION })}`, REVALIDATE_LISTS)
}

export async function getDetailsMovie(id: number): Promise<ApiResult<MovieDetailsProps>> {
    return getWrapper<MovieDetailsProps>(`3/movie/${id}?${qs({ language: LANGUAGE, append_to_response: 'watch/providers,videos' })}`, REVALIDATE_DETAILS)
}

export async function getMovieCollection(id: number): Promise<ApiResult<CollectionProps>> {
    return getWrapper<CollectionProps>(`3/collection/${id}?${qs({ language: LANGUAGE })}`, REVALIDATE_DETAILS)
}

export async function getSimilarMovies(id: number): Promise<ApiResult<MediaListProps>> {
    return getWrapper<MediaListProps>(`3/movie/${id}/recommendations?${qs({ language: LANGUAGE })}`, REVALIDATE_DETAILS)
}

export async function getNewShows(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/tv/airing_today?${qs({ language: LANGUAGE, timezone: TIMEZONE })}`, REVALIDATE_LISTS)
}

export async function getPopularShows(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/tv/popular?${qs({ language: LANGUAGE })}`, REVALIDATE_LISTS)
}

export async function getTopRatedShows(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/tv/top_rated?${qs({ language: LANGUAGE })}`, REVALIDATE_LISTS)
}

export async function getUpcomingShows(): Promise<ApiResult<TrendingProps>> {
    return getWrapper<TrendingProps>(`3/tv/on_the_air?${qs({ language: LANGUAGE, region: TIMEZONE })}`, REVALIDATE_LISTS)
}

export async function getDetailsShow(id: number): Promise<ApiResult<ShowDetailsProps>> {
    return getWrapper<ShowDetailsProps>(`3/tv/${id}?${qs({ language: LANGUAGE, append_to_response: 'watch/providers,videos' })}`, REVALIDATE_DETAILS)
}

export async function getSimilarShows(id: number): Promise<ApiResult<MediaListProps>> {
    return getWrapper<MediaListProps>(`3/tv/${id}/recommendations?${qs({ language: LANGUAGE })}`, REVALIDATE_DETAILS)
}

export async function getSeasonEpisodes(showId: number, season: number): Promise<ApiResult<SeasonDetails>> {
    return getWrapper<SeasonDetails>(`3/tv/${showId}/season/${season}?${qs({ language: LANGUAGE })}`, REVALIDATE_DETAILS)
}

export async function getMovieGenres(): Promise<ApiResult<{ genres: Genre[] }>> {
    return getWrapper<{ genres: Genre[] }>(`3/genre/movie/list?${qs({ language: LANGUAGE })}`, REVALIDATE_LISTS)
}

export async function getTvGenres(): Promise<ApiResult<{ genres: Genre[] }>> {
    return getWrapper<{ genres: Genre[] }>(`3/genre/tv/list?${qs({ language: LANGUAGE })}`, REVALIDATE_LISTS)
}

export async function discoverMovies(genreId: number, page = 1): Promise<ApiResult<MediaListProps>> {
    const adult = INCLUDE_ADULT ? String(INCLUDE_ADULT) : null
    const params = qs({ language: LANGUAGE, region: REGION, include_adult: adult, sort_by: 'popularity.desc', with_genres: String(genreId), page: String(page) })
    return getWrapper<MediaListProps>(`3/discover/movie?${params}`, REVALIDATE_LISTS)
}

export async function discoverShows(genreId: number, page = 1): Promise<ApiResult<MediaListProps>> {
    const adult = INCLUDE_ADULT ? String(INCLUDE_ADULT) : null
    const params = qs({ language: LANGUAGE, include_adult: adult, sort_by: 'popularity.desc', with_genres: String(genreId), page: String(page) })
    return getWrapper<MediaListProps>(`3/discover/tv?${params}`, REVALIDATE_LISTS)
}

export async function getSearch(query: string, page = 1): Promise<ApiResult<SearchProps>> {
    const url = `3/search/multi?${qs({ query, include_adult: INCLUDE_ADULT ? String(INCLUDE_ADULT) : null, language: LANGUAGE, page: String(page) })}`
    return getWrapper<SearchProps>(url, REVALIDATE_SEARCH)
}

async function getWrapper<T>(path: string, revalidate = REVALIDATE_LISTS): Promise<ApiResult<T>> {
    if (!accessToken) return { data: null, error: 'Missing TMDB access token.' }

    try {
        const response = await fetch(`${baseURL}${path}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            next: { revalidate },
        })

        if (!response.ok) {
            let message = response.statusText || 'TMDB request failed.'
            try {
                const body = await response.json()
                if (typeof body?.status_message === 'string') message = body.status_message
            } catch { /* ignore */ }
            return { data: null, error: message }
        }

        return { data: await response.json() as T, error: null }
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error!'
        console.error(msg)
        return { data: null, error: msg }
    }
}
