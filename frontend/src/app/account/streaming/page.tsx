import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
import { getUserSettings, updateUser } from '@/utils/queries'
import { getWatchProviders } from '@/utils/tmdbApi'
import StreamingClient from './client'

export default async function StreamingPage() {
    const userId = await getSessionUserId()
    if (!userId) redirect('/passkey/login')

    const [{ data: settings }, { data: movieProviders }, { data: tvProviders }] = await Promise.all([
        getUserSettings(userId),
        getWatchProviders('movie'),
        getWatchProviders('tv'),
    ])

    const providerMap = new Map<number, WatchProvider>()
    for (const p of [...(movieProviders ?? []), ...(tvProviders ?? [])]) {
        if (!providerMap.has(p.provider_id)) providerMap.set(p.provider_id, p)
    }
    const providers = Array.from(providerMap.values()).sort((a, b) => a.display_priority - b.display_priority)

    async function saveAction(ids: number[]) {
        'use server'
        const uid = await getSessionUserId()
        if (!uid) redirect('/passkey/login')
        await updateUser(uid, { streaming_providers: ids })
        revalidateTag('app-settings', {})
    }

    return (
        <StreamingClient
            providers={providers}
            saved={settings?.streaming_providers ?? []}
            saveAction={saveAction}
        />
    )
}
