import { dbWrapper } from '@/utils/queries'
import { NextResponse } from 'next/server'

export async function GET() {
    const result = await dbWrapper<NotificationEntry>(
        'SELECT id, type, tmdb_id, notif_title, notif_body, notif_url, sent_at FROM NotificationLog WHERE notif_title IS NOT NULL ORDER BY sent_at DESC LIMIT 30',
        []
    )
    return NextResponse.json(result)
}
