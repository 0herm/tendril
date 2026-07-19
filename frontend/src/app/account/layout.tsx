import { logout } from '@/utils/auth'
import { redirect } from 'next/navigation'
import AccountSidebar from '@/components/nav/accountSidebar'
import PageContainer from '@/components/pageContainer'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    async function handleLogout() {
        'use server'
        await logout()
        redirect('/passkey/login')
    }

    return (
        <PageContainer className='flex flex-col sm:flex-row gap-8'>
            <AccountSidebar logoutAction={handleLogout} />
            <div className='flex-1 min-w-0'>
                {children}
            </div>
        </PageContainer>
    )
}
