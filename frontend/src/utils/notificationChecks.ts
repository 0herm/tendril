import { dbWrapper } from '@/utils/api'
import { sendPush } from '@/utils/push'

const TMDB_BASE  = 'https://api.themoviedb.org/'
const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN || process.env.ACCESS_TOKEN
const LANGUAGE   = process.env.LANGUAGE || 'en-GB'

type TmdbMovie = { title: string; status: string; release_date: string; belongs_to_collection: { id: number; name: string } | null }
type TmdbCollection = { name: string; parts: { id: number; title: string; release_date: string | null; status?: string }[] }
type TmdbShow  = {
    name: string
    status: string
    number_of_seasons: number
    next_episode_to_air: { air_date: string } | null
    seasons: { season_number: number; air_date: string | null; episode_count: number }[]
}
type TmdbSeason = { episodes: { air_date: string | null; episode_number: number }[] }

async function tmdb<T>(path: string): Promise<T | null> {
    if (!TMDB_TOKEN) return null
    try {
        const res = await fetch(`${TMDB_BASE}${path}`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
            cache: 'no-store',
        })
        return res.ok ? (res.json() as Promise<T>) : null
    } catch { return null }
}

async function alreadySent(type: string, tmdbId: number | null, meta?: string): Promise<boolean> {
    if (tmdbId !== null) {
        const { data } = await dbWrapper<{ id: number }>(
            'SELECT id FROM NotificationLog WHERE type = $1 AND tmdb_id = $2 AND COALESCE(meta, \'\') = COALESCE($3, \'\')',
            [type, tmdbId, meta ?? null]
        )
        return (data?.length ?? 0) > 0
    }
    const { data } = await dbWrapper<{ id: number }>(
        'SELECT id FROM NotificationLog WHERE type = $1 AND tmdb_id IS NULL AND sent_at > NOW() - INTERVAL \'14 days\'',
        [type]
    )
    return (data?.length ?? 0) > 0
}

async function logSent(type: string, tmdbId: number | null, meta?: string): Promise<void> {
    await dbWrapper(
        'INSERT INTO NotificationLog (type, tmdb_id, meta) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [type, tmdbId, meta ?? null]
    )
}

function daysFromNow(dateStr: string): number {
    return (Date.now() - new Date(dateStr).getTime()) / 86_400_000
}

export async function checkMovieReleased(): Promise<number> {
    const { data: items } = await dbWrapper<{ tmdb_id: number }>(
        'SELECT DISTINCT tmdb_id FROM Media WHERE type = $1',
        ['movie']
    )
    if (!items?.length) return 0

    let sent = 0
    for (const { tmdb_id } of items) {
        if (await alreadySent('movie_released', tmdb_id)) continue
        const movie = await tmdb<TmdbMovie>(`3/movie/${tmdb_id}?language=${LANGUAGE}`)
        if (!movie || movie.status !== 'Released') continue
        const age = daysFromNow(movie.release_date)
        if (age < 0 || age > 7) continue

        await sendPush({
            title: 'Now Available',
            body: `${movie.title} has been released — it's on your watchlist!`,
            url: `/movie/${tmdb_id}`,
        })
        await logSent('movie_released', tmdb_id)
        sent++
    }
    return sent
}

export async function checkUpcomingRelease(): Promise<number> {
    const { data: items } = await dbWrapper<{ tmdb_id: number; type: string }>(
        'SELECT DISTINCT tmdb_id, type FROM Media',
        []
    )
    if (!items?.length) return 0

    let sent = 0
    for (const { tmdb_id, type } of items) {
        let dateStr: string | undefined
        let label: string | undefined
        let url: string

        if (type === 'movie') {
            const movie = await tmdb<TmdbMovie>(`3/movie/${tmdb_id}?language=${LANGUAGE}`)
            dateStr = movie?.release_date
            label   = movie?.title
            url     = `/movie/${tmdb_id}`
        } else {
            const show = await tmdb<TmdbShow>(`3/tv/${tmdb_id}?language=${LANGUAGE}`)
            dateStr = show?.next_episode_to_air?.air_date
            label   = show?.name
            url     = `/show/${tmdb_id}`
        }

        if (!dateStr || !label) continue
        const daysUntil = -daysFromNow(dateStr)
        if (daysUntil < 0 || daysUntil > 3) continue

        const notifType = type === 'movie' ? 'upcoming_movie' : 'upcoming_episode'
        if (await alreadySent(notifType, tmdb_id, dateStr)) continue

        const formatted = new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        await sendPush({
            title: 'Coming Soon',
            body: `${label} ${type === 'movie' ? 'releases' : 'airs'} on ${formatted}`,
            url,
        })
        await logSent(notifType, tmdb_id, dateStr)
        sent++
    }
    return sent
}

export async function checkWatchlistReminder(): Promise<number> {
    const { data: stale } = await dbWrapper<{ tmdb_id: number; type: string }>(
        `SELECT DISTINCT m.tmdb_id, m.type
         FROM Media m
         WHERE m.added_at < NOW() - INTERVAL '30 days'
           AND NOT EXISTS (SELECT 1 FROM Watched w WHERE w.tmdb_id = m.tmdb_id)`,
        []
    )
    if (!stale?.length) return 0

    const unsent: { tmdb_id: number; type: string }[] = []
    for (const item of stale) {
        if (!await alreadySent('watchlist_reminder', item.tmdb_id)) unsent.push(item)
    }
    if (!unsent.length) return 0

    if (unsent.length === 1) {
        const { tmdb_id, type } = unsent[0]
        const data = type === 'movie'
            ? await tmdb<TmdbMovie>(`3/movie/${tmdb_id}?language=${LANGUAGE}`)
            : await tmdb<TmdbShow>(`3/tv/${tmdb_id}?language=${LANGUAGE}`)
        const name = data ? ((data as TmdbMovie).title ?? (data as TmdbShow).name) : `#${tmdb_id}`
        await sendPush({
            title: 'Still on your list…',
            body: `${name} has been waiting over a month.`,
            url: `/${type === 'movie' ? 'movie' : 'show'}/${tmdb_id}`,
        })
    } else {
        await sendPush({
            title: 'Your watchlist is waiting',
            body: `${unsent.length} titles have been on your list for over a month.`,
            url: '/',
        })
    }

    for (const { tmdb_id } of unsent) await logSent('watchlist_reminder', tmdb_id)
    return 1
}

export async function checkInactivity(): Promise<number> {
    if (await alreadySent('inactivity', null)) return 0

    const { data } = await dbWrapper<{ added_at: string }>(
        'SELECT added_at FROM Watched ORDER BY added_at DESC LIMIT 1',
        []
    )
    const lastAdded = data?.[0]?.added_at
    if (!lastAdded || daysFromNow(lastAdded) < 14) return 0

    await sendPush({
        title: 'Long time no watch',
        body: 'You haven\'t logged anything in 14 days. Jump back in!',
        url: '/',
    })
    await logSent('inactivity', null)
    return 1
}

export async function checkNewSeason(): Promise<number> {
    const { data: shows } = await dbWrapper<{ tmdb_id: number; name: string; total_seasons: number }>(
        'SELECT tmdb_id, name, total_seasons FROM Watched WHERE type = $1 AND total_seasons IS NOT NULL',
        ['show']
    )
    if (!shows?.length) return 0

    let sent = 0
    for (const { tmdb_id, name, total_seasons } of shows) {
        const show = await tmdb<TmdbShow>(`3/tv/${tmdb_id}?language=${LANGUAGE}`)
        if (!show || show.number_of_seasons <= total_seasons) continue

        const newSeasonNum = String(show.number_of_seasons)
        const newSeason = show.seasons.find((s) => s.season_number === show.number_of_seasons)
        if (!newSeason?.air_date || new Date(newSeason.air_date) > new Date() || newSeason.episode_count === 0) continue
        if (await alreadySent('new_season', tmdb_id, newSeasonNum)) continue

        await sendPush({
            title: 'New Season Available',
            body: `${show.name ?? name} — Season ${show.number_of_seasons} just dropped!`,
            url: `/show/${tmdb_id}`,
        })
        await logSent('new_season', tmdb_id, newSeasonNum)
        sent++
    }
    return sent
}

export async function checkNewEpisodes(): Promise<number> {
    const { data: shows } = await dbWrapper<{ tmdb_id: number; name: string; watched_seasons: number[]; episode_counts: number[] }>(
        'SELECT tmdb_id, name, watched_seasons, episode_counts FROM Watched WHERE type = $1 AND episode_counts IS NOT NULL AND ARRAY_LENGTH(episode_counts, 1) > 0',
        ['show']
    )
    if (!shows?.length) return 0

    const today = new Date()
    let sent = 0
    for (const { tmdb_id, name, watched_seasons, episode_counts } of shows) {
        const show = await tmdb<TmdbShow>(`3/tv/${tmdb_id}?language=${LANGUAGE}`)
        if (!show) continue

        for (let i = 0; i < watched_seasons.length; i++) {
            const seasonNum = watched_seasons[i]
            const storedCount = episode_counts[i]
            if (!storedCount) continue

            const seasonData = await tmdb<TmdbSeason>(`3/tv/${tmdb_id}/season/${seasonNum}?language=${LANGUAGE}`)
            if (!seasonData) continue

            const airedCount = seasonData.episodes.filter(
                (ep) => ep.air_date && new Date(ep.air_date) <= today
            ).length
            if (airedCount <= storedCount) continue

            const meta = `${seasonNum}:${airedCount}`
            if (await alreadySent('new_episodes', tmdb_id, meta)) continue

            const newCount = airedCount - storedCount
            await sendPush({
                title: 'New Episodes Available',
                body: `${show.name ?? name} — Season ${seasonNum} has ${newCount} new episode${newCount === 1 ? '' : 's'}!`,
                url: `/show/${tmdb_id}`,
            })
            await logSent('new_episodes', tmdb_id, meta)
            sent++
        }
    }
    return sent
}

export async function checkShowEnded(): Promise<number> {
    const { data: shows } = await dbWrapper<{ tmdb_id: number; name: string; show_status: string }>(
        'SELECT tmdb_id, name, show_status FROM Watched WHERE type = $1',
        ['show']
    )
    if (!shows?.length) return 0

    let sent = 0
    for (const { tmdb_id, name, show_status } of shows) {
        const show = await tmdb<TmdbShow>(`3/tv/${tmdb_id}?language=${LANGUAGE}`)
        if (!show) continue
        if (show.status !== 'Ended' && show.status !== 'Canceled') continue
        if (show.status === show_status) continue

        if (await alreadySent('show_ended', tmdb_id)) continue

        const cancelled = show.status === 'Canceled'
        await sendPush({
            title: cancelled ? 'Show Cancelled' : 'Show Ended',
            body: cancelled
                ? `${show.name ?? name} has been cancelled.`
                : `${show.name ?? name} has ended.`,
            url: `/show/${tmdb_id}`,
        })
        await logSent('show_ended', tmdb_id)
        sent++
    }
    return sent
}

export async function checkNewCollectionMovie(): Promise<number> {
    const { data: watchlistItems } = await dbWrapper<{ tmdb_id: number }>(
        'SELECT DISTINCT tmdb_id FROM Media WHERE type = $1',
        ['movie']
    )
    const { data: watchedItems } = await dbWrapper<{ tmdb_id: number }>(
        'SELECT DISTINCT tmdb_id FROM Watched WHERE type = $1',
        ['movie']
    )

    const allIds = new Set([
        ...(watchlistItems ?? []).map((r) => r.tmdb_id),
        ...(watchedItems ?? []).map((r) => r.tmdb_id),
    ])
    if (!allIds.size) return 0

    const checkedCollections = new Set<number>()
    let sent = 0

    for (const tmdb_id of allIds) {
        const movie = await tmdb<TmdbMovie>(`3/movie/${tmdb_id}?language=${LANGUAGE}`)
        if (!movie?.belongs_to_collection) continue

        const collectionId = movie.belongs_to_collection.id
        if (checkedCollections.has(collectionId)) continue
        checkedCollections.add(collectionId)

        const collection = await tmdb<TmdbCollection>(`3/collection/${collectionId}?language=${LANGUAGE}`)
        if (!collection) continue

        for (const part of collection.parts) {
            if (allIds.has(part.id)) continue
            if (!part.release_date) continue
            const age = daysFromNow(part.release_date)
            if (age < 0 || age > 7) continue

            if (await alreadySent('collection_movie', part.id)) continue

            await sendPush({
                title: 'New Collection Movie Released',
                body: `${part.title} is out — part of ${collection.name}`,
                url: `/movie/${part.id}`,
            })
            await logSent('collection_movie', part.id)
            sent++
        }
    }
    return sent
}

export async function runAllChecks(): Promise<void> {
    const results = await Promise.allSettled([
        checkMovieReleased(),
        checkUpcomingRelease(),
        checkWatchlistReminder(),
        checkInactivity(),
        checkNewSeason(),
        checkNewEpisodes(),
        checkShowEnded(),
        checkNewCollectionMovie(),
    ])
    const sent = results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0)
    console.log(`[notifications] ran all checks — ${sent} notification(s) sent`)
}
