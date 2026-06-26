'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/ui/button'
import { addMedia, removeMedia } from '@/utils/queries'
import { useMediaState } from '@/components/watched/mediaStateContext'

type ListToolProps = {
    tmdbId: number
    mediaType: MediaType
}

export default function ListTool({ tmdbId, mediaType }: ListToolProps) {
    const ms = useMediaState()
    const listId = ms?.listId
    const [inList, setInList] = useState(() => ms?.isListed(tmdbId) ?? false)

    async function handleToggle() {
        if (!listId) return
        if (inList) {
            const { data, error } = await removeMedia(tmdbId, listId)
            if (error) { console.error(error); return }
            if (data) { setInList(false); ms?.setListed(tmdbId, false) }
        } else {
            const { data, error } = await addMedia(tmdbId, mediaType, listId)
            if (error) { console.error(error); return }
            if (data) { setInList(true); ms?.setListed(tmdbId, true) }
        }
    }

    return (
        <Button
            variant={inList ? 'default' : 'secondary'}
            size='icon'
            className='size-9 rounded-xl'
            onClick={handleToggle}
        >
            <Bookmark className={`size-5${inList ? ' fill-current' : ''}`} />
        </Button>
    )
}
