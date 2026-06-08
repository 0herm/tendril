type MediaType = 'movie' | 'show' 

type ApiResult<T> = {
    data: T | null
    error: string | null
}

type MediaItemProps = TrendingItemProps | ShowDetailsProps | MovieDetailsProps | SearchItemProps

type MediaListProps = {
    page: number
    total_pages: number
    total_results: number
    results: MediaItemProps[]
}

type ListProps = {
    id: number
    name: string
    created_at: string
}

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

type MediaProps = {
    id: number
    tmdb_id: number
    type: 'movie' | 'show'
    added_at: string
    list_id: number
}

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

type NewMoviesProps = {
    page: number
    total_pages: number
    total_results: number
    dates: {
        maximum: string
        minimum: string
    }
    results: NewMovieProps[]
}

type NewMovieProps = {
    adult: boolean
    backdrop_path: string
    id: number
    title: string
    original_language: string
    original_title: string
    overview: string
    poster_path: string
    media_type: 'movie'
    genre_ids: number[]
    popularity: number
    release_date: string
    video: boolean
    vote_average: number
    vote_count: number
}

type MovieDetailsProps = {
    media_type: 'movie'
    adult: boolean
    backdrop_path: string
    belongs_to_collection: {
        id: number
        name: string
        poster_path: string | null
        backdrop_path: string | null
    } | null
    budget: number
    genres: {
        id: number
        name: string
    }[]
    homepage: string | null
    id: number
    imdb_id: string | null
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: {
        id: number
        logo_path: string | null
        name: string
        origin_country: string
    }[]
    production_countries: {
        iso_3166_1: string
        name: string
    }[]
    release_date: string
    revenue: number
    runtime: number | null
    spoken_languages: {
        english_name: string
        iso_639_1: string
        name: string
    }[]
    status: string
    tagline: string | null
    title: string
    video: boolean
    vote_average: number
    vote_count: number
    'watch/providers': {
        results: {
            [key: string]: {
                link: string
                [key in 'flatrate' | 'buy' | 'rent']: {
                    display_priority: number
                    logo_path: string
                    provider_id: number
                    provider_name: string
                }[]
            }
        }
    } | null
    videos?: { results: VideoItem[] }
}

type ShowDetailsProps = {
    media_type: 'show'
    adult: boolean
    backdrop_path: string
    created_by: {
        id: number
        credit_id: string
        name: string
        gender: number
        profile_path: string | null
    }[]
    episode_run_time: number[]
    first_air_date: string
    genres: {
        id: number
        name: string
    }[]
    homepage: string | null
    id: number
    in_production: boolean
    languages: string[]
    last_air_date: string
    last_episode_to_air: {
        id: number
        name: string
        overview: string
        vote_average: number
        vote_count: number
        air_date: string
        episode_number: number
        production_code: string | null
        runtime: number | null
        season_number: number
        show_id: number
        still_path: string | null
    } | null
    name: string
    next_episode_to_air: {
        id: number
        name: string
        season_number: number
        episode_number: number
        air_date: string
    } | null
    networks: {
        id: number
        logo_path: string | null
        name: string
        origin_country: string
    }[]
    number_of_episodes: number
    number_of_seasons: number
    origin_country: string[]
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: {
        id: number
        logo_path: string | null
        name: string
        origin_country: string
    }[]
    production_countries: {
        iso_3166_1: string
        name: string
    }[]
    seasons: {
        air_date: string
        episode_count: number
        id: number
        name: string
        overview: string
        poster_path: string | null
        season_number: number
        vote_average: number
    }[]
    spoken_languages: {
        english_name: string
        iso_639_1: string
        name: string
    }[]
    status: string
    tagline: string | null
    type: string
    vote_average: number
    vote_count: number
    'watch/providers': {
        results: {
            [key: string]: {
                link: string
                [key in 'flatrate' | 'buy' | 'rent']: {
                    display_priority: number
                    logo_path: string
                    provider_id: number
                    provider_name: string
                }[]
            }
        }
    } | null
    videos?: { results: VideoItem[] }
}

type SearchItemProps = {
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

type SearchProps = {
    page: number
    results: SearchItemProps[]
    total_pages: number
    total_results: number
}

type Country = {
    iso_3166_1: string
    english_name: string
    native_name: string
}

type Language = {
    iso_639_1: string
    english_name: string
    name: string
}

type Timezone = {
    iso_3166_1: string
    zones: string[]
}

type VideoItem = {
    id: string
    iso_639_1: string
    iso_3166_1: string
    key: string
    name: string
    official: boolean
    published_at: string
    site: string
    size: number
    type: string
}

type CollectionProps = {
    id: number
    name: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    parts: TrendingItemProps[]
}

type WatchedProps = {
    id: number
    tmdb_id: number
    type: 'movie' | 'show'
    added_at: string
    name: string
    watched_seasons?: number[]
    total_seasons?: number
    show_status?: string
    episode_counts?: number[]
}