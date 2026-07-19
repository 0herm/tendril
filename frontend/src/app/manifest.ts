import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Tendril',
        short_name: 'Tendril',
        theme_color: '#020202',
        background_color: '#020202',
        description: 'Movie tracker',
        start_url: '/',
        display: 'standalone',
        icons: [
            {
                src: 'images/logo/logo_192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: 'images/logo/logo_192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: 'images/logo/logo_512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: 'images/logo/logo_512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
