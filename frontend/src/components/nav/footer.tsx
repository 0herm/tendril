import { Clapperboard } from 'lucide-react'
import config from '@config'

export default function Footer() {
    return (
        <div className='flex items-center justify-between w-full px-5 sm:px-6 py-4 text-xs text-muted-foreground/50'>
            <div className='flex items-center gap-2'>
                <Clapperboard className='h-3.5 w-3.5 text-muted-foreground/40' />
                <span className='display font-semibold text-foreground/60'>Tendril</span>
                <span>© {new Date().getFullYear()}</span>
            </div>
            <span className='tabular-nums'>v{config.version}</span>
        </div>
    )
}
