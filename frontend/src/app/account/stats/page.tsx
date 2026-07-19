import { getAllWatched } from '@/utils/queries'
import { getDetailsMovie, getDetailsShow } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { Film, Tv, Clock, Tag, Calendar } from 'lucide-react'
import { formatRuntime } from '@/utils/format'

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

export default async function Page() {
    const userId = await getSessionUserId()
    if (!userId) redirect('/passkey/login')

    const { data: watchedData } = await getAllWatched()
    const watched = watchedData ?? []

    const rawDetails = await fetchAllDetails(watched)
    const details = rawDetails.filter(Boolean) as { item: WatchedProps; details: MovieDetailsProps | ShowDetailsProps }[]

    const movies = details.filter((d) => d.item.type === 'movie') as { item: WatchedProps; details: MovieDetailsProps }[]
    const shows = details.filter((d) => d.item.type === 'show') as { item: WatchedProps; details: ShowDetailsProps }[]

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
            for (const seasonNum of watchedSeasons) {
                const season = d.seasons.find((s) => s.season_number === seasonNum)
                episodesWatched += season?.episode_count ?? 0
            }
        }
        totalMinutes += avgEpRuntime * episodesWatched
    }

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
        <div className='w-full flex flex-col gap-8 max-w-xl'>
            <div className='flex flex-col gap-1'>
                <h1 className='display text-2xl sm:text-3xl font-bold'>Stats</h1>
                <p className='text-xs text-muted-foreground/70'>Your watching history at a glance.</p>
            </div>

            {isEmpty ? (
                <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60'>
                        <Film className='h-6 w-6 text-muted-foreground/40' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <p className='text-sm font-semibold'>No watch history yet</p>
                        <p className='text-xs text-muted-foreground/60 max-w-xs leading-relaxed'>Mark titles as watched to see your stats here.</p>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col gap-8'>
                    <div className='grid grid-cols-3 gap-3'>
                        <StatCard icon={<Film className='h-4 w-4' />} label='Movies' value={movies.length} />
                        <StatCard icon={<Tv className='h-4 w-4' />} label='Shows' value={shows.length} />
                        <StatCard
                            icon={<Clock className='h-4 w-4' />}
                            label='Time Watched'
                            value={formatRuntime(totalMinutes)}
                            mono
                        />
                    </div>

                    <BarList icon={Tag} title='Top Genres' items={topGenres} max={maxGenreCount} labelClassName='text-sm text-foreground/80 w-28 shrink-0 truncate' />
                    <BarList
                        icon={Calendar} title='By Year' items={topYears}
                        max={maxYearCount} labelClassName='text-sm font-medium text-foreground/80 w-10 shrink-0 tabular-nums'
                    />
                </div>
            )}
        </div>
    )
}

function StatCard({ icon, label, value, mono = false }: {
    icon: React.ReactNode
    label: string
    value: string | number
    mono?: boolean
}) {
    return (
        <div className='flex flex-col gap-4 rounded-2xl bg-surface-1 border border-border/60 p-4 sm:p-5'>
            <div className='flex items-start justify-between gap-2'>
                <span className='text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50 leading-tight'>{label}</span>
                <div className='text-ambient/50 shrink-0 mt-0.5'>{icon}</div>
            </div>
            <span className={`display text-3xl font-black leading-none text-foreground ${mono ? 'tabular-nums' : ''}`}>
                {value}
            </span>
        </div>
    )
}

function BarList({ icon: Icon, title, items, max, labelClassName }: {
    icon: React.ElementType
    title: string
    items: [string, number][]
    max: number
    labelClassName: string
}) {
    if (!items.length) return null
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
                <Icon className='h-3 w-3 text-ambient/60' />
                <h2 className='text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground'>{title}</h2>
            </div>
            <div className='divide-y divide-border/60'>
                {items.map(([label, count], i) => (
                    <div key={label} className='flex items-center gap-3 py-2.5'>
                        <span className={labelClassName}>{label}</span>
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                            <div className='flex-1 h-1.5 rounded-full bg-muted/80 overflow-hidden'>
                                <div
                                    className={
                                        'h-full rounded-full origin-left ' +
                                        'bg-linear-to-r from-brand/50 to-ambient/80 ' +
                                        'animate-[bar-grow_600ms_var(--ease-out)_both]'
                                    }
                                    style={{ width: `${(count / max) * 100}%`, animationDelay: `${i * 45}ms` }}
                                />
                            </div>
                            <span className='text-xs text-muted-foreground/60 w-5 text-right shrink-0 tabular-nums'>{count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
