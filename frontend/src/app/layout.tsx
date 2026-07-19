import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ViewTransition } from 'react'
import { Archivo, Instrument_Sans } from 'next/font/google'

import NavBar from '@/components/nav/nav'
import HeaderShell from '@/components/nav/headerShell'
import BottomNav from '@/components/nav/bottomNav'
import Footer from '@/components/nav/footer'
import ScrollRestorer from '@/components/nav/scrollRestorer'

const archivo = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-archivo', axes: ['wdth'] })
const instrumentSans = Instrument_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-instrument-sans' })

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
    themeColor: '#020202',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang='en' className={`dark bg-background ${archivo.variable} ${instrumentSans.variable}`}>
            <head />
            <body className='w-screen min-h-screen m-0 p-0 font-sans antialiased wrap-break-word leading-normal tracking-normal'>
                <div className='relative flex flex-col w-full min-h-screen'>
                    <HeaderShell>
                        <NavBar />
                    </HeaderShell>
                    <main className='grow w-full bg-background pb-28 sm:pb-8'>
                        <ScrollRestorer />
                        <ViewTransition>
                            {children}
                        </ViewTransition>
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
