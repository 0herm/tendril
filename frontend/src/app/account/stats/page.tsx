import { getAllWatched } from '@/utils/api'
import { getDetailsMovie, getDetailsShow } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { Film, Tv, Clock, Tag, Calendar } from 'lucide-react'

async function fetchAllDetails(watched: WatchedProps[]) {
    return Promise.all(
        watched.map(async (item) => {
            if (item.type === 'movie') {
                const { data } = await getDetailsMovie(item.tmdb_id)
                return data ? { item, details: data as MovieDetailsProps } : null
            }
            const { data } = await getDetailsShow(item.tmdb_id)
            return data ? { item, details: data as ShowDetailsProps } : null
        })
    )
}

function formatHours(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
}

export default async function Page() {
    const userId = await getSessionUserId()
    if (!userId) redirect('/passkey/login')

    const { data: watchedData } = await getAllWatched()
    const watched = watchedData ?? []

    const rawDetails = await fetchAllDetails(watched)
    const details = rawDetails.filter(Boolean) as { item: WatchedProps; details: MovieDetailsProps | ShowDetailsProps }[]

    // Movie stats
    const movies = details.filter((d) => d.item.type === 'movie') as { item: WatchedProps; details: MovieDetailsProps }[]
    const shows = details.filter((d) => d.item.type === 'show') as { item: WatchedProps; details: ShowDetailsProps }[]

    // Total minutes watched
    let totalMinutes = 0
    for (const { details: d } of movies) {
        totalMinutes += d.runtime ?? 0
    }
    for (const { item, details: d } of shows) {
        const avgEpRuntime = d.episode_run_time?.[0] ?? 45
        const watchedSeasons = item.watched_seasons ?? []
        let episodesWatched = 0
        if ((item.episode_counts ?? []).length > 0) {
            episodesWatched = item.episode_counts!.reduce((a, b) => a + b, 0)
        } else {
            // Fall back to TMDB season data
            for (const seasonNum of watchedSeasons) {
                const season = d.seasons.find((s) => s.season_number === seasonNum)
                episodesWatched += season?.episode_count ?? 0
            }
        }
        totalMinutes += avgEpRuntime * episodesWatched
    }

    // Genre tally
    const genreCounts: Record<string, number> = {}
    for (const { details: d } of details) {
        for (const g of d.genres ?? []) {
            genreCounts[g.name] = (genreCounts[g.name] ?? 0) + 1
        }
    }
    const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    const maxGenreCount = topGenres[0]?.[1] ?? 1

    // Year tally
    const yearCounts: Record<string, number> = {}
    for (const { details: d } of details) {
        const dateStr = 'release_date' in d ? d.release_date : d.first_air_date
        const year = dateStr ? new Date(dateStr).getFullYear().toString() : null
        if (year && year !== 'NaN') yearCounts[year] = (yearCounts[year] ?? 0) + 1
    }
    const topYears = Object.entries(yearCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
    const maxYearCount = topYears[0]?.[1] ?? 1

    const isEmpty = watched.length === 0

    return (
        <div className='w-full flex flex-col gap-6 max-w-xl'>
            <div className='flex flex-col gap-0.5'>
                <h1 className='text-lg font-semibold'>Stats</h1>
                <p className='text-xs text-muted-foreground'>Your watching history at a glance.</p>
            </div>

            {isEmpty ? (
                <div className='flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-border bg-card'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-muted'>
                        <Film className='h-6 w-6 text-muted-foreground' />
                    </div>
                    <p className='text-sm text-muted-foreground'>Mark some titles as watched to see your stats.</p>
                </div>
            ) : (
                <div className='flex flex-col gap-6'>
                    {/* Overview */}
                    <div className='grid grid-cols-3 gap-3'>
                        <StatCard icon={<Film className='h-4 w-4' />} label='Movies' value={movies.length} />
                        <StatCard icon={<Tv className='h-4 w-4' />} label='Shows' value={shows.length} />
                        <StatCard
                            icon={<Clock className='h-4 w-4' />}
                            label='Watched'
                            value={formatHours(totalMinutes)}
                            mono
                        />
                    </div>

                    {/* Genres */}
                    {topGenres.length > 0 && (
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center gap-2'>
                                <Tag className='h-3.5 w-3.5 text-muted-foreground' />
                                <h2 className='text-sm font-semibold tracking-tight text-foreground'>Genres</h2>
                            </div>
                            <div className='rounded-xl border border-border bg-card overflow-hidden'>
                                {topGenres.map(([genre, count], i) => (
                                    <div
                                        key={genre}
                                        className={`flex items-center gap-3 px-4 py-2.5 ${i < topGenres.length - 1 ? 'border-b border-border' : ''}`}
                                    >
                                        <span className='text-sm text-foreground min-w-0 flex-1 truncate'>{genre}</span>
                                        <div className='flex items-center gap-2.5 shrink-0'>
                                            <div className='w-20 h-1.5 rounded-full bg-muted overflow-hidden'>
                                                <div
                                                    className='h-full rounded-full bg-brand'
                                                    style={{ width: `${(count / maxGenreCount) * 100}%` }}
                                                />
                                            </div>
                                            <span className='text-xs text-muted-foreground w-4 text-right'>{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Years */}
                    {topYears.length > 0 && (
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center gap-2'>
                                <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
                                <h2 className='text-sm font-semibold tracking-tight text-foreground'>Most Watched Year</h2>
                            </div>
                            <div className='rounded-xl border border-border bg-card overflow-hidden'>
                                {topYears.map(([year, count], i) => (
                                    <div
                                        key={year}
                                        className={`flex items-center gap-3 px-4 py-2.5 ${i < topYears.length - 1 ? 'border-b border-border' : ''}`}
                                    >
                                        <span className='text-sm font-medium text-foreground shrink-0'>{year}</span>
                                        <div className='flex items-center gap-2.5 flex-1 min-w-0'>
                                            <div className='flex-1 h-1.5 rounded-full bg-muted overflow-hidden'>
                                                <div
                                                    className='h-full rounded-full bg-brand'
                                                    style={{ width: `${(count / maxYearCount) * 100}%` }}
                                                />
                                            </div>
                                            <span className='text-xs text-muted-foreground w-4 text-right shrink-0'>{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function StatCard({
    icon,
    label,
    value,
    mono = false,
}: {
    icon: React.ReactNode
    label: string
    value: string | number
    mono?: boolean
}) {
    return (
        <div className='flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm'>
            <div className='flex items-center gap-1.5 text-muted-foreground'>
                {icon}
                <span className='text-xs font-medium'>{label}</span>
            </div>
            <span className={`text-2xl font-bold text-foreground ${mono ? 'tabular-nums' : ''}`}>{value}</span>
        </div>
    )
}
