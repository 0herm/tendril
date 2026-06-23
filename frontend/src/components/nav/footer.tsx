import { Clapperboard } from 'lucide-react'
import config from '@config'

export default function Footer() {
    return (
        <div className='flex items-center justify-between w-full px-5 py-3.5 text-xs text-muted-foreground/60'>
            <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-5 h-5 rounded-md bg-brand/15'>
                    <Clapperboard className='h-3 w-3 text-brand' />
                </div>
                <span className='font-semibold text-foreground/70'>Tendril</span>
                <span>© {new Date().getFullYear()}</span>
            </div>
            <span className='font-medium text-brand/70'>v{config.version}</span>
        </div>
    )
}
