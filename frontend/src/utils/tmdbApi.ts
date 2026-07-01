import config from '@config'
import { getAppSettings } from './settings'

const accessToken = process.env.TMDB_ACCESS_TOKEN || process.env.ACCESS_TOKEN
const baseURL = config.url.API_URL

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
    const { language } = await getAppSettings()
    return getWrapper<Country[]>(`3/configuration/countries?${qs({ language })}`, REVALIDATE_CONFIG)
}

export async function getLanguages(): Promise<ApiResult<Language[]>> {
    return getWrapper<Language[]>('3/configuration/languages', REVALIDATE_CONFIG)
}

export async function getTimezones(): Promise<ApiResult<Timezone[]>> {
    return getWrapper<Timezone[]>('3/configuration/timezones', REVALIDATE_CONFIG)
}

export async function getTrending(): Promise<ApiResult<TrendingProps>> {
    const { language } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/trending/all/week?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getTrendingDaily(): Promise<ApiResult<TrendingProps>> {
    const { language } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/trending/all/day?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getNewMovies(): Promise<ApiResult<TrendingProps>> {
    const { language } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/movie/now_playing?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getPopularMovies(): Promise<ApiResult<TrendingProps>> {
    const { language } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/movie/popular?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getTopRatedMovies(): Promise<ApiResult<TrendingProps>> {
    const { language } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/movie/top_rated?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getUpcomingMovies(): Promise<ApiResult<TrendingProps>> {
    const { language } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/movie/upcoming?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getDetailsMovie(id: number): Promise<ApiResult<MovieDetailsProps>> {
    const { language } = await getAppSettings()
    return getWrapper<MovieDetailsProps>(`3/movie/${id}?${qs({ language, append_to_response: 'watch/providers,videos' })}`, REVALIDATE_DETAILS)
}

export async function getMovieCollection(id: number): Promise<ApiResult<CollectionProps>> {
    const { language } = await getAppSettings()
    return getWrapper<CollectionProps>(`3/collection/${id}?${qs({ language })}`, REVALIDATE_DETAILS)
}

export async function getSimilarMovies(id: number): Promise<ApiResult<MediaListProps>> {
    const { language } = await getAppSettings()
    return getWrapper<MediaListProps>(`3/movie/${id}/recommendations?${qs({ language })}`, REVALIDATE_DETAILS)
}

export async function getNewShows(): Promise<ApiResult<TrendingProps>> {
    const { language, timezone } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/tv/airing_today?${qs({ language, timezone })}`, REVALIDATE_LISTS)
}

export async function getPopularShows(): Promise<ApiResult<TrendingProps>> {
    const { language } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/tv/popular?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getTopRatedShows(): Promise<ApiResult<TrendingProps>> {
    const { language } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/tv/top_rated?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getUpcomingShows(): Promise<ApiResult<TrendingProps>> {
    const { language, timezone } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/tv/on_the_air?${qs({ language, timezone })}`, REVALIDATE_LISTS)
}

export async function getDetailsShow(id: number): Promise<ApiResult<ShowDetailsProps>> {
    const { language } = await getAppSettings()
    return getWrapper<ShowDetailsProps>(`3/tv/${id}?${qs({ language, append_to_response: 'watch/providers,videos' })}`, REVALIDATE_DETAILS)
}

export async function getSimilarShows(id: number): Promise<ApiResult<MediaListProps>> {
    const { language } = await getAppSettings()
    return getWrapper<MediaListProps>(`3/tv/${id}/recommendations?${qs({ language })}`, REVALIDATE_DETAILS)
}

export async function getSeasonEpisodes(showId: number, season: number): Promise<ApiResult<SeasonDetails>> {
    const { language } = await getAppSettings()
    return getWrapper<SeasonDetails>(`3/tv/${showId}/season/${season}?${qs({ language })}`, REVALIDATE_DETAILS)
}

export async function getMovieGenres(): Promise<ApiResult<{ genres: Genre[] }>> {
    const { language } = await getAppSettings()
    return getWrapper<{ genres: Genre[] }>(`3/genre/movie/list?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function getTvGenres(): Promise<ApiResult<{ genres: Genre[] }>> {
    const { language } = await getAppSettings()
    return getWrapper<{ genres: Genre[] }>(`3/genre/tv/list?${qs({ language })}`, REVALIDATE_LISTS)
}

export async function discoverMovies(genreId: number, page = 1): Promise<ApiResult<MediaListProps>> {
    const { language, include_adult } = await getAppSettings()
    const adult = include_adult ? 'true' : null
    const params = qs({ language, include_adult: adult, sort_by: 'popularity.desc', with_genres: String(genreId), page: String(page) })
    return getWrapper<MediaListProps>(`3/discover/movie?${params}`, REVALIDATE_LISTS)
}

export async function discoverShows(genreId: number, page = 1): Promise<ApiResult<MediaListProps>> {
    const { language, include_adult } = await getAppSettings()
    const adult = include_adult ? 'true' : null
    const params = qs({ language, include_adult: adult, sort_by: 'popularity.desc', with_genres: String(genreId), page: String(page) })
    return getWrapper<MediaListProps>(`3/discover/tv?${params}`, REVALIDATE_LISTS)
}

export async function getSearch(query: string, page = 1): Promise<ApiResult<SearchProps>> {
    const { language, include_adult } = await getAppSettings()
    const adult = include_adult ? 'true' : null
    const url = `3/search/multi?${qs({ query, include_adult: adult, language, page: String(page) })}`
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
