'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser } from './actions'
import { Button } from '@/ui/button'
import { Bell, BellOff, Share, Smartphone } from 'lucide-react'

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
                <div>
                    <p className='text-sm font-medium'>Push Notifications</p>
                    <p className='text-xs text-muted-foreground flex items-center gap-1.5'>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${subscription ? 'bg-brand' : 'bg-muted-foreground/40'}`} />
                        {!isSupported ? 'Not supported in this browser' : subscription ? 'Active' : 'Not subscribed'}
                    </p>
                </div>
            </div>
            <div className='px-4 py-4 flex flex-col gap-3'>
                {!isSupported ? (
                    <p className='text-sm text-muted-foreground'>Push notifications are not supported in this browser.</p>
                ) : permissionDenied ? (
                    <p className='text-sm text-muted-foreground'>Notifications are blocked. Enable them in your browser or device settings.</p>
                ) : subscription ? (
                    <Button variant='destructive' onClick={unsubscribeFromPush} disabled={loading} className='w-full rounded-xl'>
                        <BellOff className='h-4 w-4 mr-2' />
                        Unsubscribe
                    </Button>
                ) : (
                    <Button onClick={subscribeToPush} disabled={loading} className='w-full rounded-xl'>
                        <Bell className='h-4 w-4 mr-2' />
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
                    <p className='text-xs text-muted-foreground'>Add to home screen for app experience</p>
                </div>
            </div>
            <div className='px-4 py-4'>
                {isIOS ? (
                    <p className='text-sm text-muted-foreground'>
                        Tap the <Share className='inline-block align-middle mb-0.5 h-3.5 w-3.5' /> share button then <strong>Add to Home Screen</strong>
                    </p>
                ) : (
                    <Button className='w-full rounded-xl'>Add to Home Screen</Button>
                )}
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
        </div>
    )
}
