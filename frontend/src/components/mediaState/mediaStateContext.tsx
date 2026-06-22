'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type MediaStateValue = {
    listId: number | undefined
    isWatched: (id: number) => boolean
    isListed: (id: number) => boolean
    setWatched: (id: number, on: boolean) => void
    setListed: (id: number, on: boolean) => void
}

const MediaStateContext = createContext<MediaStateValue | null>(null)

export function useMediaState() {
    return useContext(MediaStateContext)
}

export function MediaStateProvider({
    listId,
    watchedIds,
    listedIds,
    children,
}: {
    listId: number | undefined
    watchedIds: number[]
    listedIds: number[]
    children: ReactNode
}) {
    const [watchedSet, setWatchedSet] = useState(() => new Set(watchedIds))
    const [listedSet, setListedSet] = useState(() => new Set(listedIds))

    function setWatched(id: number, on: boolean) {
        setWatchedSet(prev => { const s = new Set(prev); on ? s.add(id) : s.delete(id); return s })
    }

    function setListed(id: number, on: boolean) {
        setListedSet(prev => { const s = new Set(prev); on ? s.add(id) : s.delete(id); return s })
    }

    return (
        <MediaStateContext.Provider value={{
            listId,
            isWatched: (id) => watchedSet.has(id),
            isListed: (id) => listedSet.has(id),
            setWatched,
            setListed,
        }}>
            {children}
        </MediaStateContext.Provider>
    )
}
