import webpush from 'web-push'
import { dbWrapper } from '@/utils/queries'
import config from '@config'
import { getAppSettings } from '@/utils/settings'

const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN || process.env.ACCESS_TOKEN

type PushPayload = {
    title: string
    body: string
    url?: string
}

const pub  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const priv = process.env.VAPID_PRIVATE_KEY
if (pub && priv) {
    const origin = process.env.ORIGIN ?? ''
    const subject = origin.startsWith('https://') ? origin : 'mailto:admin@tendril.local'
    webpush.setVapidDetails(subject, pub, priv)
}

export async function sendPush(payload: PushPayload): Promise<void> {
    if (!pub || !priv) return

    const { data } = await dbWrapper<{ subscription: string }>(
        'SELECT subscription FROM Users WHERE subscription IS NOT NULL LIMIT 1',
        []
    )
    if (!data?.length) return

    let subscription: webpush.PushSubscription
    try {
        subscription = JSON.parse(data[0].subscription) as webpush.PushSubscription
    } catch {
        return
    }

    await webpush.sendNotification(subscription, JSON.stringify(payload))
}

type TmdbMovie = { title: string; status: string; release_date: string; belongs_to_collection: { id: number; name: string } | null }
type TmdbCollection = { name: string; parts: { id: number; title: string; release_date: string | null; status?: string }[] }
type TmdbShow  = {
    name: string; status: string; number_of_seasons: number
    next_episode_to_air: { air_date: string; season_number: number } | null
    last_episode_to_air: { season_number: number; episode_number: number } | null
    seasons: { season_number: number; air_date: string | null; episode_count: number }[]
}

async function tmdb<T>(path: string): Promise<T | null> {
    if (!TMDB_TOKEN) return null
    const { language } = await getAppSettings()
    const sep = path.includes('?') ? '&' : '?'
    try {
        const res = await fetch(`${config.url.API_URL}${path}${sep}language=${language}`, { headers: { Authorization: `Bearer ${TMDB_TOKEN}` }, cache: 'no-store' })
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

async function logSent(type: string, tmdbId: number | null, meta?: string, payload?: { title: string; body: string; url?: string }): Promise<void> {
    await dbWrapper(
        'INSERT INTO NotificationLog (type, tmdb_id, meta, notif_title, notif_body, notif_url) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [type, tmdbId, meta ?? null, payload?.title ?? null, payload?.body ?? null, payload?.url ?? null]
    )
}

function daysFromNow(dateStr: string): number {
    return (Date.now() - new Date(dateStr).getTime()) / 86_400_000
}

export async function checkMovieReleased(): Promise<number> {
    const { data: items } = await dbWrapper<{ tmdb_id: number }>('SELECT DISTINCT tmdb_id FROM Media WHERE type = $1', ['movie'])
    if (!items?.length) return 0
    let sent = 0
    for (const { tmdb_id } of items) {
        if (await alreadySent('movie_released', tmdb_id)) continue
        const movie = await tmdb<TmdbMovie>(`3/movie/${tmdb_id}`)
        if (!movie || movie.status !== 'Released') continue
        const age = daysFromNow(movie.release_date)
        if (age < 0 || age > 7) continue
        const p = { title: 'Now Available', body: `${movie.title} has been released — it's on your watchlist!`, url: `/movie/${tmdb_id}` }
        await sendPush(p); await logSent('movie_released', tmdb_id, undefined, p); sent++
    }
    return sent
}

export async function checkUpcomingRelease(): Promise<number> {
    const { data: items } = await dbWrapper<{ tmdb_id: number; type: string }>('SELECT DISTINCT tmdb_id, type FROM Media', [])
    if (!items?.length) return 0
    let sent = 0
    for (const { tmdb_id, type } of items) {
        let dateStr: string | undefined, label: string | undefined, url: string
        if (type === 'movie') {
            const movie = await tmdb<TmdbMovie>(`3/movie/${tmdb_id}`)
            dateStr = movie?.release_date; label = movie?.title; url = `/movie/${tmdb_id}`
        } else {
            const show = await tmdb<TmdbShow>(`3/tv/${tmdb_id}`)
            dateStr = show?.next_episode_to_air?.air_date; label = show?.name; url = `/show/${tmdb_id}`
        }
        if (!dateStr || !label) continue
        const daysUntil = -daysFromNow(dateStr)
        if (daysUntil < 0 || daysUntil > 3) continue
        const notifType = type === 'movie' ? 'upcoming_movie' : 'upcoming_episode'
        if (await alreadySent(notifType, tmdb_id, dateStr)) continue
        const formatted = new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        const p = { title: 'Coming Soon', body: `${label} ${type === 'movie' ? 'releases' : 'airs'} on ${formatted}`, url }
        await sendPush(p); await logSent(notifType, tmdb_id, dateStr, p); sent++
    }
    return sent
}

export async function checkWatchlistReminder(): Promise<number> {
    const { data: stale } = await dbWrapper<{ tmdb_id: number; type: string }>(
        'SELECT DISTINCT m.tmdb_id, m.type FROM Media m WHERE m.added_at < NOW() - INTERVAL \'30 days\' AND NOT EXISTS (SELECT 1 FROM Watched w WHERE w.tmdb_id = m.tmdb_id)',
        []
    )
    if (!stale?.length) return 0
    const sentFlags = await Promise.all(stale.map(item => alreadySent('watchlist_reminder', item.tmdb_id)))
    const unsent = stale.filter((_, i) => !sentFlags[i])
    if (!unsent.length) return 0
    let p: { title: string; body: string; url: string }
    if (unsent.length === 1) {
        const { tmdb_id, type } = unsent[0]
        const data = type === 'movie'
            ? await tmdb<TmdbMovie>(`3/movie/${tmdb_id}`)
            : await tmdb<TmdbShow>(`3/tv/${tmdb_id}`)
        const name = data ? ((data as TmdbMovie).title ?? (data as TmdbShow).name) : `#${tmdb_id}`
        p = { title: 'Still on your list…', body: `${name} has been waiting over a month.`, url: `/${type === 'movie' ? 'movie' : 'show'}/${tmdb_id}` }
    } else {
        p = { title: 'Your watchlist is waiting', body: `${unsent.length} titles have been on your list for over a month.`, url: '/' }
    }
    await sendPush(p)
    await Promise.all(unsent.map(({ tmdb_id }) => logSent('watchlist_reminder', tmdb_id, undefined, p)))
    return 1
}

export async function checkInactivity(): Promise<number> {
    if (await alreadySent('inactivity', null)) return 0
    const { data } = await dbWrapper<{ added_at: string }>('SELECT added_at FROM Watched ORDER BY added_at DESC LIMIT 1', [])
    const lastAdded = data?.[0]?.added_at
    if (!lastAdded || daysFromNow(lastAdded) < 14) return 0
    const p = { title: 'Long time no watch', body: 'You haven\'t logged anything in 14 days. Jump back in!', url: '/' }
    await sendPush(p); await logSent('inactivity', null, undefined, p)
    return 1
}

export async function checkNewSeason(): Promise<number> {
    const { data: shows } = await dbWrapper<{ tmdb_id: number; name: string; total_seasons: number }>(
        'SELECT tmdb_id, name, total_seasons FROM Watched WHERE type = $1 AND total_seasons IS NOT NULL', ['show']
    )
    if (!shows?.length) return 0
    let sent = 0
    for (const { tmdb_id, name, total_seasons } of shows) {
        const show = await tmdb<TmdbShow>(`3/tv/${tmdb_id}`)
        if (!show || show.number_of_seasons <= total_seasons) continue
        const newSeasonNum = String(show.number_of_seasons)
        const newSeason = show.seasons.find((s) => s.season_number === show.number_of_seasons)
        if (!newSeason?.air_date || new Date(newSeason.air_date) > new Date() || newSeason.episode_count === 0) continue
        if (await alreadySent('new_season', tmdb_id, newSeasonNum)) continue
        const p = { title: 'New Season Available', body: `${show.name ?? name} — Season ${show.number_of_seasons} just dropped!`, url: `/show/${tmdb_id}` }
        await sendPush(p); await logSent('new_season', tmdb_id, newSeasonNum, p); sent++
    }
    return sent
}

export async function checkNewEpisodes(): Promise<number> {
    const { data: shows } = await dbWrapper<{ tmdb_id: number; name: string; watched_seasons: number[]; episode_counts: number[] }>(
        'SELECT tmdb_id, name, watched_seasons, episode_counts FROM Watched WHERE type = $1 AND episode_counts IS NOT NULL AND ARRAY_LENGTH(episode_counts, 1) > 0', ['show']
    )
    if (!shows?.length) return 0
    let sent = 0
    for (const { tmdb_id, name, watched_seasons, episode_counts } of shows) {
        const show = await tmdb<TmdbShow>(`3/tv/${tmdb_id}`)
        if (!show) continue
        for (let i = 0; i < watched_seasons.length; i++) {
            const seasonNum = watched_seasons[i], storedCount = episode_counts[i]
            if (!storedCount) continue
            const seasonMeta = show.seasons.find((s) => s.season_number === seasonNum)
            if (!seasonMeta) continue
            const lastEp = show.last_episode_to_air
            const airedCount = lastEp?.season_number === seasonNum ? lastEp.episode_number : seasonMeta.episode_count
            if (airedCount <= storedCount) continue
            const meta = `${seasonNum}:${airedCount}`
            if (await alreadySent('new_episodes', tmdb_id, meta)) continue
            const newCount = airedCount - storedCount
            const p = {
                title: 'New Episodes Available',
                body: `${show.name ?? name} — Season ${seasonNum} has ${newCount} new episode${newCount === 1 ? '' : 's'}!`,
                url: `/show/${tmdb_id}`,
            }
            await sendPush(p); await logSent('new_episodes', tmdb_id, meta, p); sent++
        }
    }
    return sent
}

export async function checkShowEnded(): Promise<number> {
    const { data: shows } = await dbWrapper<{ tmdb_id: number; name: string; show_status: string }>(
        'SELECT tmdb_id, name, show_status FROM Watched WHERE type = $1', ['show']
    )
    if (!shows?.length) return 0
    let sent = 0
    for (const { tmdb_id, name, show_status } of shows) {
        const show = await tmdb<TmdbShow>(`3/tv/${tmdb_id}`)
        if (!show || (show.status !== 'Ended' && show.status !== 'Canceled') || show.status === show_status) continue
        if (await alreadySent('show_ended', tmdb_id)) continue
        const cancelled = show.status === 'Canceled'
        const p = {
            title: cancelled ? 'Show Cancelled' : 'Show Ended',
            body: cancelled ? `${show.name ?? name} has been cancelled.` : `${show.name ?? name} has ended.`,
            url: `/show/${tmdb_id}`,
        }
        await sendPush(p); await logSent('show_ended', tmdb_id, undefined, p); sent++
    }
    return sent
}

export async function checkNewCollectionMovie(): Promise<number> {
    const { data: allItems } = await dbWrapper<{ tmdb_id: number }>(
        'SELECT DISTINCT tmdb_id FROM Media WHERE type = $1 UNION SELECT DISTINCT tmdb_id FROM Watched WHERE type = $1',
        ['movie', 'movie']
    )
    const allIds = new Set((allItems ?? []).map((r) => r.tmdb_id))
    if (!allIds.size) return 0
    const checkedCollections = new Set<number>()
    let sent = 0
    for (const tmdb_id of allIds) {
        const movie = await tmdb<TmdbMovie>(`3/movie/${tmdb_id}`)
        if (!movie?.belongs_to_collection) continue
        const collectionId = movie.belongs_to_collection.id
        if (checkedCollections.has(collectionId)) continue
        checkedCollections.add(collectionId)
        const collection = await tmdb<TmdbCollection>(`3/collection/${collectionId}`)
        if (!collection) continue
        for (const part of collection.parts) {
            if (allIds.has(part.id) || !part.release_date) continue
            const age = daysFromNow(part.release_date)
            if (age < 0 || age > 7 || await alreadySent('collection_movie', part.id)) continue
            const p = { title: 'New Collection Movie Released', body: `${part.title} is out — part of ${collection.name}`, url: `/movie/${part.id}` }
            await sendPush(p); await logSent('collection_movie', part.id, undefined, p); sent++
        }
    }
    return sent
}

export async function runAllChecks(): Promise<void> {
    const results = await Promise.allSettled([
        checkMovieReleased(), checkUpcomingRelease(), checkWatchlistReminder(), checkInactivity(),
        checkNewSeason(), checkNewEpisodes(), checkShowEnded(), checkNewCollectionMovie(),
    ])
    const sent = results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0)
    console.log(`[notifications] ran all checks — ${sent} notification(s) sent`)
}
