'use client'

import { useState } from 'react'
import { getAuthenticationOptions, verifyAuthentication } from '@/utils/auth'
import { startAuthentication } from '@simplewebauthn/browser'
import { Fingerprint } from 'lucide-react'
import AuthPageShell from '../authPageShell'

export default function LoginClient() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin() {
        setLoading(true)
        setError(null)
        try {
            const options = await getAuthenticationOptions()
            const response = await startAuthentication({ optionsJSON: options })
            const result = await verifyAuthentication(response)
            if (result.success) {
                window.location.href = '/'
            } else {
                setError(result.error ?? 'Authentication failed')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageShell title='Welcome back' description='Sign in with your passkey to continue.'>
            {error && (
                <p className='text-xs text-destructive/90 bg-destructive/8 border border-destructive/15 rounded-xl px-4 py-2.5 text-center leading-relaxed'>
                    {error}
                </p>
            )}
            <button
                onClick={handleLogin}
                disabled={loading}
                className='group w-full h-[3.25rem] flex items-center justify-center gap-2.5 rounded-2xl bg-brand hover:bg-brand-dim active:bg-brand-dimmer text-white text-sm font-semibold transition-all duration-200 shadow-[0_8px_32px_oklch(0.68_0.18_155/25%)] disabled:opacity-60 disabled:pointer-events-none'
            >
                <Fingerprint className='h-[1.125rem] w-[1.125rem] transition-transform group-hover:scale-105' />
                {loading ? 'Authenticating…' : 'Sign in with Passkey'}
            </button>
        </AuthPageShell>
    )
}
