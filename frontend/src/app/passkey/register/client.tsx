'use client'

import { useState } from 'react'
import { getRegistrationOptions, verifyRegistration } from '@/utils/auth'
import { toBuffer, toBase64url } from '@/utils/passkey'
import { Clapperboard, Fingerprint } from 'lucide-react'
import { Button } from '@/ui/button'
import Link from 'next/link'

export default function RegisterClient() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleRegister() {
        setLoading(true)
        setError(null)
        try {
            const options = await getRegistrationOptions()
            const cred = await navigator.credentials.create({
                publicKey: {
                    ...options,
                    challenge: toBuffer(options.challenge),
                    user: { ...options.user, id: toBuffer(options.user.id) },
                    excludeCredentials: (options.excludeCredentials ?? []).map((c: { id: string }) => ({
                        ...c, id: toBuffer(c.id),
                    })) as PublicKeyCredentialDescriptor[],
                },
            }) as PublicKeyCredential
            const resp = cred.response as AuthenticatorAttestationResponse
            const response = {
                id: cred.id,
                rawId: toBase64url(cred.rawId),
                response: {
                    attestationObject: toBase64url(resp.attestationObject),
                    clientDataJSON: toBase64url(resp.clientDataJSON),
                },
                type: cred.type as 'public-key',
                clientExtensionResults: cred.getClientExtensionResults(),
            }
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
        <div className='w-full flex flex-col items-center justify-center gap-10 py-20 max-w-xs mx-auto text-center'>
            <div className='flex flex-col items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-brand/15 mb-2'>
                    <Clapperboard className='h-5 w-5 text-brand' />
                </div>
                <span className='text-base font-bold tracking-tight'>
                    Watch<span className='text-brand'>Bee</span>
                </span>
            </div>

            <div className='flex flex-col items-center gap-5'>
                <div className='flex h-20 w-20 items-center justify-center rounded-3xl bg-muted ring-1 ring-border'>
                    <Fingerprint className='h-10 w-10 text-brand' />
                </div>
                <div className='flex flex-col gap-2'>
                    <h1 className='text-2xl font-bold tracking-tight'>Welcome to WatchBee</h1>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                        Create a passkey to get started. Stored securely on this device.
                    </p>
                </div>
            </div>

            {error && (
                <p className='text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5 w-full'>{error}</p>
            )}

            <div className='w-full flex flex-col gap-3'>
                <Button
                    className='w-full h-12 text-sm font-semibold rounded-xl gap-2'
                    onClick={handleRegister}
                    disabled={loading}
                >
                    <Fingerprint className='h-4 w-4' />
                    {loading ? 'Creating passkey…' : 'Create Passkey'}
                </Button>
                <Link href='/passkey/login' className='text-xs text-muted-foreground hover:text-foreground transition-colors'>
                    Sign in with an existing passkey
                </Link>
            </div>
        </div>
    )
}
