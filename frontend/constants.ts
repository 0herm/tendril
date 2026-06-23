import { version } from './package.json'

const config = {
    url: {
        API_URL:    'https://api.themoviedb.org/',
        IMAGE_URL:  'https://image.tmdb.org/t/p/w500',
        BACKDROP_URL: 'https://image.tmdb.org/t/p/original'
    },
    setting: {
        REGION:        process.env.REGION    || 'GB',
        LANGUAGE:      process.env.LANGUAGE  || 'en-GB',
        INCLUDE_ADULT: process.env.INCLUDE_ADULT === 'true',
        TIMEZONE:      process.env.TIMEZONE  || 'Europe/London',
    },
    database: {
        HOST: process.env.POSTGRES_HOST,
        PORT: process.env.POSTGRES_PORT,
        USER: process.env.POSTGRES_USER,
        PASSWORD: process.env.POSTGRES_PASSWORD,
        DB: process.env.POSTGRES_DB,
    },
    version
}

export default config
