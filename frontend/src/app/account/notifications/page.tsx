'use client'

import { useState, useEffect, type ElementType, type ReactNode } from 'react'
import { subscribeUser, unsubscribeUser } from './actions'
import { Button } from '@/ui/button'
import { Bell, BellOff, Film, Share, Smartphone, Tv } from 'lucide-react'

const toUint8 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0))

function CardPanel({ icon: Icon, title, subtitle, children }: { icon: ElementType; title: string; subtitle: string; children: ReactNode }) {
    return (
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
            <div className='flex items-center gap-3 px-4 py-4 border-b border-border'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0'>
                    <Icon className='h-4 w-4' />
                </div>
                <div>
                    <p className='text-sm font-medium'>{title}</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    )
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
            navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
                .then((reg) => reg.pushManager.getSubscription().then(setSubscription))
                .catch((err) => setError(`Service worker failed to register: ${err instanceof Error ? err.message : String(err)}`))
        }
    }, [])

    async function subscribeToPush() {
        setError(null); setLoading(true)
        try {
            if (await Notification.requestPermission() !== 'granted') { setPermissionDenied(true); return }
            const reg = await navigator.serviceWorker.ready
            if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) { setError('VAPID public key is not configured.'); return }
            const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toUint8(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) })
            setSubscription(sub)
            const result = await subscribeUser(JSON.parse(JSON.stringify(sub)))
            if (!result.success) { setError(`Failed to save subscription: ${result.error}`); await sub.unsubscribe(); setSubscription(null) }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally { setLoading(false) }
    }

    async function unsubscribeFromPush() {
        setError(null); setLoading(true)
        try { await subscription?.unsubscribe(); setSubscription(null); await unsubscribeUser() }
        catch (err) { setError(err instanceof Error ? err.message : String(err)) }
        finally { setLoading(false) }
    }

    return (
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
            <div className='flex items-center gap-3 px-4 py-4 border-b border-border'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0'><Bell className='h-4 w-4' /></div>
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                        <p className='text-sm font-medium'>Push Notifications</p>
                        {isSupported && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                                subscription ? 'bg-brand/15 text-brand' : 'bg-muted text-muted-foreground'
                            }`}>
                                {subscription ? 'Active' : 'Off'}
                            </span>
                        )}
                    </div>
                    <p className='text-xs text-muted-foreground mt-0.5'>{!isSupported ? 'Not supported in this browser' : 'Get notified about new releases'}</p>
                </div>
            </div>
            <div className='px-4 py-4 flex flex-col gap-3'>
                {!isSupported ? (
                    <p className='text-sm text-muted-foreground'>Push notifications are not supported in this browser.</p>
                ) : permissionDenied ? (
                    <p className='text-sm text-muted-foreground'>Notifications are blocked. Enable them in your browser or device settings.</p>
                ) : subscription ? (
                    <Button variant='destructive' onClick={unsubscribeFromPush} disabled={loading} className='w-full'><BellOff className='h-4 w-4' />Unsubscribe</Button>
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
        <div className='text-[13px] text-muted-foreground flex items-center gap-2.5 bg-muted/50 p-3 rounded-lg border border-border/50'>
            <Smartphone className='h-4 w-4 shrink-0' />
            <div className='leading-relaxed'>
                <strong className='text-foreground font-medium'>Install App:</strong>{' '}
                {isIOS ? (
                    <>
                        Tap the{' '}
                        <Share className='inline-block align-middle mb-0.5 h-3.5 w-3.5 mx-0.5' />{' '}
                        share button then{' '}
                        <strong className='text-foreground font-medium'>Add to Home Screen</strong>
                    </>
                ) : (
                    <>Open your browser menu and select <strong className='text-foreground font-medium'>Add to Home Screen</strong></>
                )}{' '}
                for a native app experience.
            </div>
        </div>
    )
}

function RecentAlerts() {
    const [entries, setEntries] = useState<NotificationEntry[]>([])

    useEffect(() => {
        fetch('/api/notifications').then(r => r.json()).then(({ data }) => setEntries(data ?? [])).catch(() => {})
    }, [])

    return (
        <CardPanel icon={Bell} title='Recent Alerts' subtitle='Notifications sent by Tendril'>
            <div className='divide-y divide-border'>
                {entries.length === 0 ? (
                    <div className='flex flex-col items-center gap-2 px-4 py-8 text-center'>
                        <Bell className='h-5 w-5 text-muted-foreground/40' />
                        <p className='text-sm text-muted-foreground'>No notifications sent yet.</p>
                    </div>
                ) : entries.map(e => (
                    <div key={e.id} className='flex items-start gap-3 px-4 py-3.5'>
                        <div className='mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0'>
                            {e.type.includes('movie') || e.type.includes('collection') ? <Film className='h-3.5 w-3.5' />
                                : e.type.includes('show') || e.type.includes('season') || e.type.includes('episode') ? <Tv className='h-3.5 w-3.5' />
                                    : <Bell className='h-3.5 w-3.5' />}
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
        </CardPanel>
    )
}

export default function Page() {
    return (
        <div className='w-full flex flex-col gap-4 max-w-xl'>
            <div className='flex flex-col gap-0.5'>
                <h1 className='text-lg font-semibold'>Notifications</h1>
                <p className='text-xs text-muted-foreground'>Push notifications and app installation.</p>
            </div>
            <InstallPrompt />
            <PushNotificationManager />
            <RecentAlerts />
        </div>
    )
}
