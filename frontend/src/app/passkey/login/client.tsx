'use client'

import { useState } from 'react'
import { getAuthenticationOptions, verifyAuthentication } from '@/utils/auth'
import { startAuthentication } from '@simplewebauthn/browser'
import AuthPageShell, { PasskeyButton } from '../authPageShell'

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
            <PasskeyButton onClick={handleLogin} loading={loading}>
                {loading ? 'Authenticating…' : 'Sign in with Passkey'}
            </PasskeyButton>
        </AuthPageShell>
    )
}
