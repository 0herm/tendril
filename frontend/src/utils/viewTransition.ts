const armed = new Map<string, HTMLElement>()

export function rememberOrigin(kind: 'poster' | 'backdrop', id: string) {
    sessionStorage.setItem('vt-origin', window.location.pathname + window.location.search)
    sessionStorage.setItem('vt-scroll', String(Math.round(window.scrollY)))
    sessionStorage.setItem(`vt-${kind}-id`, id)
    sessionStorage.removeItem(kind === 'poster' ? 'vt-backdrop-id' : 'vt-poster-id')
}

export function armSharedElement(name: string, el: HTMLElement) {
    const prev = armed.get(name)
    if (prev && prev !== el && prev.isConnected) prev.style.viewTransitionName = ''
    el.style.viewTransitionName = name
    armed.set(name, el)
}
