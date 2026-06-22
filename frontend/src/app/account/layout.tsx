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
        <div className='flex flex-col sm:flex-row w-full gap-6'>
            <AccountSidebar logoutAction={handleLogout} />
            <div className='flex-1 min-w-0'>
                {children}
            </div>
        </div>
    )
}
