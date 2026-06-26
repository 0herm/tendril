'use client'

import * as React from 'react'
import { X } from 'lucide-react'

type CtxType = { setOpen: (v: boolean) => void; ref: React.RefObject<HTMLDialogElement | null> }
const Ctx = React.createContext<CtxType>({ setOpen: () => {}, ref: { current: null } })

function Dialog({ open: ctrl, onOpenChange, defaultOpen = false, children }: {
    open?: boolean
    onOpenChange?: (v: boolean) => void
    defaultOpen?: boolean
    children: React.ReactNode
}) {
    const controlled = ctrl !== undefined
    const [local, setLocal] = React.useState(defaultOpen)
    const isOpen = controlled ? ctrl! : local
    const ref = React.useRef<HTMLDialogElement>(null)
    const handleRef = React.useRef<(v: boolean) => void>(null!)
    handleRef.current = (v: boolean) => {
        if (!controlled) setLocal(v)
        onOpenChange?.(v)
    }

    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        if (isOpen && !el.open) {
            el.showModal()
            document.body.style.overflow = 'hidden'
        } else if (!isOpen && el.open) {
            el.close()
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        const handler = () => handleRef.current(false)
        el.addEventListener('close', handler)
        return () => el.removeEventListener('close', handler)
    }, [])

    const setOpen = (v: boolean) => handleRef.current(v)
    return <Ctx.Provider value={{ setOpen, ref }}>{children}</Ctx.Provider>
}

function DialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const { setOpen } = React.useContext(Ctx)
    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
        return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => { child.props.onClick?.(e); setOpen(true) },
        })
    }
    return <button onClick={() => setOpen(true)}>{children}</button>
}

function DialogContent({ className = '', children, showCloseButton = true }: {
    className?: string
    children: React.ReactNode
    showCloseButton?: boolean
}) {
    const { setOpen, ref } = React.useContext(Ctx)
    return (
        <dialog
            ref={ref}
            className={
                'relative m-auto w-full max-w-[calc(100%-2rem)] sm:max-w-lg ' +
                'bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden p-0 ' +
                className
            }
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
            {children}
            {showCloseButton && (
                <button
                    onClick={() => setOpen(false)}
                    className={
                        'absolute top-4 right-4 flex items-center justify-center w-7 h-7' +
                        ' rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-white/8 transition-colors'
                    }
                    aria-label='Close'
                >
                    <X className='size-3.5' />
                </button>
            )}
        </dialog>
    )
}

function DialogHeader({ className = '', ...props }: React.ComponentProps<'div'>) {
    return <div className={`flex flex-col gap-1 px-5 pt-5 pb-4 border-b border-border/60 ${className}`} {...props} />
}

function DialogTitle({ className = '', ...props }: React.ComponentProps<'h2'>) {
    return <h2 className={`text-base font-semibold leading-none text-foreground ${className}`} {...props} />
}

function DialogDescription({ className = '', ...props }: React.ComponentProps<'p'>) {
    return <p className={`text-xs text-muted-foreground mt-0.5 ${className}`} {...props} />
}

export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger }
