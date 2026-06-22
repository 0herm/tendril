import { getContinueWatching } from '@/utils/api'
import { getDetailsShow } from '@/utils/tmdbApi'

export async function getFilteredContinueWatching(): Promise<ShowDetailsProps[]> {
    const { data } = await getContinueWatching()
    if (!data?.length) return []

    const withDetails = (await Promise.all(
        data.map(async (item) => {
            const { data: details } = await getDetailsShow(item.tmdb_id)
            return details
                ? { details, watchedSeasons: item.watched_seasons ?? [], episodeCounts: item.episode_counts ?? [] }
                : null
        })
    )).filter((r): r is NonNullable<typeof r> => r !== null)

    const today = new Date()

    return withDetails
        .filter(({ details, watchedSeasons, episodeCounts }) => {
            const show = details

            // Has an unwatched season with aired episodes
            if (show.seasons.some(
                (s) => s.season_number > 0
                    && !watchedSeasons.includes(s.season_number)
                    && s.episode_count > 0
                    && !!s.air_date
                    && new Date(s.air_date) <= today
            )) return true

            // A watched season has new aired episodes since last save
            if (show.seasons.some((s) => {
                const idx = watchedSeasons.indexOf(s.season_number)
                if (idx === -1) return false
                const stored = episodeCounts[idx]
                if (!stored) return false
                const lastEp = show.last_episode_to_air
                const airedCount = lastEp?.season_number === s.season_number ? lastEp.episode_number : s.episode_count
                return airedCount > stored
            })) return true

            // Next episode just aired in a season the user is watching
            if (show.next_episode_to_air) {
                const { season_number, air_date } = show.next_episode_to_air
                if (watchedSeasons.includes(season_number) && new Date(air_date) <= today) return true
            }

            return false
        })
        .map((r) => ({ ...r.details, media_type: 'tv' } as unknown as ShowDetailsProps)) as ShowDetailsProps[]
}
