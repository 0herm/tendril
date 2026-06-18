'use server'

import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
} from '@simplewebauthn/server'
import { cookies } from 'next/headers'
import { dbWrapper } from './api'
import crypto from 'crypto'

const RP_NAME = 'Tendril'
const RP_ID = process.env.RP_ID || 'localhost'
const ORIGIN = process.env.ORIGIN || 'http://localhost:3002'
const SESSION_DURATION_DAYS = 2

async function saveChallenge(challenge: string) {
    await dbWrapper('INSERT INTO Challenges (challenge) VALUES ($1)', [challenge])
    await dbWrapper('DELETE FROM Challenges WHERE created_at < NOW() - INTERVAL \'5 minutes\'', [])
}

async function consumeChallenge(challenge: string): Promise<boolean> {
    const { data } = await dbWrapper<{ challenge: string }>(
        'DELETE FROM Challenges WHERE challenge = $1 RETURNING challenge',
        [challenge]
    )
    return (data?.length ?? 0) > 0
}

async function createSession(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)
    await dbWrapper(
        'INSERT INTO Sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
        [token, userId, expiresAt.toISOString()]
    )
    return token
}

async function setSessionCookie(token: string) {
    const jar = await cookies()
    jar.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    })
}

export async function getSessionUserId(): Promise<number | null> {
    const jar = await cookies()
    const token = jar.get('session')?.value
    if (!token) return null

    const { data } = await dbWrapper<{ user_id: number }>(
        'SELECT user_id FROM Sessions WHERE token = $1 AND expires_at > NOW()',
        [token]
    )
    return data?.[0]?.user_id ?? null
}

export async function hasCredentials(): Promise<boolean> {
    const { data } = await dbWrapper<{ id: string }>('SELECT id FROM Credentials LIMIT 1', [])
    return (data?.length ?? 0) > 0
}

export async function getRegistrationOptions() {
    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userName: 'tendril-user',
        userDisplayName: 'Tendril',
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
        },
    })

    await saveChallenge(options.challenge)
    return options
}

export async function verifyRegistration(response: RegistrationResponseJSON): Promise<{ success: boolean; error?: string }> {
    if (await hasCredentials()) return { success: false, error: 'A passkey already exists' }

    const { data: challengeRows } = await dbWrapper<{ challenge: string }>(
        'SELECT challenge FROM Challenges ORDER BY created_at DESC LIMIT 1',
        []
    )
    const expectedChallenge = challengeRows?.[0]?.challenge
    if (!expectedChallenge) return { success: false, error: 'No challenge found' }

    try {
        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
        })

        if (!verification.verified || !verification.registrationInfo) {
            return { success: false, error: 'Verification failed' }
        }

        await consumeChallenge(expectedChallenge)

        const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

        const { data: users } = await dbWrapper<{ id: number }>('SELECT id FROM Users LIMIT 1', [])
        let userId: number
        if (!users || users.length === 0) {
            const { data: newUsers } = await dbWrapper<{ id: number }>(
                'INSERT INTO Users DEFAULT VALUES RETURNING id',
                []
            )
            userId = newUsers![0].id
        } else {
            userId = users[0].id
        }

        await dbWrapper(
            `INSERT INTO Credentials (id, user_id, public_key, counter, device_type, backed_up, transports)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET counter = $4`,
            [
                credential.id,
                userId,
                Buffer.from(credential.publicKey),
                credential.counter,
                credentialDeviceType,
                credentialBackedUp,
                credential.transports ?? [],
            ]
        )

        const token = await createSession(userId)
        await setSessionCookie(token)

        return { success: true }
    } catch (err) {
        console.error('Registration error:', err)
        return { success: false, error: String(err) }
    }
}

export async function getAuthenticationOptions() {
    const { data: creds } = await dbWrapper<{ id: string; transports: string[] }>(
        'SELECT id, transports FROM Credentials',
        []
    )

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        userVerification: 'preferred',
        allowCredentials: (creds ?? []).map((c) => ({
            id: c.id,
            transports: (c.transports ?? []) as AuthenticatorTransport[],
        })),
    })

    await saveChallenge(options.challenge)
    return options
}

export async function verifyAuthentication(response: AuthenticationResponseJSON): Promise<{ success: boolean; error?: string }> {
    const { data: challengeRows } = await dbWrapper<{ challenge: string }>(
        'SELECT challenge FROM Challenges ORDER BY created_at DESC LIMIT 1',
        []
    )
    const expectedChallenge = challengeRows?.[0]?.challenge
    if (!expectedChallenge) return { success: false, error: 'No challenge found' }

    const { data: creds } = await dbWrapper<{
        id: string
        user_id: number
        public_key: Buffer
        counter: number
        transports: string[]
    }>('SELECT * FROM Credentials WHERE id = $1', [response.id])

    const credential = creds?.[0]
    if (!credential) return { success: false, error: 'Credential not found' }

    try {
        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            credential: {
                id: credential.id,
                publicKey: new Uint8Array(credential.public_key),
                counter: credential.counter,
                transports: (credential.transports ?? []) as AuthenticatorTransport[],
            },
        })

        if (!verification.verified) return { success: false, error: 'Verification failed' }

        await consumeChallenge(expectedChallenge)

        await dbWrapper('UPDATE Credentials SET counter = $1 WHERE id = $2', [
            verification.authenticationInfo.newCounter,
            credential.id,
        ])

        const token = await createSession(credential.user_id)
        await setSessionCookie(token)

        return { success: true }
    } catch (err) {
        console.error('Authentication error:', err)
        return { success: false, error: String(err) }
    }
}

export async function logout() {
    const jar = await cookies()
    const token = jar.get('session')?.value
    if (token) {
        await dbWrapper('DELETE FROM Sessions WHERE token = $1', [token])
        jar.delete('session')
    }
}
