import config from '@config'
import LoadImage from '@components/loadImage/loadimage'
import { Film, Globe, Star, Tv } from 'lucide-react'
import Link from 'next/link'
import ListTool from '../dialog/dialog'
import WatchedTool from '../dialog/watcheddialog'
import { TrailerButton } from '../trailerButton/trailerButton'
import MediaSection from '../mediaSection/mediasection'

type MediaPageProps = {
    item: MovieDetailsProps | ShowDetailsProps
    media: 'movie' | 'show'
    similar?: MediaListProps | null
}

export default function MediaPage({ item, media, similar }: MediaPageProps) {
    const customOrder = ['flatrate', 'rent', 'buy']
    const regionProviders = (item['watch/providers']?.results[config.setting.REGION] ?? {}) as Record<string, unknown>
    const sortedProviders = Object.fromEntries(
        customOrder.filter((k) => k in regionProviders).map((k) => [k, regionProviders[k]])
    )

    const releaseDate =
        media === 'movie'
            ? new Date((item as MovieDetailsProps).release_date).toLocaleDateString(config.setting.LANGUAGE)
            : new Date((item as ShowDetailsProps).first_air_date).toLocaleDateString(config.setting.LANGUAGE)

    const title = media === 'movie' ? (item as MovieDetailsProps).title : (item as ShowDetailsProps).name
    const originalTitle =
        media === 'movie' ? (item as MovieDetailsProps).original_title : (item as ShowDetailsProps).original_name

    const runtime = media === 'movie' ? (item as MovieDetailsProps).runtime : null
    const voteCount = (item as { vote_count?: number }).vote_count ?? 0

    const seasons = media === 'show'
        ? (item as ShowDetailsProps).seasons.filter((s) => s.season_number > 0)
        : []

    return (
        <div className='relative w-full flex flex-col gap-6 -mt-4'>

            {/* ── Ambient page backdrop ── */}
            {item.backdrop_path && (
                <div className='absolute inset-x-0 top-0 bottom-0 -z-10 pointer-events-none overflow-hidden'>
                    <LoadImage
                        source={`${config.url.IMAGE_URL}${item.backdrop_path}`}
                        error={item.backdrop_path}
                        className='object-cover object-top w-full h-full blur-3xl opacity-18 scale-110'
                        fill={true}
                    />
                    <div className='absolute inset-0 bg-linear-to-b from-background/20 from-[20%] via-background/55 via-[55%] to-background/85' />
                </div>
            )}

            {/* ── Hero ── */}
            <div className='relative -mx-4 sm:-mx-5 overflow-hidden min-h-72 sm:min-h-[26rem] flex flex-col justify-end'>
                <div className='absolute inset-0'>
                    <LoadImage
                        source={`${config.url.IMAGE_URL}${item.backdrop_path}`}
                        error={item.backdrop_path}
                        className='object-cover w-full h-full blur-sm opacity-20 scale-110'
                        fill={true}
                    />
                    <div className='absolute inset-0 bg-black/25' />
                    <div className='absolute inset-0 bg-linear-to-b from-transparent from-10% via-background/35 via-70% to-background/80' />
                    <div className='absolute inset-0 bg-linear-to-r from-background/10 to-transparent hidden sm:block' />
                </div>

                <div className='relative z-10 px-4 sm:px-5 pb-8 pt-6'>
                    <div className='flex flex-col items-center sm:flex-row sm:items-end gap-5 sm:gap-8'>

                        {/* Poster */}
                        <div className='relative aspect-[2/3] w-32 sm:w-44 md:w-52 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 shrink-0'>
                            <LoadImage
                                source={`${config.url.IMAGE_URL}${item.poster_path}`}
                                error={item.poster_path}
                                className='object-cover'
                                fill={true}
                            />
                        </div>

                        {/* Info */}
                        <div className='flex flex-col gap-3 sm:pb-1 text-center sm:text-left flex-1 min-w-0'>

                            {/* Media type */}
                            <div className='flex justify-center sm:justify-start'>
                                <span className='inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-brand uppercase'>
                                    {media === 'movie'
                                        ? <><Film className='h-3 w-3' />Movie</>
                                        : <><Tv className='h-3 w-3' />TV Series</>
                                    }
                                </span>
                            </div>

                            {/* Title */}
                            <div className='flex flex-col gap-1'>
                                <h1 className='text-3xl sm:text-4xl font-bold leading-tight text-white drop-shadow-sm'>
                                    {title}
                                </h1>
                                {originalTitle !== title && (
                                    <p className='text-sm text-white/50'>{originalTitle}</p>
                                )}
                            </div>

                            {/* Meta row */}
                            <div className='flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 text-sm'>
                                <span className='text-white/65'>{releaseDate}</span>
                                {runtime != null && runtime > 0 && (
                                    <>
                                        <span className='text-white/25 text-xs'>·</span>
                                        <span className='text-white/65'>{formatRuntime(runtime)}</span>
                                    </>
                                )}
                                {item.vote_average > 0 && (
                                    <>
                                        <span className='text-white/25 text-xs'>·</span>
                                        <span className='flex items-center gap-1'>
                                            <Star className='h-3.5 w-3.5 fill-yellow-400 stroke-none shrink-0' />
                                            <span className='font-semibold text-white'>{item.vote_average.toFixed(1)}</span>
                                            <span className='text-white/40 text-xs'>/10</span>
                                            {voteCount > 0 && (
                                                <span className='text-white/30 text-xs'>({formatVotes(voteCount)})</span>
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Tagline */}
                            {item.tagline && (
                                <p className='text-sm italic text-white/45 leading-snug'>
                                    &ldquo;{item.tagline}&rdquo;
                                </p>
                            )}

                            {/* Genres */}
                            {item.genres.length > 0 && (
                                <div className='flex flex-wrap justify-center sm:justify-start gap-1.5'>
                                    {item.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className={
                                                'px-2.5 py-0.5 bg-white/8 border border-white/12 rounded-full ' +
                                                'text-xs text-white/75 hover:bg-white/15 transition-colors cursor-default'
                                            }
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className='flex justify-center sm:justify-start items-center gap-2 pt-1'>
                                <ListTool tmdbId={item.id} mediaType={media} />
                                <WatchedTool tmdbID={item.id} mediaType={media} media={item} />
                                <TrailerButton videos={item.videos?.results ?? []} />
                                {item.homepage && (
                                    <Link
                                        href={item.homepage}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className={
                                            'inline-flex items-center gap-1.5 h-10 px-3 rounded-lg ' +
                                            'border border-white/20 bg-white/5 text-white/75 hover:text-white hover:bg-white/12 text-sm font-medium transition-colors'
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

            {/* ── Overview ── */}
            {item.overview && (
                <section className='flex flex-col gap-3'>
                    <SectionHeading>Overview</SectionHeading>
                    <div className='bg-card border border-border rounded-xl p-4 shadow-sm'>
                        <p className='text-sm leading-relaxed text-muted-foreground'>{item.overview}</p>
                    </div>
                </section>
            )}

            {/* ── Where to Watch ── */}
            <section className='flex flex-col gap-3'>
                <SectionHeading>Where to Watch</SectionHeading>
                {Object.keys(sortedProviders).length > 0 ? (
                    <div className='bg-card border border-border rounded-xl overflow-hidden shadow-sm'>
                        {Object.entries(sortedProviders).map(([key, value], idx, arr) => (
                            <div
                                key={key}
                                className={`px-4 py-3.5 ${idx < arr.length - 1 ? 'border-b border-border' : ''}`}
                            >
                                <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
                                    {key === 'flatrate' ? 'Stream' : key === 'buy' ? 'Buy' : 'Rent'}
                                </p>
                                <div className='flex flex-row gap-3 overflow-x-auto noscroll pb-0.5'>
                                    {Array.isArray(value) &&
                                        value.map((provider, i) => (
                                            <div key={i} className='flex flex-col items-center gap-1.5 shrink-0'>
                                                <div className='relative w-11 h-11 rounded-xl overflow-hidden ring-1 ring-border/50 shadow-sm'>
                                                    <LoadImage
                                                        source={`${config.url.IMAGE_URL}${provider.logo_path}`}
                                                        error={provider.logo_path}
                                                        className='object-cover'
                                                        fill={true}
                                                    />
                                                </div>
                                                <span className='text-[10px] text-muted-foreground/80 max-w-14 truncate text-center leading-tight'>
                                                    {provider.provider_name}
                                                </span>
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

            {/* ── Seasons ── */}
            {seasons.length > 0 && (
                <section className='flex flex-col gap-3'>
                    <SectionHeading>
                        Seasons
                        <span className='ml-1.5 font-normal text-muted-foreground'>{seasons.length}</span>
                    </SectionHeading>
                    <div className='-mx-4 sm:-mx-5 px-4 sm:px-5 flex gap-3 overflow-x-auto noscroll pb-1'>
                        {seasons.map((season) => (
                            <div
                                key={season.id}
                                className={
                                    'flex-none w-28 sm:w-32 bg-card border border-border rounded-xl ' +
                                    'overflow-hidden shadow-sm hover:border-brand/40 hover:shadow-md transition-all group'
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
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Details ── */}
            <section className='flex flex-col gap-3'>
                <SectionHeading>Details</SectionHeading>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>

                    <div className='bg-card border border-border rounded-xl overflow-hidden shadow-sm'>
                        <p className='px-4 pt-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border'>
                            General
                        </p>
                        <div className='px-4 divide-y divide-border'>
                            <DetailRow label='Status'>
                                <StatusBadge status={item.status} />
                            </DetailRow>
                            <DetailRow label='Language' value={item.original_language.toUpperCase()} />
                            <DetailRow label='Popularity' value={item.popularity.toFixed(0)} />
                            {media === 'movie' ? (
                                <>
                                    {runtime != null && runtime > 0 && (
                                        <DetailRow label='Runtime' value={formatRuntime(runtime)} />
                                    )}
                                    {(item as MovieDetailsProps).budget > 0 && (
                                        <DetailRow
                                            label='Budget'
                                            value={`$${(item as MovieDetailsProps).budget.toLocaleString(config.setting.LANGUAGE)}`}
                                        />
                                    )}
                                    {(item as MovieDetailsProps).revenue > 0 && (
                                        <DetailRow
                                            label='Revenue'
                                            value={`$${(item as MovieDetailsProps).revenue.toLocaleString(config.setting.LANGUAGE)}`}
                                        />
                                    )}
                                    {(item as MovieDetailsProps).imdb_id && (
                                        <DetailRow label='IMDB'>
                                            <a
                                                href={`https://www.imdb.com/title/${(item as MovieDetailsProps).imdb_id}`}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-xs font-medium text-brand hover:text-brand-dim transition-colors'
                                            >
                                                {(item as MovieDetailsProps).imdb_id}
                                            </a>
                                        </DetailRow>
                                    )}
                                </>
                            ) : (
                                <>
                                    <DetailRow label='Seasons' value={(item as ShowDetailsProps).number_of_seasons} />
                                    <DetailRow label='Episodes' value={(item as ShowDetailsProps).number_of_episodes} />
                                    <DetailRow
                                        label='First Air'
                                        value={new Date((item as ShowDetailsProps).first_air_date).toLocaleDateString(config.setting.LANGUAGE)}
                                    />
                                    <DetailRow
                                        label='Last Air'
                                        value={new Date((item as ShowDetailsProps).last_air_date).toLocaleDateString(config.setting.LANGUAGE)}
                                    />
                                    {(item as ShowDetailsProps).episode_run_time?.length > 0 && (
                                        <DetailRow
                                            label='Runtime'
                                            value={`${(item as ShowDetailsProps).episode_run_time.join(', ')} min`}
                                        />
                                    )}
                                    <DetailRow label='Type' value={(item as ShowDetailsProps).type} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className='bg-card border border-border rounded-xl overflow-hidden shadow-sm'>
                        <p className='px-4 pt-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border'>
                            Production
                        </p>
                        <div className='px-4 py-3 flex flex-col gap-4'>
                            <InfoSection title='Companies' items={item.production_companies} />
                            <InfoSection title='Countries' items={item.production_countries} />
                            <InfoSection
                                title='Languages'
                                items={item.spoken_languages.map((l) => ({ id: l.iso_639_1, name: l.english_name }))}
                            />
                            {media === 'show' && (
                                <>
                                    <InfoSection title='Networks' items={(item as ShowDetailsProps).networks} />
                                    {(item as ShowDetailsProps).created_by.length > 0 && (
                                        <InfoSection title='Created By' items={(item as ShowDetailsProps).created_by} />
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </section>

            {/* ── More Like This ── */}
            {similar && similar.results.length > 0 && (
                <MediaSection title='More Like This' items={similar} type={media} />
            )}

        </div>
    )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h && m) return `${h}h ${m}m`
    if (h) return `${h}h`
    return `${m}m`
}

function formatVotes(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return String(n)
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex items-center gap-3'>
            <h2 className='text-sm font-semibold tracking-tight text-foreground shrink-0 flex items-baseline gap-1'>
                {children}
            </h2>
            <div className='flex-1 h-px bg-border/60' />
        </div>
    )
}

const STATUS_COLORS: Record<string, string> = {
    'Released':         'bg-emerald-500',
    'Returning Series': 'bg-brand',
    'In Production':    'bg-amber-400',
    'Post Production':  'bg-sky-400',
    'Planned':          'bg-sky-500',
    'Ended':            'bg-muted-foreground/50',
    'Canceled':         'bg-destructive',
}

function StatusBadge({ status }: { status: string }) {
    const dot = STATUS_COLORS[status] ?? 'bg-muted-foreground/40'
    return (
        <span className='flex items-center gap-1.5 text-xs font-medium text-foreground/85'>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
            {status}
        </span>
    )
}

function DetailRow({
    label,
    value,
    children,
}: {
    label: string
    value?: string | number | null | undefined
    children?: React.ReactNode
}) {
    if (!children && value == null) return null
    if (!children && value === '') return null
    return (
        <div className='flex items-center justify-between py-2.5 min-h-10 gap-4'>
            <span className='text-xs text-muted-foreground shrink-0'>{label}</span>
            <div className='text-right'>
                {children ?? (
                    <span className='text-xs font-medium text-foreground/90'>{String(value)}</span>
                )}
            </div>
        </div>
    )
}

type InfoSectionProps = {
    title: string
    items: Array<{ id?: number | string; name: string }> | undefined
}

function InfoSection({ title, items }: InfoSectionProps) {
    if (!items?.length) return null
    return (
        <div className='flex flex-col gap-1.5'>
            <p className='text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider'>{title}</p>
            <div className='flex flex-wrap gap-1'>
                {items.map((item, i) => (
                    <span
                        key={item.id || i}
                        className='text-xs bg-muted/50 border border-border/50 text-foreground/75 px-2 py-0.5 rounded-md'
                    >
                        {item.name}
                    </span>
                ))}
            </div>
        </div>
    )
}
