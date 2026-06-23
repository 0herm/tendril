import pool from '@/utils/db'
import { NextResponse } from 'next/server'

export async function GET() {
    let db: 'ok' | 'error' = 'ok'
    let tmdb: 'ok' | 'error' | 'unconfigured' = 'ok'

    try {
        await pool.query('SELECT 1', [])
    } catch {
        db = 'error'
    }

    const token = process.env.TMDB_ACCESS_TOKEN || process.env.ACCESS_TOKEN
    if (!token) {
        tmdb = 'unconfigured'
    } else {
        try {
            const res = await fetch('https://api.themoviedb.org/3/configuration', {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            })
            if (!res.ok) tmdb = 'error'
        } catch {
            tmdb = 'error'
        }
    }

    const status = db === 'ok' && tmdb === 'ok' ? 'ok' : 'degraded'
    const httpStatus = status === 'ok' ? 200 : 503

    return NextResponse.json({ status, db, tmdb, timestamp: new Date().toISOString() }, { status: httpStatus })
}
