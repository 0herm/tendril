'use client'

import config from '@config'
import LoadImage from '@components/loadImage/loadimage'
import { getWatchedById, updateWatchedSeasons } from '@/utils/clientApi'
import { useState } from 'react'

type Props = {
    showId: number
    seasons: Season[]
}

export default function SeasonSection({ showId, seasons }: Props) {
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [loading, setLoading] = useState(false)

    async function handleSeasonClick(seasonNumber: number) {
        if (selectedSeason === seasonNumber) {
            setSelectedSeason(null)
            setEpisodes([])
            return
        }
        setLoading(true)
        setSelectedSeason(seasonNumber)
        const res = await fetch(`/api/shows/${showId}/seasons/${seasonNumber}`)
        const json: ApiResult<SeasonDetails> = await res.json()
        setEpisodes(json.data?.episodes ?? [])
        setLoading(false)
    }

    async function handleWatchedUpTo(episodeNumber: number, seasonNumber: number) {
        const watched = await getWatchedById(showId)
        if (!watched.data) return
        const existingSeasons = watched.data.watched_seasons ?? []
        const existingCounts = watched.data.episode_counts ?? []
        const seasonIdx = seasonNumber - 1
        const updatedSeasons = existingSeasons.includes(seasonNumber)
            ? existingSeasons
            : [...existingSeasons, seasonNumber]
        const updatedCounts = [...existingCounts]
        updatedCounts[seasonIdx] = episodeNumber
        await updateWatchedSeasons(showId, updatedSeasons, updatedCounts)
    }

    return (
        <section className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
                <h2 className='text-sm font-semibold tracking-tight text-foreground shrink-0 flex items-baseline gap-1'>
                    Seasons
                    <span className='ml-1.5 font-normal text-muted-foreground'>{seasons.length}</span>
                </h2>
                <div className='flex-1 h-px bg-border/60' />
            </div>

            <div className='-mx-4 sm:-mx-5 px-4 sm:px-5 flex gap-3 overflow-x-auto noscroll pb-1'>
                {seasons.map((season) => (
                    <button
                        key={season.id}
                        onClick={() => handleSeasonClick(season.season_number)}
                        className={
                            'flex-none w-28 sm:w-32 bg-card border rounded-xl ' +
                            'overflow-hidden shadow-sm hover:shadow-md transition-all group text-left ' +
                            (selectedSeason === season.season_number
                                ? 'border-brand/60 ring-1 ring-brand/30'
                                : 'border-border hover:border-brand/40')
                        }
                    >
                        <div className='relative aspect-[2/3] w-full bg-muted overflow-hidden'>
                            <LoadImage
                                source={season.poster_path ? `${config.url.IMAGE_URL}${season.poster_path}` : ''}
                                error={season.poster_path}
                                className='object-cover transition-transform duration-300 group-hover:scale-[1.03]'
                                fill={true}
                            />
                        </div>
                        <div className='p-2.5 flex flex-col gap-0.5'>
                            <p className='font-medium text-xs leading-snug truncate'>{season.name}</p>
                            <p className='text-[10px] text-muted-foreground'>
                                {season.episode_count} eps
                                {season.air_date ? ` · ${season.air_date.split('-')[0]}` : ''}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {selectedSeason !== null && (
                <div className='bg-card border border-border rounded-xl overflow-hidden shadow-sm'>
                    {loading ? (
                        <div className='p-4 flex flex-col gap-2'>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className='h-14 bg-muted animate-pulse rounded-lg' />
                            ))}
                        </div>
                    ) : (
                        <div className='divide-y divide-border'>
                            {episodes.map((ep) => (
                                <div key={ep.episode_number} className='flex items-center gap-3 px-4 py-3'>
                                    {ep.still_path && (
                                        <div className='relative w-20 aspect-video rounded-md overflow-hidden shrink-0 bg-muted'>
                                            <LoadImage
                                                source={`${config.url.IMAGE_URL}${ep.still_path}`}
                                                error={ep.still_path}
                                                className='object-cover'
                                                fill={true}
                                            />
                                        </div>
                                    )}
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-xs font-medium truncate'>
                                            {ep.episode_number}. {ep.name}
                                        </p>
                                        {ep.air_date && (
                                            <p className='text-[10px] text-muted-foreground mt-0.5'>{ep.air_date}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleWatchedUpTo(ep.episode_number, selectedSeason)}
                                        className='shrink-0 text-[10px] font-medium text-brand hover:text-brand-dim transition-colors px-2 py-1 rounded-md hover:bg-brand/8'
                                    >
                                        Watched up to here
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
