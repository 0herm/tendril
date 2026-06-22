import { logout } from '@/utils/auth'
import { redirect } from 'next/navigation'
import AccountSidebar from './sidebar'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    async function handleLogout() {
        'use server'
        await logout()
        redirect('/passkey/login')
    }

    return (
        <div className='flex flex-col h-full sm:flex-row sm:overflow-hidden w-full sm:gap-8'>
            <AccountSidebar logoutAction={handleLogout} />
            <div className='flex-1 min-w-0 overflow-y-auto pb-28 sm:pb-8 noscroll'>
                {children}
            </div>
        </div>
    )
}
