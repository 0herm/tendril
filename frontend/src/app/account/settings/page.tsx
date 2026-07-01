import { getUserSettings, updateUser } from '@/utils/queries'
import { getCountries, getLanguages, getTimezones } from '@/utils/tmdbApi'
import { getSessionUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
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
        revalidateTag('app-settings')
        redirect('/account/settings')
    }

    if (!settings) {
        return <div className='text-sm text-muted-foreground p-4'>No user found.</div>
    }

    return (
        <div className='w-full flex flex-col gap-8 max-w-xl'>
            <div className='flex flex-col gap-1'>
                <h1 className='text-2xl font-black tracking-tight'>Settings</h1>
                <p className='text-xs text-muted-foreground/70'>Content preferences and display options.</p>
            </div>
            <Form action={updateSettings} className='w-full flex flex-col gap-3'>
                <div className='rounded-2xl border border-border/60 overflow-hidden bg-card'>
                    <p className='text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em] px-4 pt-4 pb-1'>
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

                <div className='rounded-2xl border border-border/60 overflow-hidden bg-card'>
                    <p className='text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em] px-4 pt-4 pb-1'>
                        Preferences
                    </p>
                    <ToggleRow
                        label='Show Original Title'
                        name='original_title'
                        defaultChecked={!!settings.original_title}
                    />
                    <ToggleRow
                        label='Include Adult Content'
                        name='include_adult'
                        defaultChecked={!!settings.include_adult}
                        last
                    />
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
        <div className={`flex items-center justify-between px-4 min-h-[3.25rem] ${!last ? 'border-b border-border/60' : ''}`}>
            <span className='text-sm text-foreground/80'>{label}</span>
            {children}
        </div>
    )
}

function ToggleRow({ label, name, defaultChecked, last = false }: {
    label: string
    name: string
    defaultChecked?: boolean
    last?: boolean
}) {
    return (
        <label className={`flex items-center justify-between px-4 min-h-[3.25rem] cursor-pointer select-none ${!last ? 'border-b border-border/60' : ''}`}>
            <span className='text-sm text-foreground/80'>{label}</span>
            <span className='relative inline-flex h-5 w-9 shrink-0 items-center'>
                <input
                    type='checkbox'
                    name={name}
                    defaultChecked={defaultChecked}
                    className='peer sr-only'
                />
                <span className={
                    'block h-5 w-9 rounded-full border border-border/60 bg-muted/80 ' +
                    'transition-colors duration-200 peer-checked:border-brand peer-checked:bg-brand'
                } />
                <span className={
                    'pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full ' +
                    'bg-muted-foreground/30 shadow-sm transition-transform duration-200 peer-checked:translate-x-4 peer-checked:bg-white'
                } />
            </span>
        </label>
    )
}
