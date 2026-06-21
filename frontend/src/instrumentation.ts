export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return

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
