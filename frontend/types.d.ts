type MediaType = 'movie' | 'show'

type ApiResult<T> = {
    data: T | null
    error: string | null
}

type MediaItemProps = TrendingItemProps | ShowDetailsProps | MovieDetailsProps

type MediaListProps = {
    page: number
    total_pages: number
    total_results: number
    results: MediaItemProps[]
}

type ListProps = { id: number; name: string; created_at: string }

type UserProps = {
    id: number
    region: string
    language: string
    original_title: boolean
    include_adult: boolean
    timezone: string
    subscription?: string | null
}

type UserSettingsProps = Pick<UserProps, 'region' | 'language' | 'original_title' | 'include_adult' | 'timezone'>

type MediaProps = { id: number; tmdb_id: number; type: 'movie' | 'show'; added_at: string; list_id: number }

type TrendingItemProps = {
    adult: boolean
    backdrop_path: string
    id: number
    title?: string
    name?: string
    original_language: string
    original_title?: string
    original_name?: string
    overview: string
    poster_path: string
    media_type: string
    genre_ids: number[]
    popularity: number
    release_date: string
    video: boolean
    vote_average: number
    vote_count: number
}

type TrendingProps = {
    page: number
    total_pages: number
    total_results: number
    results: TrendingItemProps[]
}

type SearchProps = TrendingProps

// Shared sub-types
type Genre = { id: number; name: string }
type NamedEntity = { id: number; logo_path: string | null; name: string; origin_country: string }
type ProductionCountry = { iso_3166_1: string; name: string }
type SpokenLanguage = { english_name: string; iso_639_1: string; name: string }
type WatchProviders = {
    results: {
        [region: string]: {
            link: string
            [key in 'flatrate' | 'buy' | 'rent']?: { display_priority: number; logo_path: string; provider_id: number; provider_name: string }[]
        }
    }
} | null

type VideoItem = {
    id: string; iso_639_1: string; iso_3166_1: string; key: string; name: string
    official: boolean; published_at: string; site: string; size: number; type: string
}

type Season = {
    air_date: string; episode_count: number; id: number; name: string
    overview: string; poster_path: string | null; season_number: number; vote_average: number
}

type Episode = {
    episode_number: number; name: string; overview: string
    still_path: string | null; air_date: string; runtime: number | null
}

type SeasonDetails = { episodes: Episode[] }

type MovieDetailsProps = {
    media_type: 'movie'
    adult: boolean
    backdrop_path: string
    belongs_to_collection: { id: number; name: string; poster_path: string | null; backdrop_path: string | null } | null
    budget: number
    genres: Genre[]
    homepage: string | null
    id: number
    imdb_id: string | null
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: NamedEntity[]
    production_countries: ProductionCountry[]
    release_date: string
    revenue: number
    runtime: number | null
    spoken_languages: SpokenLanguage[]
    status: string
    tagline: string | null
    title: string
    video: boolean
    vote_average: number
    vote_count: number
    'watch/providers': WatchProviders
    videos?: { results: VideoItem[] }
}

type ShowDetailsProps = {
    media_type: 'show'
    adult: boolean
    backdrop_path: string
    created_by: { id: number; credit_id: string; name: string; gender: number; profile_path: string | null }[]
    episode_run_time: number[]
    first_air_date: string
    genres: Genre[]
    homepage: string | null
    id: number
    in_production: boolean
    languages: string[]
    last_air_date: string
    last_episode_to_air: {
        id: number; name: string; overview: string; vote_average: number; vote_count: number
        air_date: string; episode_number: number; production_code: string | null
        runtime: number | null; season_number: number; show_id: number; still_path: string | null
    } | null
    name: string
    next_episode_to_air: { id: number; name: string; season_number: number; episode_number: number; air_date: string } | null
    networks: NamedEntity[]
    number_of_episodes: number
    number_of_seasons: number
    origin_country: string[]
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: NamedEntity[]
    production_countries: ProductionCountry[]
    seasons: Season[]
    spoken_languages: SpokenLanguage[]
    status: string
    tagline: string | null
    type: string
    vote_average: number
    vote_count: number
    'watch/providers': WatchProviders
    videos?: { results: VideoItem[] }
}

type CollectionProps = {
    id: number; name: string; overview: string
    poster_path: string | null; backdrop_path: string | null; parts: TrendingItemProps[]
}

type Country = { iso_3166_1: string; english_name: string; native_name: string }
type Language = { iso_639_1: string; english_name: string; name: string }
type Timezone = { iso_3166_1: string; zones: string[] }

type WatchedProps = {
    id: number
    tmdb_id: number
    type: 'movie' | 'show'
    added_at: string
    name: string
    watched_seasons: number[]
    total_seasons?: number
    show_status?: string
    episode_counts?: number[]
}

interface NotificationEntry {
    id: number; type: string; tmdb_id: number
    notif_title: string; notif_body: string; notif_url: string | null; sent_at: string
}
