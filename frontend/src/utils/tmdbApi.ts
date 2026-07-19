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
    const { language, region } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/trending/all/week?${qs({ language, region })}`, REVALIDATE_LISTS)
}

export async function getTrendingDaily(): Promise<ApiResult<TrendingProps>> {
    const { language, region } = await getAppSettings()
    return getWrapper<TrendingProps>(`3/trending/all/day?${qs({ language, region })}`, REVALIDATE_LISTS)
}

export const getNewMovies = () => mediaList('movie', 'now_playing')
export const getPopularMovies = () => mediaList('movie', 'popular')
export const getTopRatedMovies = () => mediaList('movie', 'top_rated')
export const getUpcomingMovies = () => mediaList('movie', 'upcoming')

export async function getDetailsMovie(id: number): Promise<ApiResult<MovieDetailsProps>> {
    const { language } = await getAppSettings()
    return getWrapper<MovieDetailsProps>(`3/movie/${id}?${qs({ language, append_to_response: 'watch/providers,videos', include_video_language: videoLanguages(language) })}`, REVALIDATE_DETAILS)
}

export async function getMovieCollection(id: number): Promise<ApiResult<CollectionProps>> {
    const { language } = await getAppSettings()
    return getWrapper<CollectionProps>(`3/collection/${id}?${qs({ language })}`, REVALIDATE_DETAILS)
}

export async function getSimilarMovies(id: number): Promise<ApiResult<MediaListProps>> {
    const { language } = await getAppSettings()
    return getWrapper<MediaListProps>(`3/movie/${id}/recommendations?${qs({ language })}`, REVALIDATE_DETAILS)
}

export const getNewShows = () => mediaList('tv', 'airing_today', true)
export const getPopularShows = () => mediaList('tv', 'popular')
export const getTopRatedShows = () => mediaList('tv', 'top_rated')
export const getUpcomingShows = () => mediaList('tv', 'on_the_air', true)

export const getThisWeekMovies = () => thisWeek('movie')
export const getThisWeekShows = () => thisWeek('tv')

async function thisWeek(kind: 'movie' | 'tv'): Promise<ApiResult<TrendingProps>> {
    const { language, region } = await getAppSettings()
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const dateField = kind === 'movie' ? 'primary_release_date' : 'first_air_date'
    const query = qs({
        language, region,
        [`${dateField}.gte`]: fmt(weekAgo),
        [`${dateField}.lte`]: fmt(today),
        sort_by: 'popularity.desc',
        'vote_count.gte': '10',
    })
    return taggedList(await getWrapper<TrendingProps>(`3/discover/${kind}?${query}`, REVALIDATE_LISTS), kind)
}

export async function getDetailsShow(id: number): Promise<ApiResult<ShowDetailsProps>> {
    const { language } = await getAppSettings()
    return getWrapper<ShowDetailsProps>(`3/tv/${id}?${qs({ language, append_to_response: 'watch/providers,videos', include_video_language: videoLanguages(language) })}`, REVALIDATE_DETAILS)
}

export async function getSimilarShows(id: number): Promise<ApiResult<MediaListProps>> {
    const { language } = await getAppSettings()
    return getWrapper<MediaListProps>(`3/tv/${id}/recommendations?${qs({ language })}`, REVALIDATE_DETAILS)
}

export async function getSeasonEpisodes(showId: number, season: number): Promise<ApiResult<SeasonDetails>> {
    const { language } = await getAppSettings()
    return getWrapper<SeasonDetails>(`3/tv/${showId}/season/${season}?${qs({ language })}`, REVALIDATE_DETAILS)
}

async function getGenresWithFallback(kind: 'movie' | 'tv'): Promise<ApiResult<{ genres: Genre[] }>> {
    const { language } = await getAppSettings()
    const result = await getWrapper<{ genres: Genre[] }>(`3/genre/${kind}/list?${qs({ language })}`, REVALIDATE_CONFIG)
    if (!result.data?.genres?.some((g) => !g.name)) return result

    const fallback = await getWrapper<{ genres: Genre[] }>(`3/genre/${kind}/list`, REVALIDATE_CONFIG)
    const fallbackNames = new Map((fallback.data?.genres ?? []).map((g) => [g.id, g.name]))
    return {
        ...result,
        data: {
            genres: result.data.genres.map((g) => (g.name ? g : { ...g, name: fallbackNames.get(g.id) ?? '' })),
        },
    }
}

export async function getMovieGenres(): Promise<ApiResult<{ genres: Genre[] }>> {
    return getGenresWithFallback('movie')
}

export async function getTvGenres(): Promise<ApiResult<{ genres: Genre[] }>> {
    return getGenresWithFallback('tv')
}

export const discoverMovies = (genreId: number, page = 1) => discover('movie', genreId, page)
export const discoverShows = (genreId: number, page = 1) => discover('tv', genreId, page)

async function discover(kind: 'movie' | 'tv', genreId: number, page: number): Promise<ApiResult<MediaListProps>> {
    const { language, region, include_adult } = await getAppSettings()
    const adult = include_adult ? 'true' : null
    const params = qs({ language, region, include_adult: adult, sort_by: 'popularity.desc', with_genres: String(genreId), page: String(page) })
    return getWrapper<MediaListProps>(`3/discover/${kind}?${params}`, REVALIDATE_LISTS)
}

export async function getWatchProviders(type: 'movie' | 'tv'): Promise<ApiResult<WatchProvider[]>> {
    const { language, region } = await getAppSettings()
    const result = await getWrapper<{ results: WatchProvider[] }>(
        `3/watch/providers/${type}?${qs({ language, watch_region: region })}`,
        REVALIDATE_CONFIG
    )
    return { data: result.data?.results ?? null, error: result.error }
}

export async function getSearch(query: string, page = 1): Promise<ApiResult<SearchProps>> {
    const { language, include_adult } = await getAppSettings()
    const adult = include_adult ? 'true' : null
    const url = `3/search/multi?${qs({ query, include_adult: adult, language, page: String(page) })}`
    return getWrapper<SearchProps>(url, REVALIDATE_SEARCH)
}

async function mediaList(kind: 'movie' | 'tv', endpoint: string, withTimezone = false): Promise<ApiResult<TrendingProps>> {
    const { language, region, timezone } = await getAppSettings()
    const query = qs({ language, region, timezone: withTimezone ? timezone : null })
    return taggedList(await getWrapper<TrendingProps>(`3/${kind}/${endpoint}?${query}`, REVALIDATE_LISTS), kind)
}

function taggedList(result: ApiResult<TrendingProps>, media_type: 'movie' | 'tv'): ApiResult<TrendingProps> {
    if (!result.data) return result
    return { ...result, data: { ...result.data, results: result.data.results.map(i => ({ ...i, media_type })) } }
}

function videoLanguages(language: string | undefined) {
    const langCode = language?.split('-')[0]
    return langCode && langCode !== 'en' ? `${langCode},en` : 'en'
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
