import { getSimilarMovies, getSimilarShows } from '@/utils/tmdbApi'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { tmdbId: string } }) {
    const type = req.nextUrl.searchParams.get('type')
    const id = Number(params.tmdbId)
    const result = type === 'show' ? await getSimilarShows(id) : await getSimilarMovies(id)
    return NextResponse.json(result)
}
