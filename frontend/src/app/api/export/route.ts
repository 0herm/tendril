import { getAllWatched } from '@/utils/queries'
import { getSessionUserId } from '@/utils/auth'

export async function GET() {
    const userId = await getSessionUserId()
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const { data, error } = await getAllWatched()
    if (error) return new Response('Failed to fetch watch history', { status: 500 })

    const rows = data ?? []
    const header = 'Name,Type,Added At,Watched Seasons,Episodes Per Season'
    const lines = rows.map(r => [
        `"${(r.name ?? '').replace(/"/g, '""')}"`,
        r.type ?? '',
        r.added_at ? new Date(r.added_at).toISOString().slice(0, 10) : '',
        (r.watched_seasons ?? []).join(';'),
        (r.episode_counts ?? []).join(';'),
    ].join(','))

    const csv = [header, ...lines].join('\n')
    const date = new Date().toISOString().slice(0, 10)

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="tendril-watched-${date}.csv"`,
        },
    })
}
