'use client'

import { useState } from 'react'
import { getRegistrationOptions, verifyRegistration } from '@/utils/auth'
import { startRegistration } from '@simplewebauthn/browser'
import { Fingerprint } from 'lucide-react'
import Link from 'next/link'
import AuthPageShell from '../authPageShell'

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
            <button
                onClick={handleRegister}
                disabled={loading}
                className='group w-full h-[3.25rem] flex items-center justify-center gap-2.5 rounded-2xl bg-brand hover:bg-brand-dim active:bg-brand-dimmer text-white text-sm font-semibold transition-all duration-200 shadow-[0_8px_32px_oklch(0.68_0.18_155/25%)] disabled:opacity-60 disabled:pointer-events-none'
            >
                <Fingerprint className='h-[1.125rem] w-[1.125rem] transition-transform group-hover:scale-105' />
                {loading ? 'Creating passkey…' : 'Create Passkey'}
            </button>
            <Link
                href='/passkey/login'
                className='text-center text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors py-1'
            >
                Already have an account? Sign in
            </Link>
        </AuthPageShell>
    )
}
