'use server'

import { updateUser } from '@/utils/api'
import { getSessionUserId } from '@/utils/auth'

export async function subscribeUser(sub: PushSubscription) {
    const userId = await getSessionUserId()
    if (!userId) return { success: false, error: 'Not authenticated' }
    const { data, error } = await updateUser(userId, { subscription: JSON.stringify(sub) })
    if (error) return { success: false, error }
    return data ? { success: true } : { success: false, error: 'Failed to save subscription' }
}

export async function unsubscribeUser() {
    const userId = await getSessionUserId()
    if (!userId) return { success: false, error: 'Not authenticated' }
    const { data, error } = await updateUser(userId, { subscription: null })
    if (error) return { success: false, error }
    return data ? { success: true } : { success: false, error: 'Failed to remove subscription' }
}
