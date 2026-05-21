import { getUserSettings, updateUser } from '@/utils/api'
import { getCountries, getLanguages, getTimezones } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import Form from 'next/form'
import { Button } from '@/ui/button'
import { Select } from '@/ui/select'

export default async function SettingsPage() {
    const userId = await getSessionUserId()
    if (!userId) redirect('/passkey/login')
    const [{ data: settings }, { data: countriesData }, { data: languagesData }, { data: timezonesData }] =
        await Promise.all([getUserSettings(userId), getCountries(), getLanguages(), getTimezones()])

    const countries = (countriesData ?? []).sort((a, b) => a.native_name.localeCompare(b.native_name))
    const languages = (languagesData ?? []).sort((a, b) => a.english_name.localeCompare(b.english_name))
    const timezones = [...new Set((timezonesData ?? []).flatMap((timezone) => timezone.zones))].sort()

    async function updateSettings(formData: FormData) {
        'use server'
        const uid = await getSessionUserId()
        if (!uid) redirect('/passkey/login')
        await updateUser(uid, {
            region: formData.get('region') as string,
            language: formData.get('language') as string,
            original_title: formData.get('original_title') === 'on',
            include_adult: formData.get('include_adult') === 'on',
            timezone: formData.get('timezone') as string,
        })
        redirect('/account/settings')
    }

    if (!settings) {
        return <div className='text-sm text-muted-foreground p-4'>No user found.</div>
    }

    return (
        <div className='w-full flex flex-col gap-4 max-w-xl'>
            <div className='flex flex-col gap-0.5'>
                <h1 className='text-lg font-semibold'>Settings</h1>
                <p className='text-xs text-muted-foreground'>Content preferences and display options.</p>
            </div>
            <Form action={updateSettings} className='w-full flex flex-col gap-3'>
                <div className='rounded-xl border border-border overflow-hidden bg-card'>
                    <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3 pb-1'>
                        Content
                    </p>
                    <SettingRow label='Language'>
                        <Select
                            name='language'
                            defaultValue={settings.language || ''}
                            className='max-w-40 text-right'
                        >
                            {languages.map((language) => (
                                <option key={language.iso_639_1} value={language.iso_639_1}>
                                    {language.english_name}
                                </option>
                            ))}
                        </Select>
                    </SettingRow>
                    <SettingRow label='Region'>
                        <Select
                            name='region'
                            defaultValue={settings.region || ''}
                            className='max-w-40 text-right'
                        >
                            {countries.map((country) => (
                                <option key={country.iso_3166_1} value={country.iso_3166_1}>
                                    {country.native_name}
                                </option>
                            ))}
                        </Select>
                    </SettingRow>
                    <SettingRow label='Timezone' last>
                        <Select
                            name='timezone'
                            defaultValue={settings.timezone || ''}
                            className='max-w-40 text-right'
                        >
                            {timezones.map((timezone) => (
                                <option key={timezone} value={timezone}>{timezone}</option>
                            ))}
                        </Select>
                    </SettingRow>
                </div>

                <div className='rounded-xl border border-border overflow-hidden bg-card'>
                    <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3 pb-1'>
                        Preferences
                    </p>
                    <SettingRow label='Show Original Title'>
                        <input
                            id='original_title'
                            type='checkbox'
                            name='original_title'
                            defaultChecked={!!settings.original_title}
                            className='h-4 w-4 accent-brand rounded'
                        />
                    </SettingRow>
                    <SettingRow label='Include Adult Content' last>
                        <input
                            id='include_adult'
                            type='checkbox'
                            name='include_adult'
                            defaultChecked={!!settings.include_adult}
                            className='h-4 w-4 accent-brand rounded'
                        />
                    </SettingRow>
                </div>

                <Button type='submit' className='w-full'>
                    Save Changes
                </Button>
            </Form>
        </div>
    )
}

function SettingRow({ label, children, last = false }: {
    label: string
    children: React.ReactNode
    last?: boolean
}) {
    return (
        <div className={`flex items-center justify-between px-4 min-h-12 ${!last ? 'border-b border-border' : ''}`}>
            <span className='text-sm font-medium'>{label}</span>
            {children}
        </div>
    )
}
