import type { Metadata, Viewport } from 'next'
import './globals.css'

import NavBar from '@/components/nav/nav'
import BottomNav from '@/components/nav/bottomNav'
import Footer from '@/components/nav/footer'

export const metadata: Metadata = {
    title: 'Tendril',
    description: 'Movie tracker',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Tendril',
        startupImage: '/images/logo/logo_512.png',
    },
    icons: {
        apple: '/images/logo/logo_192.png',
    },
}

export const viewport: Viewport = {
    themeColor: '#252525',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang='en' className='dark bg-background'>
            <head />
            <body className='w-screen min-h-screen m-0 p-0 font-[Inter] antialiased wrap-break-word leading-normal tracking-normal'>
                <div className='flex flex-col w-full min-h-screen'>
                    <header
                        className='fixed top-0 left-0 right-0 border-b border-border backdrop-blur-md z-50 print:hidden bg-background/80'
                        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
                    >
                        <div className='h-12'>
                            <NavBar />
                        </div>
                    </header>
                    <main
                        className='grow w-full bg-background px-4 sm:px-5 pb-28 sm:pb-8'
                        style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px) + 1.25rem)' }}
                    >
                        {children}
                    </main>
                    <footer className='border-t border-border hidden sm:block'>
                        <Footer />
                    </footer>
                    <BottomNav />
                </div>
            </body>
        </html>
    )
}
