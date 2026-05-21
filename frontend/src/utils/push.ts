import webpush from 'web-push'
import { dbWrapper } from '@/utils/api'

type PushPayload = {
    title: string
    body: string
    url?: string
}

function initVapid() {
    const pub  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const priv = process.env.VAPID_PRIVATE_KEY
    const origin = process.env.ORIGIN
    if (!pub || !priv) throw new Error('VAPID keys not configured')
    webpush.setVapidDetails(origin ?? 'mailto:admin@watchbee.local', pub, priv)
}

export async function sendPush(payload: PushPayload): Promise<void> {
    const { data } = await dbWrapper<{ subscription: string }>(
        'SELECT subscription FROM Users WHERE subscription IS NOT NULL LIMIT 1',
        []
    )
    if (!data?.length) return

    let subscription: webpush.PushSubscription
    try {
        subscription = JSON.parse(data[0].subscription) as webpush.PushSubscription
    } catch {
        return
    }

    initVapid()
    await webpush.sendNotification(subscription, JSON.stringify(payload))
}
