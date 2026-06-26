'use client'

import { Button } from '@/ui/button'
import { useWatched } from './watchedContext'

// Dialog body (season grid + episode selector + actions). Must be rendered inside a WatchedProvider.
export function WatchedSeasonsBody() {
    const ctx = useWatched()
    if (!ctx) return null
    if (ctx.watchedLoading) return <WatchedSeasonsSkeleton />

    const pickerSeason = ctx.lastWatchedSeason > 0 ? ctx.lastWatchedSeason : (ctx.seasons[0]?.season_number ?? 0)

    return (
        <>
            <div className='px-5 pt-4 grid grid-cols-2 xs:grid-cols-3 gap-2 max-h-64 overflow-y-auto noscroll'>
                {ctx.seasons.map((season) => (
                    <Button
                        key={season.id}
                        variant={ctx.isSeasonWatched(season.season_number) ? 'default' : 'secondary'}
                        onClick={() => ctx.toggleSeason(season.season_number)}
                    >
                        Season {season.season_number}
                    </Button>
                ))}
            </div>
            {pickerSeason > 0 && (
                <div className='px-5 pt-4'>
                    <p className='text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em] mb-2'>
                        Season {pickerSeason} episodes
                    </p>
                    {ctx.airedEpisodeCount(pickerSeason) > 0 ? (
                        <div className='flex flex-wrap gap-1.5 max-h-32 overflow-y-auto noscroll'>
                            {Array.from({ length: ctx.airedEpisodeCount(pickerSeason) }, (_, i) => i + 1).map((ep) => {
                                const watched = ep <= ctx.watchedUpTo(pickerSeason)
                                return (
                                    <Button
                                        key={ep}
                                        size='icon'
                                        variant={watched ? 'default' : 'secondary'}
                                        className='size-9 text-xs'
                                        onClick={() =>
                                            ctx.setWatchedUpTo(
                                                pickerSeason,
                                                ep === ctx.watchedUpTo(pickerSeason) ? ep - 1 : ep
                                            )
                                        }
                                    >
                                        {ep}
                                    </Button>
                                )
                            })}
                        </div>
                    ) : (
                        <p className='text-xs text-muted-foreground'>No episodes have aired yet.</p>
                    )}
                </div>
            )}
            <div className='px-5 py-4 flex gap-2 border-t border-border/60 mt-2'>
                <Button variant='outline' className='flex-1' onClick={() => ctx.setAllSeasons()}>
                    All Seasons
                </Button>
                <Button variant='destructive' className='flex-1' onClick={() => ctx.clearAll()}>
                    Clear All
                </Button>
            </div>
        </>
    )
}

// Placeholder shown while the show's details are still loading, so the dialog feels instant.
export function WatchedSeasonsSkeleton() {
    return (
        <>
            <div className='px-5 pt-4 grid grid-cols-2 xs:grid-cols-3 gap-2'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='h-9 rounded-md bg-muted animate-pulse' />
                ))}
            </div>
            <div className='px-5 pt-4'>
                <div className='h-3 w-24 bg-muted animate-pulse rounded mb-2' />
                <div className='flex flex-wrap gap-1.5'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className='size-9 rounded-md bg-muted animate-pulse' />
                    ))}
                </div>
            </div>
            <div className='px-5 py-4 flex gap-2 border-t border-border/60 mt-2'>
                <div className='h-9 flex-1 bg-muted animate-pulse rounded-md' />
                <div className='h-9 flex-1 bg-muted animate-pulse rounded-md' />
            </div>
        </>
    )
}
