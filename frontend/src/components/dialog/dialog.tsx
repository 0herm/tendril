'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/ui/button'
import { addMedia, removeMedia, checkMediaInList, getAllLists } from '@/utils/api'

type ListToolProps = {
    tmdbId: number
    mediaType: MediaType
}

export default function ListTool({ tmdbId, mediaType }: ListToolProps) {
    const [inList, setInList] = useState<boolean>(false)
    const [listId, setListId] = useState<number | undefined>(undefined)

    useEffect(() => {
        getAllLists().then(({ data }) => setListId(data?.[0]?.id))
    }, [])

    useEffect(() => {
        if (!listId) return
        checkMediaInList(tmdbId, listId).then(({ data }) => setInList(data ?? false))
    }, [tmdbId, listId])

    async function handleToggle() {
        if (!listId) return
        if (inList) {
            const { data, error } = await removeMedia(tmdbId, listId)
            if (error) { console.error(error); return }
            if (data) { setInList(false) }
        } else {
            const { data, error } = await addMedia(tmdbId, mediaType, listId)
            if (error) { console.error(error); return }
            if (data) { setInList(true) }
        }
    }

    return (
        <Button
            variant={inList ? 'default' : 'secondary'}
            size='icon'
            className='size-10'
            onClick={handleToggle}
        >
            <Bookmark className={`size-5${inList ? ' fill-current' : ''}`} />
        </Button>
    )
}
