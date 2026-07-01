export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return

    const { runAllChecks } = await import('@/utils/notifications')

    Bun.cron('0 */6 * * *', runAllChecks)
}
