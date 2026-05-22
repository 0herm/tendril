import { getWatchedById, removeWatched, updateWatchedSeasons, updateShowStatus, updateTotalSeasons } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ tmdbId: string }> }) {
    const { tmdbId } = await params
    return NextResponse.json(await getWatchedById(Number(tmdbId)))
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ tmdbId: string }> }) {
    const { tmdbId } = await params
    return NextResponse.json(await removeWatched(Number(tmdbId)))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ tmdbId: string }> }) {
    const { tmdbId } = await params
    const body = await req.json()
    const id = Number(tmdbId)

    if (body.watchedSeasons !== undefined) return NextResponse.json(await updateWatchedSeasons(id, body.watchedSeasons, body.episodeCounts))
    if (body.showStatus !== undefined) return NextResponse.json(await updateShowStatus(id, body.showStatus))
    if (body.totalSeasons !== undefined) return NextResponse.json(await updateTotalSeasons(id, body.totalSeasons))

    return NextResponse.json({ data: null, error: 'Unknown update field' }, { status: 400 })
}
