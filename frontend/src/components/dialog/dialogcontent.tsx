'use client'

import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { useEffect, useRef, useState } from 'react'
import { addMedia, removeMedia } from '@/utils/clientApi'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

type ContentDialogProps = {
    tmdbId: number
    mediaType: MediaType
    lists: ListProps[]
    mediaInLists: {
        id: number
        name: string
    }[]
}

export default function ContentDialog({ tmdbId, mediaType, lists = [], mediaInLists }: ContentDialogProps) {
    const [currentLists, setCurrentLists] = useState(mediaInLists)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedList, setSelectedList] = useState<{ id: number; name: string } | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const filtered = lists.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        if (dropdownOpen) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [dropdownOpen])

    async function handleAddToList(listId: number) {
        const { data, error } = await addMedia(tmdbId, mediaType, listId)
        if (error) { console.error(error); return }
        if (data) {
            setCurrentLists([...currentLists, { id: listId, name: lists.find((l) => l.id === listId)?.name || '' }])
        }
    }

    async function handleRemoveFromList(listId: number) {
        const { data, error } = await removeMedia(tmdbId, listId)
        if (error) { console.error(error); return }
        if (data) {
            setCurrentLists(currentLists.filter((l) => l.id !== listId))
        }
    }

    return (
        <DialogContent className='sm:max-w-md'>
            <DialogHeader>
                <DialogTitle>Manage Lists</DialogTitle>
                <DialogDescription>Add or remove this title from your lists.</DialogDescription>
            </DialogHeader>

            <div className='px-5 py-4 flex flex-col gap-4'>
                <div className='flex gap-2 items-start'>
                    <div ref={dropdownRef} className='relative flex-1'>
                        <button
                            type='button'
                            onClick={() => setDropdownOpen((v) => !v)}
                            className={
                                'flex w-full items-center justify-between gap-2 ' +
                                'h-9 rounded-lg border border-border bg-muted/30 ' +
                                'px-3 text-sm text-foreground transition-colors ' +
                                'hover:bg-muted focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/10 outline-none'
                            }
                        >
                            <span className={`truncate ${selectedList ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                {selectedList?.name ?? 'Select list…'}
                            </span>
                            <ChevronsUpDown className='size-3.5 shrink-0 text-muted-foreground' />
                        </button>

                        {dropdownOpen && (
                            <div className='absolute top-full mt-1.5 z-[100] w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden'>
                                <div className='flex items-center gap-2 border-b border-border px-3 py-2.5'>
                                    <Search className='size-3.5 shrink-0 text-muted-foreground' />
                                    <input
                                        autoFocus
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder='Search lists…'
                                        className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground'
                                    />
                                </div>
                                <div className='max-h-48 overflow-y-auto p-1'>
                                    {filtered.length === 0 ? (
                                        <p className='py-4 text-center text-xs text-muted-foreground'>No lists found.</p>
                                    ) : (
                                        filtered.map((list) => (
                                            <button
                                                key={list.id}
                                                type='button'
                                                onClick={() => {
                                                    setSelectedList(list)
                                                    setDropdownOpen(false)
                                                    setSearch('')
                                                }}
                                                className='flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors'
                                            >
                                                <span className='capitalize'>{list.name}</span>
                                                {selectedList?.id === list.id && (
                                                    <Check className='size-3.5 text-brand' />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedList && (
                        currentLists.find((l) => l.id === selectedList.id) ? (
                            <Button size='sm' variant='destructive' onClick={() => handleRemoveFromList(selectedList.id)}>
                                Remove
                            </Button>
                        ) : (
                            <Button size='sm' onClick={() => handleAddToList(selectedList.id)}>
                                Add
                            </Button>
                        )
                    )}
                </div>

                {currentLists.length > 0 && (
                    <div className='flex flex-col gap-1.5'>
                        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>In lists</p>
                        <div className='rounded-xl border border-border overflow-hidden bg-card/50'>
                            {currentLists.map((list, idx) => (
                                <div
                                    key={list.id}
                                    className={`flex items-center justify-between px-3 py-2.5 ${idx < currentLists.length - 1 ? 'border-b border-border' : ''}`}
                                >
                                    <span className='text-sm capitalize'>{list.name}</span>
                                    <Button size='sm' variant='destructive' onClick={() => handleRemoveFromList(list.id)}>
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
    )
}
