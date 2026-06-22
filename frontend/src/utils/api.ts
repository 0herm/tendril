'use server'

import run from './db'
import { getDetailsShow } from './tmdbApi'

export async function getShowTotalSeasons(tmdbId: number): Promise<number> {
    const { data } = await getDetailsShow(tmdbId)
    return data?.number_of_seasons ?? 0
}

export async function getShowDetails(tmdbId: number): Promise<ShowDetailsProps | null> {
    const { data } = await getDetailsShow(tmdbId)
    return data ?? null
}

type DbParam = string | number | boolean | null | Buffer | string[]

export async function dbWrapper<T>(query: string, params: DbParam[] = []): Promise<ApiResult<T[]>> {
    try {
        const result = await run(query, params)
        return { data: result.rows as T[], error: null }
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error!'
        console.error(msg)
        return { data: null, error: msg }
    }
}

export async function getUserSettings(userId: number): Promise<ApiResult<UserSettingsProps | null>> {
    const query = 'SELECT region, language, original_title, include_adult, timezone FROM Users WHERE id = $1'
    const { data, error } = await dbWrapper<UserSettingsProps>(query, [userId])
    return { data: data?.[0] ?? null, error }
}

export async function updateUser(userId: number, updates: {
    region?: string,
    language?: string,
    original_title?: boolean,
    include_adult?: boolean,
    timezone?: string,
    subscription?: string | null
}): Promise<ApiResult<UserProps | null>> {
    const fields: string[] = []
    const values: DbParam[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            fields.push(`${key} = $${paramIndex++}`)
            values.push(value)
        }
    }

    if (fields.length === 0) {
        return { data: null, error: null }
    }

    const query = `UPDATE Users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`
    values.push(userId)
    const { data: resultData, error } = await dbWrapper<UserProps>(query, values)
    return { data: resultData?.[0] ?? null, error }
}

export async function getAllLists(): Promise<ApiResult<ListProps[]>> {
    return dbWrapper<ListProps>('SELECT * FROM Lists ORDER BY created_at DESC')
}

export async function addMedia(tmdbId: number, type: 'movie' | 'show', listId: number): Promise<ApiResult<MediaProps | null>> {
    const query = 'INSERT INTO Media (tmdb_id, type, list_id) VALUES ($1, $2, $3) RETURNING *'
    const { data, error } = await dbWrapper<MediaProps>(query, [tmdbId, type, listId])
    return { data: data?.[0] ?? null, error }
}

export async function removeMedia(tmdbId: number, listId: number): Promise<ApiResult<MediaProps | null>> {
    const query = 'DELETE FROM Media WHERE tmdb_id = $1 AND list_id = $2 RETURNING *'
    const { data, error } = await dbWrapper<MediaProps>(query, [tmdbId, listId])
    return { data: data?.[0] ?? null, error }
}

export async function getMediaByListId(listId: number): Promise<ApiResult<MediaProps[]>> {
    return dbWrapper<MediaProps>('SELECT * FROM Media WHERE list_id = $1 ORDER BY added_at DESC', [listId])
}

export async function checkMediaInList(tmdbId: number, listId: number): Promise<ApiResult<boolean>> {
    const query = 'SELECT COUNT(*) as count FROM Media WHERE tmdb_id = $1 AND list_id = $2'
    const { data, error } = await dbWrapper<{ count: string }>(query, [tmdbId, listId])
    return { data: Number(data?.[0]?.count ?? 0) > 0, error }
}

export async function addWatched(
    tmdbId: number, type: 'movie' | 'show', name: string,
    totalSeasons?: number, showStatus?: string, watchedSeasons?: number[], episodeCounts?: number[]
): Promise<ApiResult<WatchedProps | null>> {
    const query = 'INSERT INTO Watched (tmdb_id, type, name, total_seasons, show_status, watched_seasons, episode_counts) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
    const isShow = type === 'show'
    const { data, error } = await dbWrapper<WatchedProps>(query, [
        tmdbId, type, name,
        isShow ? (totalSeasons ?? null) : null,
        isShow ? (showStatus ?? null) : null,
        watchedSeasons ? `{${watchedSeasons.join(',')}}` : null,
        episodeCounts ? `{${episodeCounts.join(',')}}` : null,
    ])
    return { data: data?.[0] ?? null, error }
}

export async function removeWatched(tmdbId: number): Promise<ApiResult<WatchedProps | null>> {
    const query = 'DELETE FROM Watched WHERE tmdb_id = $1 RETURNING *'
    const { data, error } = await dbWrapper<WatchedProps>(query, [tmdbId])
    return { data: data?.[0] ?? null, error }
}

export async function getAllWatched(): Promise<ApiResult<WatchedProps[]>> {
    return dbWrapper<WatchedProps>('SELECT * FROM Watched ORDER BY added_at DESC')
}

export async function getWatchedById(tmdbId: number): Promise<ApiResult<WatchedProps | null>> {
    const query = 'SELECT * FROM Watched WHERE tmdb_id = $1'
    const { data, error } = await dbWrapper<WatchedProps>(query, [tmdbId])
    return { data: data?.[0] ?? null, error }
}

export async function updateWatched(tmdbId: number, fields: {
    watchedSeasons?: number[]
    episodeCounts?: number[]
    showStatus?: string
    totalSeasons?: number
}): Promise<ApiResult<WatchedProps | null>> {
    const sets: string[] = []
    const values: DbParam[] = [tmdbId]
    const set = (col: string, value: DbParam) => sets.push(`${col} = $${values.push(value)}`)

    if (fields.watchedSeasons !== undefined) set('watched_seasons', `{${fields.watchedSeasons.join(',')}}`)
    if (fields.episodeCounts !== undefined) set('episode_counts', `{${fields.episodeCounts.join(',')}}`)
    if (fields.showStatus !== undefined) set('show_status', fields.showStatus)
    if (fields.totalSeasons !== undefined) set('total_seasons', fields.totalSeasons)

    if (sets.length === 0) return { data: null, error: null }

    const query = `UPDATE Watched SET ${sets.join(', ')} WHERE tmdb_id = $1 RETURNING *`
    const { data, error } = await dbWrapper<WatchedProps>(query, values)
    return { data: data?.[0] ?? null, error }
}

export async function getContinueWatching(): Promise<ApiResult<WatchedProps[]>> {
    return dbWrapper<WatchedProps>(`
        SELECT * FROM Watched
        WHERE ARRAY_LENGTH(watched_seasons, 1) < total_seasons
           OR (type = 'show' AND show_status = 'Returning Series' AND ARRAY_LENGTH(watched_seasons, 1) > 0)
        ORDER BY added_at DESC
    `)
}
