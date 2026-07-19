import config from '@config'
import { formatRuntime, formatVotes } from '@/utils/format'
import Image from 'next/image'
import { Film, Globe, Image as ImageIcon, Star, Tv } from 'lucide-react'
import Link from 'next/link'
import ListTool from '@/components/watched/dialog'
import WatchedTool from '@/components/watched/watchedDialog'
import { TrailerButton } from '@/components/media/trailerButton'
import ExpandableText from '@/components/media/expandableText'
import HeroBackdrop from '@/components/media/heroBackdrop'
import MediaSection from '@/components/media/mediaSection'
import SeasonSection from '@/components/media/seasonSection'
import SectionHeading from '@/components/media/sectionHeading'
import { WatchedProvider } from '@/components/watched/watchedContext'
import { ChipLabel } from '@/ui/chip'
import BackButton from '@/components/nav/backButton'

type MediaPageProps = {
    item: MovieDetailsProps | ShowDetailsProps
    media: 'movie' | 'show'
    similar?: MediaListProps | null
    region?: string | null
    language?: string | null
    collection?: CollectionProps | null
    watchedInSimilar?: number
    ambient?: string | null
}

export default function MediaPage({ item, media, similar, region, language, collection, watchedInSimilar, ambient }: MediaPageProps) {
    const movie = media === 'movie' ? item as MovieDetailsProps : null
    const show  = media === 'show'  ? item as ShowDetailsProps  : null

    const activeRegion   = region   || 'GB'
    const activeLanguage = language || 'en-GB'
    const regionProviders = (item['watch/providers']?.results[activeRegion] ?? {}) as Record<string, unknown>
    const sortedProviders = Object.fromEntries(
        ['flatrate', 'rent', 'buy'].filter((k) => k in regionProviders).map((k) => [k, regionProviders[k]])
    )

    const releaseDate = new Date(movie?.release_date ?? show?.first_air_date ?? '').toLocaleDateString(activeLanguage)
    const title = movie?.title ?? show?.name ?? ''
    const originalTitle = movie?.original_title ?? show?.original_name
    const runtime = movie?.runtime ?? null
    const voteCount = item.vote_count ?? 0
    const seasons = show?.seasons.filter((s) => s.season_number > 0) ?? []

    const content = (
        <div
            className='relative w-full flex flex-col'
            style={ambient ? { '--ambient': ambient } as React.CSSProperties : undefined}
        >
            <div
                aria-hidden
                className='fixed inset-0 -z-10 pointer-events-none'
                style={{ background: 'radial-gradient(90% 70% at 50% 0%, color-mix(in oklab, var(--ambient) 8%, transparent), transparent 75%)' }}
            />

            <div className='relative w-full flex flex-col justify-end overflow-hidden min-h-[55vh] sm:min-h-[min(72vh,43.75rem)]'>
                <BackButton
                    className='absolute z-20 left-5 sm:left-6'
                    style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px) + 0.75rem)' }}
                />
                <HeroBackdrop id={item.id}>
                    {item.backdrop_path && (
                        <Image
                            src={`https://image.tmdb.org/t/p/w1280${item.backdrop_path}`}
                            alt=''
                            fill
                            priority
                            className='object-cover opacity-60 blur-sm [will-change:filter]'
                            style={{ objectPosition: 'center 25%' }}
                            sizes='100vw'
                            quality={75}
                        />
                    )}
                    <div className='absolute inset-0 bg-linear-to-t from-background from-[2%] via-background/45 via-[45%] to-background/15' />
                    <div className='absolute inset-0 bg-linear-to-r from-background/55 via-background/15 to-transparent hidden sm:block' />
                    <div
                        aria-hidden
                        className='absolute inset-x-0 bottom-0 h-1/2 pointer-events-none mix-blend-screen'
                        style={{
                            background: 'radial-gradient(70% 90% at 18% 100%, color-mix(in oklab, var(--ambient) 20%, transparent), transparent 70%)',
                        }}
                    />
                </HeroBackdrop>

                <div className='relative z-10 w-full px-5 sm:px-6'>
                    <div className='max-w-6xl mx-auto flex items-end gap-8 pb-8 sm:pb-12'>
                        {item.poster_path && (
                            <div
                                className={
                                    'vt-poster-hero relative hidden sm:block aspect-[2/3] w-36 md:w-44 rounded-2xl overflow-hidden ' +
                                    'shadow-float ring-1 ring-white/15 shrink-0'
                                }
                                style={{ viewTransitionName: 'active-poster' } as React.CSSProperties}
                            >
                                <Image
                                    src={`${config.url.IMAGE_URL}${item.poster_path}`} alt={title} fill priority sizes='11rem'
                                    className='object-cover bg-muted flex items-center justify-center text-center text-xs text-muted-foreground'
                                />
                            </div>
                        )}
                        <div className='flex flex-col gap-3.5 flex-1 min-w-0'>
                            <div className='flex items-center gap-2.5 flex-wrap'>
                                <span className='inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-ambient uppercase'>
                                    {movie ? <><Film className='h-3 w-3' />Movie</> : <><Tv className='h-3 w-3' />TV Series</>}
                                </span>
                                {item.vote_average > 0 && (
                                    <span
                                        className={
                                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 ' +
                                            'border border-yellow-400/20 text-[10px] font-bold text-yellow-400 tabular-nums'
                                        }
                                    >
                                        <Star className='h-2.5 w-2.5 fill-current stroke-none' />
                                        {item.vote_average.toFixed(1)}
                                        {voteCount > 0 && <span className='font-normal text-yellow-400/50 ml-0.5'>· {formatVotes(voteCount)}</span>}
                                    </span>
                                )}
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <h1
                                    className='display font-black leading-[0.95] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.7)] wrap-break-word'
                                    style={{ fontSize: 'clamp(2.25rem, 6vw, 4.25rem)' }}
                                >
                                    {title}
                                </h1>
                                {originalTitle !== title && <p className='text-sm text-white/35 font-light'>{originalTitle}</p>}
                            </div>
                            <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-white/45 tabular-nums'>
                                <span>{releaseDate}</span>
                                {runtime != null && runtime > 0 && (
                                    <><span className='text-white/20'>·</span><span>{formatRuntime(runtime)}</span></>
                                )}
                                {show && show.number_of_seasons > 0 && (
                                    <><span className='text-white/20'>·</span><span>{show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''}</span></>
                                )}
                            </div>
                            {item.tagline && <p className='text-[13px] italic text-white/35 leading-snug font-light tracking-wide'>&ldquo;{item.tagline}&rdquo;</p>}
                            {item.genres.length > 0 && (
                                <div className='flex flex-wrap gap-1.5'>
                                    {item.genres.map((genre) => (
                                        <ChipLabel key={genre.id} className='bg-white/6 border-white/10 text-white/65'>
                                            {genre.name}
                                        </ChipLabel>
                                    ))}
                                </div>
                            )}
                            <div className='flex items-center gap-2 pt-1'>
                                <ListTool tmdbId={item.id} mediaType={media} />
                                <WatchedTool tmdbID={item.id} mediaType={media} media={item} />
                                <TrailerButton videos={item.videos?.results ?? []} />
                                {item.homepage && (
                                    <Link
                                        href={item.homepage} target='_blank' rel='noopener noreferrer'
                                        className={
                                            'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl glass border border-white/12 ' +
                                            'text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors'
                                        }
                                    >
                                        <Globe className='h-3.5 w-3.5 shrink-0' />
                                        <span className='hidden xs:inline'>Website</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='w-full px-5 sm:px-6'>
                <div className='max-w-6xl mx-auto flex flex-col gap-10 pt-10'>
                    {item.overview && (
                        <section className='flex flex-col gap-3'>
                            <SectionHeading>Overview</SectionHeading>
                            <ExpandableText text={item.overview} />
                        </section>
                    )}

                    <section className='flex flex-col gap-4'>
                        <SectionHeading>Where to Watch</SectionHeading>
                        {Object.keys(sortedProviders).length > 0 ? (
                            <div className='flex flex-col gap-5'>
                                {Object.entries(sortedProviders).map(([key, value]) => (
                                    <div key={key} className='flex flex-col gap-3'>
                                        <p className='text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]'>
                                            {key === 'flatrate' ? 'Stream' : key === 'buy' ? 'Buy' : 'Rent'}
                                        </p>
                                        <div className='flex flex-row gap-3 overflow-x-auto noscroll pb-0.5'>
                                            {Array.isArray(value) && value.map((provider, i) => (
                                                <div key={i} className='flex flex-col items-center gap-2 shrink-0 group'>
                                                    <div
                                                        className={
                                                            'relative w-13 h-13 rounded-2xl overflow-hidden bg-surface-2 ring-1 ring-border ' +
                                                            'shadow-md transition-shadow group-hover:ring-ambient/50'
                                                        }
                                                    >
                                                        {provider.logo_path ? (
                                                            <Image
                                                                src={`${config.url.IMAGE_URL}${provider.logo_path}`}
                                                                alt={provider.provider_name} fill
                                                                className='object-cover' sizes='52px'
                                                            />
                                                        ) : (
                                                            <div className='flex items-center justify-center h-full w-full bg-muted'>
                                                                <ImageIcon className='h-5 w-5 text-muted-foreground' />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className='text-[10px] text-muted-foreground/60 max-w-16 truncate text-center leading-tight'>
                                                        {provider.provider_name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-sm text-muted-foreground/60'>Not available for your region.</p>
                        )}
                    </section>

                    {seasons.length > 0 && <SeasonSection showId={item.id} seasons={seasons} />}

                    <section className='flex flex-col gap-4'>
                        <SectionHeading>Details</SectionHeading>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-10'>
                            <div className='divide-y divide-border/60'>
                                <DetailRow label='Status'><StatusBadge status={item.status} /></DetailRow>
                                <DetailRow label='Language' value={item.original_language.toUpperCase()} />
                                <DetailRow label='Popularity' value={item.popularity.toFixed(0)} />
                                {movie ? (<>
                                    {runtime != null && runtime > 0 && <DetailRow label='Runtime' value={formatRuntime(runtime)} />}
                                    {movie.budget > 0 && <DetailRow label='Budget' value={`$${movie.budget.toLocaleString(activeLanguage)}`} />}
                                    {movie.revenue > 0 && <DetailRow label='Revenue' value={`$${movie.revenue.toLocaleString(activeLanguage)}`} />}
                                    {movie.imdb_id && (
                                        <DetailRow label='IMDB'>
                                            <a
                                                href={`https://www.imdb.com/title/${movie.imdb_id}`} target='_blank' rel='noopener noreferrer'
                                                className='text-xs font-medium text-ambient hover:opacity-80 transition-opacity'
                                            >
                                                {movie.imdb_id}
                                            </a>
                                        </DetailRow>
                                    )}
                                </>) : show ? (<>
                                    <DetailRow label='Seasons' value={show.number_of_seasons} />
                                    <DetailRow label='Episodes' value={show.number_of_episodes} />
                                    <DetailRow label='First Air' value={new Date(show.first_air_date).toLocaleDateString(activeLanguage)} />
                                    <DetailRow label='Last Air' value={new Date(show.last_air_date).toLocaleDateString(activeLanguage)} />
                                    {show.episode_run_time?.length > 0 && <DetailRow label='Runtime' value={`${show.episode_run_time.join(', ')} min`} />}
                                    <DetailRow label='Type' value={show.type} />
                                </>) : null}
                            </div>
                            <div className='divide-y divide-border/60 mt-0 sm:mt-0 border-t border-border/60 sm:border-t-0 pt-0 sm:pt-0'>
                                <InfoDetailRow label='Companies' items={item.production_companies} />
                                <InfoDetailRow label='Countries' items={item.production_countries} />
                                <InfoDetailRow label='Languages' items={item.spoken_languages.map((l) => ({ id: l.iso_639_1, name: l.english_name }))} />
                                {show && (<>
                                    <InfoDetailRow label='Networks' items={show.networks} />
                                    {show.created_by.length > 0 && <InfoDetailRow label='Created By' items={show.created_by} />}
                                </>)}
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
                                <span className='flex items-baseline gap-2'>
                                    More Like This
                                    {watchedInSimilar != null && watchedInSimilar > 0 && (
                                        <span className='text-xs font-normal text-ambient'>{watchedInSimilar} watched</span>
                                    )}
                                </span>
                            }
                            items={similar}
                            type={media}
                        />
                    )}
                </div>
            </div>
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
        <div className='flex items-center justify-between py-3 gap-4'>
            <span className='text-xs text-muted-foreground/70 shrink-0'>{label}</span>
            <div className='text-right'>
                {children ?? <span className='text-xs font-medium text-foreground/85 tabular-nums'>{String(value)}</span>}
            </div>
        </div>
    )
}

function InfoDetailRow({ label, items }: { label: string; items: Array<{ id?: number | string; name: string }> | undefined }) {
    if (!items?.length) return null
    return (
        <div className='flex items-start justify-between py-3 gap-4'>
            <span className='text-xs text-muted-foreground/70 shrink-0'>{label}</span>
            <span className='text-xs font-medium text-foreground/85 text-right leading-relaxed'>
                {items.map(i => i.name).join(', ')}
            </span>
        </div>
    )
}
