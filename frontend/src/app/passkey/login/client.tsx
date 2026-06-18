'use client'

import { useState } from 'react'
import { getAuthenticationOptions, verifyAuthentication } from '@/utils/auth'
import { toBuffer, toBase64url } from '@/utils/passkey'
import { Clapperboard, Fingerprint } from 'lucide-react'
import { Button } from '@/ui/button'

export default function LoginClient() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin() {
        setLoading(true)
        setError(null)
        try {
            const options = await getAuthenticationOptions()
            const cred = await navigator.credentials.get({
                publicKey: {
                    ...options,
                    challenge: toBuffer(options.challenge),
                    allowCredentials: (options.allowCredentials ?? []).map((c: { id: string }) => ({
                        ...c, id: toBuffer(c.id),
                    })) as PublicKeyCredentialDescriptor[],
                },
            }) as PublicKeyCredential
            const resp = cred.response as AuthenticatorAssertionResponse
            const response = {
                id: cred.id,
                rawId: toBase64url(cred.rawId),
                response: {
                    authenticatorData: toBase64url(resp.authenticatorData),
                    clientDataJSON: toBase64url(resp.clientDataJSON),
                    signature: toBase64url(resp.signature),
                    userHandle: resp.userHandle ? toBase64url(resp.userHandle) : undefined,
                },
                type: cred.type as 'public-key',
                clientExtensionResults: cred.getClientExtensionResults(),
            }
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
        <div className='w-full flex flex-col items-center justify-center gap-10 py-20 max-w-xs mx-auto text-center'>
            <div className='flex flex-col items-center gap-2'>
                <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-brand/15 mb-2'>
                    <Clapperboard className='h-5 w-5 text-brand' />
                </div>
                <span className='text-base font-bold tracking-tight'>
                    Tendril
                </span>
            </div>

            <div className='flex flex-col items-center gap-5'>
                <div className='flex h-20 w-20 items-center justify-center rounded-3xl bg-muted ring-1 ring-border'>
                    <Fingerprint className='h-10 w-10 text-brand' />
                </div>
                <div className='flex flex-col gap-2'>
                    <h1 className='text-2xl font-bold tracking-tight'>Welcome back</h1>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                        Authenticate with your passkey to continue.
                    </p>
                </div>
            </div>

            {error && (
                <p className='text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5 w-full'>{error}</p>
            )}

            <Button
                className='w-full h-12 text-sm font-semibold rounded-xl gap-2 bg-brand hover:bg-brand-dim active:bg-brand-dimmer text-white'
                onClick={handleLogin}
                disabled={loading}
            >
                <Fingerprint className='h-4 w-4' />
                {loading ? 'Authenticating…' : 'Sign in with Passkey'}
            </Button>
        </div>
    )
}
