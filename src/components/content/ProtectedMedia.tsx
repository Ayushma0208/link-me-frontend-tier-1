import { useEffect, useState, type ReactNode } from 'react'

interface ProtectedMediaProps {
  children: ReactNode
  userId?: string
  className?: string
}

export function ProtectedMedia({ children, userId, className }: ProtectedMediaProps) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    function handleVisibility() {
      setHidden(document.hidden)
    }
    function handleBlur() {
      setHidden(true)
    }
    function handleFocus() {
      setHidden(false)
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return (
    <div
      className={`relative select-none ${className ?? ''}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {children}
      {userId && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-20"
          aria-hidden
        >
          <div className="rotate-[-25deg] text-xs text-white">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="mx-8 whitespace-nowrap">
                {userId.slice(0, 8)} • {new Date().toISOString().slice(0, 10)}
              </span>
            ))}
          </div>
        </div>
      )}
      {hidden && (
        <div className="absolute inset-0 z-50 bg-black" aria-hidden />
      )}
    </div>
  )
}
