'use client'

import config from '@config'
import Image from 'next/image'
import SectionHeading from '@/components/media/sectionHeading'
import { useWatched } from '@/components/watched/watchedContext'
import { Check, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

type Props = {
    showId: number
    seasons: Season[]
}

export default function SeasonSection({ showId, seasons }: Props) {
    const ctx = useWatched()
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

    return (
        <section className='flex flex-col gap-3'>
            <SectionHeading count={seasons.length}>Seasons</SectionHeading>

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
                            {season.poster_path
                                ? <Image
                                    src={`${config.url.IMAGE_URL}${season.poster_path}`}
                                    alt={season.name} fill
                                    className='object-cover transition-transform duration-300 group-hover:scale-[1.03]'
                                />
                                : <div className='flex items-center justify-center h-full w-full'><ImageIcon className='w-full h-full p-8' /></div>}
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
                            {episodes.map((ep) => {
                                const isWatched = ep.episode_number <= (ctx?.watchedUpTo(selectedSeason) ?? 0)
                                return (
                                    <div key={ep.episode_number} className='flex items-center gap-3 px-4 py-3'>
                                        {ep.still_path && (
                                            <div className='relative w-20 aspect-video rounded-md overflow-hidden shrink-0 bg-muted'>
                                                <Image src={`${config.url.IMAGE_URL}${ep.still_path}`} alt={ep.name} fill className='object-cover' />
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
                                        {isWatched ? (
                                            <span className='shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-brand px-2 py-1'>
                                                <Check className='h-3 w-3' />
                                                Watched
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => ctx?.setWatchedUpTo(selectedSeason, ep.episode_number)}
                                                className='shrink-0 text-[10px] font-medium text-brand hover:text-brand-dim transition-colors px-2 py-1 rounded-md hover:bg-brand/8'
                                            >
                                                Watched up to here
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
