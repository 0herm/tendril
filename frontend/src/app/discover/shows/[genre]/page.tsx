import MediaCard from '@/components/mediaCard/mediaCard'
import { discoverShows } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function Page({ params, searchParams }: { params: Promise<{ genre: string }>; searchParams: Promise<{ name?: string }> }) {
    if (!await getSessionUserId()) redirect('/passkey/login')

    const { genre } = await params
    const { name } = await searchParams
    const { data } = await discoverShows(Number(genre))
    const results = data?.results ?? []

    return (
        <div className='w-full flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
                <Link href='/discover' className='flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0'>
                    <ArrowLeft className='h-4 w-4' />
                    <span className='hidden xs:inline'>Discover</span>
                </Link>
                <h1 className='text-base font-semibold truncate'>{name ?? 'Shows'}</h1>
            </div>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3'>
                {results.map((item, index) => (
                    <MediaCard key={index} item={item} />
                ))}
            </div>
        </div>
    )
}
