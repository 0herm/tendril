async function request<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
    try {
        const res = await fetch(url, options)
        return res.json()
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
}

const json = (body: unknown) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
})

export function getAllLists(): Promise<ApiResult<ListProps[]>> {
    return request<ListProps[]>('/api/lists')
}

export function checkMediaInList(tmdbId: number, listId: number): Promise<ApiResult<boolean>> {
    return request<boolean>(`/api/lists/${listId}/media/${tmdbId}`)
}

export function addMedia(tmdbId: number, type: MediaType, listId: number): Promise<ApiResult<MediaProps | null>> {
    return request<MediaProps | null>(`/api/lists/${listId}/media`, json({ tmdbId, type }))
}

export function removeMedia(tmdbId: number, listId: number): Promise<ApiResult<MediaProps | null>> {
    return request<MediaProps | null>(`/api/lists/${listId}/media/${tmdbId}`, { method: 'DELETE' })
}

export function getWatchedById(tmdbId: number): Promise<ApiResult<WatchedProps | null>> {
    return request<WatchedProps | null>(`/api/watched/${tmdbId}`)
}

export function addWatched(
    tmdbId: number, type: 'movie' | 'show', name: string,
    totalSeasons?: number, showStatus?: string, watchedSeasons?: number[], episodeCounts?: number[]
): Promise<ApiResult<WatchedProps | null>> {
    return request<WatchedProps | null>('/api/watched', json({ tmdbId, type, name, totalSeasons, showStatus, watchedSeasons, episodeCounts }))
}

export function removeWatched(tmdbId: number): Promise<ApiResult<WatchedProps | null>> {
    return request<WatchedProps | null>(`/api/watched/${tmdbId}`, { method: 'DELETE' })
}

export function updateWatchedSeasons(tmdbId: number, watchedSeasons: number[], episodeCounts?: number[]): Promise<ApiResult<WatchedProps | null>> {
    return request<WatchedProps | null>(`/api/watched/${tmdbId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ watchedSeasons, episodeCounts }) })
}

export function updateShowStatus(tmdbId: number, showStatus: string): Promise<ApiResult<WatchedProps | null>> {
    return request<WatchedProps | null>(`/api/watched/${tmdbId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ showStatus }) })
}

export function updateTotalSeasons(tmdbId: number, totalSeasons: number): Promise<ApiResult<WatchedProps | null>> {
    return request<WatchedProps | null>(`/api/watched/${tmdbId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ totalSeasons }) })
}

export function getShowTotalSeasons(tmdbId: number): Promise<ApiResult<number>> {
    return request<number>(`/api/shows/${tmdbId}/seasons`)
}
