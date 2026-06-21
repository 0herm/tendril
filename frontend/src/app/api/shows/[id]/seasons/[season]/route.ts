import { getSeasonEpisodes } from '@/utils/tmdbApi'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string; season: string }> }) {
    const { id, season } = await params
    return NextResponse.json(await getSeasonEpisodes(Number(id), Number(season)))
}
