import { addWatched } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { tmdbId, type, name, totalSeasons, showStatus, watchedSeasons, episodeCounts } = await req.json()
    return NextResponse.json(await addWatched(Number(tmdbId), type, name, totalSeasons, showStatus, watchedSeasons, episodeCounts))
}
