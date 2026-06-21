import { getSimilarMovies, getSimilarShows } from '@/utils/tmdbApi'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ tmdbId: string }> }) {
    const type = req.nextUrl.searchParams.get('type')
    const { tmdbId } = await params
    const id = Number(tmdbId)
    const result = type === 'show' ? await getSimilarShows(id) : await getSimilarMovies(id)
    return NextResponse.json(result)
}
