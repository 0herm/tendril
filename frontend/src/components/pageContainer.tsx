export default function PageContainer({ children, className = '', padTop = true }: {
    children: React.ReactNode
    className?: string
    padTop?: boolean
}) {
    return (
        <div
            className={`w-full px-5 sm:px-6 ${className}`}
            style={padTop ? { paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px) + 1.25rem)' } : undefined}
        >
            {children}
        </div>
    )
}
