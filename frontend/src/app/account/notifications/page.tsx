'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser } from './actions'
import { Button } from '@/ui/button'
import { Bell, BellOff, Film, Share, Smartphone, Tv } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
    return outputArray
}

function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [permissionDenied, setPermissionDenied] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            setPermissionDenied(Notification.permission === 'denied')
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            })
            const sub = await registration.pushManager.getSubscription()
            setSubscription(sub)
        } catch (err) {
            setError(`Service worker failed to register: ${err instanceof Error ? err.message : String(err)}`)
        }
    }

    async function subscribeToPush() {
        setError(null)
        setLoading(true)
        try {
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                setPermissionDenied(true)
                return
            }
            const registration = await navigator.serviceWorker.ready
            if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
                setError('VAPID public key is not configured.')
                return
            }
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
            })
            setSubscription(sub)
            const serializedSub = JSON.parse(JSON.stringify(sub))
            const result = await subscribeUser(serializedSub)
            if (!result.success) {
                setError(`Failed to save subscription: ${result.error}`)
                await sub.unsubscribe()
                setSubscription(null)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    async function unsubscribeFromPush() {
        setError(null)
        setLoading(true)
        try {
            await subscription?.unsubscribe()
            setSubscription(null)
            await unsubscribeUser()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
            <div className='flex items-center gap-3 px-4 py-4 border-b border-border'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0'>
                    <Bell className='h-4 w-4' />
                </div>
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                        <p className='text-sm font-medium'>Push Notifications</p>
                        {isSupported && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                                subscription
                                    ? 'bg-brand/15 text-brand'
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                                {subscription ? 'Active' : 'Off'}
                            </span>
                        )}
                    </div>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                        {!isSupported
                            ? 'Not supported in this browser'
                            : 'Get notified about new releases'}
                    </p>
                </div>
            </div>
            <div className='px-4 py-4 flex flex-col gap-3'>
                {!isSupported ? (
                    <p className='text-sm text-muted-foreground'>Push notifications are not supported in this browser.</p>
                ) : permissionDenied ? (
                    <p className='text-sm text-muted-foreground'>Notifications are blocked. Enable them in your browser or device settings.</p>
                ) : subscription ? (
                    <Button variant='destructive' onClick={unsubscribeFromPush} disabled={loading} className='w-full'>
                        <BellOff className='h-4 w-4' />
                        Unsubscribe
                    </Button>
                ) : (
                    <Button onClick={subscribeToPush} disabled={loading} className='w-full'>
                        <Bell className='h-4 w-4' />
                        {loading ? 'Subscribing…' : 'Subscribe to Notifications'}
                    </Button>
                )}
                {error && <p className='text-xs text-destructive'>{error}</p>}
            </div>
        </div>
    )
}

function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(true)

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream)
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    }, [])

    if (isStandalone) return null

    return (
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
            <div className='flex items-center gap-3 px-4 py-4 border-b border-border'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0'>
                    <Smartphone className='h-4 w-4' />
                </div>
                <div>
                    <p className='text-sm font-medium'>Install App</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>Add to home screen for a native app experience</p>
                </div>
            </div>
            <div className='px-4 py-4'>
                {isIOS ? (
                    <p className='text-sm text-muted-foreground'>
                        Tap the <Share className='inline-block align-middle mb-0.5 h-3.5 w-3.5' /> share button then <strong className='text-foreground'>Add to Home Screen</strong>
                    </p>
                ) : (
                    <Button className='w-full'>Add to Home Screen</Button>
                )}
            </div>
        </div>
    )
}

function RecentAlerts() {
    const [entries, setEntries] = useState<NotificationEntry[]>([])

    useEffect(() => {
        fetch('/api/notifications')
            .then(r => r.json())
            .then(({ data }) => setEntries(data ?? []))
            .catch(() => {})
    }, [])

    const icon = (type: string) => {
        if (type.includes('movie') || type.includes('collection')) return <Film className='h-3.5 w-3.5' />
        if (type.includes('show') || type.includes('season') || type.includes('episode')) return <Tv className='h-3.5 w-3.5' />
        return <Bell className='h-3.5 w-3.5' />
    }

    return (
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
            <div className='flex items-center gap-3 px-4 py-4 border-b border-border'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0'>
                    <Bell className='h-4 w-4' />
                </div>
                <div>
                    <p className='text-sm font-medium'>Recent Alerts</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>Notifications sent by Tendril</p>
                </div>
            </div>
            <div className='divide-y divide-border'>
                {entries.length === 0 ? (
                    <div className='flex flex-col items-center gap-2 px-4 py-8 text-center'>
                        <Bell className='h-5 w-5 text-muted-foreground/40' />
                        <p className='text-sm text-muted-foreground'>No notifications sent yet.</p>
                    </div>
                ) : entries.map(e => (
                    <div key={e.id} className='flex items-start gap-3 px-4 py-3.5'>
                        <div className='mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0'>
                            {icon(e.type)}
                        </div>
                        <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
                            <p className='text-sm font-medium truncate'>{e.notif_title}</p>
                            <p className='text-xs text-muted-foreground leading-relaxed'>{e.notif_body}</p>
                            <p className='text-[11px] text-muted-foreground/50 mt-0.5'>
                                {new Date(e.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <div className='w-full flex flex-col gap-4 max-w-xl'>
            <div className='flex flex-col gap-0.5'>
                <h1 className='text-lg font-semibold'>Notifications</h1>
                <p className='text-xs text-muted-foreground'>Push notifications and app installation.</p>
            </div>
            <PushNotificationManager />
            <InstallPrompt />
            <RecentAlerts />
        </div>
    )
}
