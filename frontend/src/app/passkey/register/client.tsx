'use client'

import { useState } from 'react'
import { getRegistrationOptions, verifyRegistration } from '@/utils/auth'
import { startRegistration } from '@simplewebauthn/browser'
import Link from 'next/link'
import AuthPageShell, { PasskeyButton } from '../authPageShell'

export default function RegisterClient() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleRegister() {
        setLoading(true)
        setError(null)
        try {
            const options = await getRegistrationOptions()
            const response = await startRegistration({ optionsJSON: options })
            const result = await verifyRegistration(response)
            if (result.success) {
                window.location.href = '/'
            } else {
                setError(result.error ?? 'Registration failed')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageShell title='Get started' description='Create a passkey to begin tracking movies and shows.'>
            {error && (
                <p className='text-xs text-destructive/90 bg-destructive/8 border border-destructive/15 rounded-xl px-4 py-2.5 text-center leading-relaxed'>
                    {error}
                </p>
            )}
            <PasskeyButton onClick={handleRegister} loading={loading}>
                {loading ? 'Creating passkey…' : 'Create Passkey'}
            </PasskeyButton>
            <Link
                href='/passkey/login'
                className='text-center text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors py-1'
            >
                Already have an account? Sign in
            </Link>
        </AuthPageShell>
    )
}
