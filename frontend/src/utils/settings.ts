import { unstable_cache } from 'next/cache'
import pool from './db'

type AppSettings = { region: string; language: string; timezone: string; include_adult: boolean }

const DEFAULTS: AppSettings = { region: 'GB', language: 'en-GB', timezone: 'Europe/London', include_adult: false }

export const getAppSettings = unstable_cache(
    async (): Promise<AppSettings> => {
        try {
            const result = await pool.query('SELECT region, language, timezone, include_adult FROM Users LIMIT 1')
            return result.rows[0] ?? DEFAULTS
        } catch {
            return DEFAULTS
        }
    },
    ['app-settings'],
    { revalidate: false, tags: ['app-settings'] }
)
