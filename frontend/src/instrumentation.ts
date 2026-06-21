export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return

    const run = (await import('@/utils/db')).default
    await run('ALTER TABLE NotificationLog ADD COLUMN IF NOT EXISTS notif_title TEXT', [])
    await run('ALTER TABLE NotificationLog ADD COLUMN IF NOT EXISTS notif_body TEXT', [])
    await run('ALTER TABLE NotificationLog ADD COLUMN IF NOT EXISTS notif_url TEXT', [])

    const { runAllChecks } = await import('@/utils/notificationChecks')

    function scheduleDaily(hour: number) {
        const now = new Date()
        const next = new Date()
        next.setHours(hour, 0, 0, 0)
        if (next <= now) next.setDate(next.getDate() + 1)

        setTimeout(async () => {
            await runAllChecks()
            scheduleDaily(hour)
        }, next.getTime() - now.getTime())

        console.log(`[notifications] next check scheduled for ${next.toISOString()}`)
    }

    scheduleDaily(9)
}
