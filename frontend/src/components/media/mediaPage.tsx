import config from '@config'
import { formatRuntime, formatVotes } from '@/utils/format'
import Image from 'next/image'
import { Film, Globe, Image as ImageIcon, Star, Tv } from 'lucide-react'
import Link from 'next/link'
import ListTool from '@/components/watched/dialog'
import WatchedTool from '@/components/watched/watchedDialog'
import { TrailerButton } from '@/components/media/trailerButton'
import MediaSection from '@/components/media/mediaSection'
import SeasonSection from '@/components/media/seasonSection'
import SectionHeading from '@/components/media/sectionHeading'
import { WatchedProvider } from '@/components/watched/watchedContext'

type MediaPageProps = {
    item: MovieDetailsProps | ShowDetailsProps
    media: 'movie' | 'show'
    similar?: MediaListProps | null
    region?: string | null
    collection?: CollectionProps | null
    watchedInSimilar?: number
}

export default function MediaPage({ item, media, similar, region, collection, watchedInSimilar }: MediaPageProps) {
    const movie = media === 'movie' ? item as MovieDetailsProps : null
    const show  = media === 'show'  ? item as ShowDetailsProps  : null

    const activeRegion = region || config.setting.REGION
    const regionProviders = (item['watch/providers']?.results[activeRegion] ?? {}) as Record<string, unknown>
    const sortedProviders = Object.fromEntries(
        ['flatrate', 'rent', 'buy'].filter((k) => k in regionProviders).map((k) => [k, regionProviders[k]])
    )

    const releaseDate = new Date(movie?.release_date ?? show?.first_air_date ?? '').toLocaleDateString(config.setting.LANGUAGE)
    const title = movie?.title ?? show?.name ?? ''
    const originalTitle = movie?.original_title ?? show?.original_name
    const runtime = movie?.runtime ?? null
    const voteCount = item.vote_count ?? 0
    const seasons = show?.seasons.filter((s) => s.season_number > 0) ?? []

    const content = (
        <div className='relative w-full flex flex-col gap-6 -mt-4'>

            {item.backdrop_path && (
                <div className='absolute inset-x-0 top-0 bottom-0 -z-10 pointer-events-none overflow-hidden'>
                    <Image src={`${config.url.IMAGE_URL}${item.backdrop_path}`} alt='' fill className='object-cover object-top w-full h-full blur-3xl opacity-18 scale-110' />
                    <div className='absolute inset-0 bg-linear-to-b from-background/20 from-[20%] via-background/55 via-[55%] to-background/85' />
                </div>
            )}

            <div className='relative -mx-4 sm:-mx-5 overflow-hidden min-h-72 sm:min-h-[26rem] flex flex-col justify-end'>
                <div className='absolute inset-0'>
                    {item.backdrop_path && (
                        <Image
                            src={`${config.url.IMAGE_URL}${item.backdrop_path}`}
                            alt='' fill className='object-cover w-full h-full blur-sm opacity-20 scale-110'
                        />
                    )}
                    <div className='absolute inset-0 bg-black/25' />
                    <div className='absolute inset-0 bg-linear-to-b from-transparent from-10% via-background/35 via-70% to-background/80' />
                    <div className='absolute inset-0 bg-linear-to-r from-background/10 to-transparent hidden sm:block' />
                </div>
                <div className='relative z-10 px-4 sm:px-5 pb-8 pt-6'>
                    <div className='flex flex-col items-center sm:flex-row sm:items-end gap-5 sm:gap-8'>
                        <div className='relative aspect-[2/3] w-32 sm:w-44 md:w-52 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 shrink-0'>
                            {item.poster_path
                                ? <Image src={`${config.url.IMAGE_URL}${item.poster_path}`} alt={title} fill className='object-cover' />
                                : <div className='flex items-center justify-center h-full w-full'><ImageIcon className='w-full h-full p-8' /></div>}
                        </div>
                        <div className='flex flex-col gap-3 sm:pb-1 text-center sm:text-left flex-1 min-w-0'>
                            <div className='flex justify-center sm:justify-start'>
                                <span className='inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-brand uppercase'>
                                    {movie ? <><Film className='h-3 w-3' />Movie</> : <><Tv className='h-3 w-3' />TV Series</>}
                                </span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <h1 className='text-3xl sm:text-4xl font-bold leading-tight text-white drop-shadow-sm'>{title}</h1>
                                {originalTitle !== title && <p className='text-sm text-white/50'>{originalTitle}</p>}
                            </div>
                            <div className='flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 text-sm'>
                                <span className='text-white/65'>{releaseDate}</span>
                                {runtime != null && runtime > 0 && (
                                    <><span className='text-white/25 text-xs'>·</span><span className='text-white/65'>{formatRuntime(runtime)}</span></>
                                )}
                                {item.vote_average > 0 && (
                                    <><span className='text-white/25 text-xs'>·</span>
                                        <span className='flex items-center gap-1'>
                                            <Star className='h-3.5 w-3.5 fill-yellow-400 stroke-none shrink-0' />
                                            <span className='font-semibold text-white'>{item.vote_average.toFixed(1)}</span>
                                            <span className='text-white/40 text-xs'>/10</span>
                                            {voteCount > 0 && <span className='text-white/30 text-xs'>({formatVotes(voteCount)})</span>}
                                        </span></>
                                )}
                            </div>
                            {item.tagline && <p className='text-sm italic text-white/45 leading-snug'>&ldquo;{item.tagline}&rdquo;</p>}
                            {item.genres.length > 0 && (
                                <div className='flex flex-wrap justify-center sm:justify-start gap-1.5'>
                                    {item.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className={
                                                'px-2.5 py-0.5 bg-white/8 border border-white/12 rounded-full' +
                                                ' text-xs text-white/75 hover:bg-white/15 transition-colors cursor-default'
                                            }
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className='flex justify-center sm:justify-start items-center gap-2 pt-1'>
                                <ListTool tmdbId={item.id} mediaType={media} />
                                <WatchedTool tmdbID={item.id} mediaType={media} media={item} />
                                <TrailerButton videos={item.videos?.results ?? []} />
                                {item.homepage && (
                                    <Link href={item.homepage} target='_blank' rel='noopener noreferrer'
                                        className={
                                            'inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-white/20' +
                                            ' bg-white/5 text-white/75 hover:text-white hover:bg-white/12 text-sm font-medium transition-colors'
                                        }>
                                        <Globe className='h-3.5 w-3.5 shrink-0' />
                                        <span className='hidden xs:inline'>Website</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {item.overview && (
                <section className='flex flex-col gap-3'>
                    <SectionHeading>Overview</SectionHeading>
                    <div className='bg-card border border-border rounded-xl p-4 shadow-sm'>
                        <p className='text-sm leading-relaxed text-muted-foreground'>{item.overview}</p>
                    </div>
                </section>
            )}

            <section className='flex flex-col gap-3'>
                <SectionHeading>Where to Watch</SectionHeading>
                {Object.keys(sortedProviders).length > 0 ? (
                    <div className='bg-card border border-border rounded-xl overflow-hidden shadow-sm'>
                        {Object.entries(sortedProviders).map(([key, value], idx, arr) => (
                            <div key={key} className={`px-4 py-3.5 ${idx < arr.length - 1 ? 'border-b border-border' : ''}`}>
                                <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
                                    {key === 'flatrate' ? 'Stream' : key === 'buy' ? 'Buy' : 'Rent'}
                                </p>
                                <div className='flex flex-row gap-3 overflow-x-auto noscroll pb-0.5'>
                                    {Array.isArray(value) && value.map((provider, i) => (
                                        <div key={i} className='flex flex-col items-center gap-1.5 shrink-0'>
                                            <div className='relative w-11 h-11 rounded-xl overflow-hidden ring-1 ring-border/50 shadow-sm'>
                                                {provider.logo_path
                                                    ? <Image src={`${config.url.IMAGE_URL}${provider.logo_path}`} alt={provider.provider_name} fill className='object-cover' />
                                                    : <div className='flex items-center justify-center h-full w-full'><ImageIcon className='w-full h-full p-8' /></div>}
                                            </div>
                                            <span className='text-[10px] text-muted-foreground/80 max-w-14 truncate text-center leading-tight'>{provider.provider_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='bg-card border border-border rounded-xl p-4 shadow-sm'>
                        <p className='text-sm text-muted-foreground'>Not available for your region.</p>
                    </div>
                )}
            </section>

            {seasons.length > 0 && <SeasonSection showId={item.id} seasons={seasons} />}

            <section className='flex flex-col gap-3'>
                <SectionHeading>Details</SectionHeading>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='bg-card border border-border rounded-xl overflow-hidden shadow-sm'>
                        <p className='px-4 pt-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border'>General</p>
                        <div className='px-4 divide-y divide-border'>
                            <DetailRow label='Status'><StatusBadge status={item.status} /></DetailRow>
                            <DetailRow label='Language' value={item.original_language.toUpperCase()} />
                            <DetailRow label='Popularity' value={item.popularity.toFixed(0)} />
                            {movie ? (<>
                                {runtime != null && runtime > 0 && <DetailRow label='Runtime' value={formatRuntime(runtime)} />}
                                {movie.budget > 0 && <DetailRow label='Budget' value={`$${movie.budget.toLocaleString(config.setting.LANGUAGE)}`} />}
                                {movie.revenue > 0 && <DetailRow label='Revenue' value={`$${movie.revenue.toLocaleString(config.setting.LANGUAGE)}`} />}
                                {movie.imdb_id && (
                                    <DetailRow label='IMDB'>
                                        <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target='_blank' rel='noopener noreferrer' className='text-xs font-medium text-brand hover:text-brand-dim transition-colors'>{movie.imdb_id}</a>
                                    </DetailRow>
                                )}
                            </>) : show ? (<>
                                <DetailRow label='Seasons' value={show.number_of_seasons} />
                                <DetailRow label='Episodes' value={show.number_of_episodes} />
                                <DetailRow label='First Air' value={new Date(show.first_air_date).toLocaleDateString(config.setting.LANGUAGE)} />
                                <DetailRow label='Last Air' value={new Date(show.last_air_date).toLocaleDateString(config.setting.LANGUAGE)} />
                                {show.episode_run_time?.length > 0 && <DetailRow label='Runtime' value={`${show.episode_run_time.join(', ')} min`} />}
                                <DetailRow label='Type' value={show.type} />
                            </>) : null}
                        </div>
                    </div>
                    <div className='bg-card border border-border rounded-xl overflow-hidden shadow-sm'>
                        <p className='px-4 pt-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border'>Production</p>
                        <div className='px-4 py-3 flex flex-col gap-4'>
                            <InfoSection title='Companies' items={item.production_companies} />
                            <InfoSection title='Countries' items={item.production_countries} />
                            <InfoSection title='Languages' items={item.spoken_languages.map((l) => ({ id: l.iso_639_1, name: l.english_name }))} />
                            {show && (<>
                                <InfoSection title='Networks' items={show.networks} />
                                {show.created_by.length > 0 && <InfoSection title='Created By' items={show.created_by} />}
                            </>)}
                        </div>
                    </div>
                </div>
            </section>

            {collection && collection.parts.length > 0 && (
                <MediaSection
                    title={collection.name}
                    items={[...collection.parts].sort((a, b) => +new Date(a.release_date ?? '') - +new Date(b.release_date ?? ''))}
                    type='movie'
                />
            )}

            {similar && similar.results.length > 0 && (
                <MediaSection
                    title={
                        <span className='flex items-center gap-2'>
                            More Like This
                            {watchedInSimilar != null && watchedInSimilar > 0 && (
                                <span className='text-xs font-normal text-brand'>{watchedInSimilar} watched</span>
                            )}
                        </span>
                    }
                    items={similar}
                    type={media}
                />
            )}
        </div>
    )

    return show ? <WatchedProvider show={show} seasons={seasons}>{content}</WatchedProvider> : content
}

const STATUS_COLORS: Record<string, string> = {
    'Released': 'bg-emerald-500', 'Returning Series': 'bg-brand',
    'In Production': 'bg-amber-400', 'Post Production': 'bg-sky-400',
    'Planned': 'bg-sky-500', 'Ended': 'bg-muted-foreground/50', 'Canceled': 'bg-destructive',
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className='flex items-center gap-1.5 text-xs font-medium text-foreground/85'>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_COLORS[status] ?? 'bg-muted-foreground/40'}`} />
            {status}
        </span>
    )
}

function DetailRow({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) {
    if (!children && (value == null || value === '')) return null
    return (
        <div className='flex items-center justify-between py-2.5 min-h-10 gap-4'>
            <span className='text-xs text-muted-foreground shrink-0'>{label}</span>
            <div className='text-right'>
                {children ?? <span className='text-xs font-medium text-foreground/90'>{String(value)}</span>}
            </div>
        </div>
    )
}

function InfoSection({ title, items }: { title: string; items: Array<{ id?: number | string; name: string }> | undefined }) {
    if (!items?.length) return null
    return (
        <div className='flex flex-col gap-1.5'>
            <p className='text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider'>{title}</p>
            <div className='flex flex-wrap gap-1'>
                {items.map((item, i) => (
                    <span key={item.id ?? i} className='text-xs bg-muted/50 border border-border/50 text-foreground/75 px-2 py-0.5 rounded-md'>{item.name}</span>
                ))}
            </div>
        </div>
    )
}
