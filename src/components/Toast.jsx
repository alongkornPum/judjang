import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(onDismiss, 4500)
    return () => clearTimeout(id)
  }, [toast, onDismiss])

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center px-4 lg:bottom-6">
      {toast && (
        <div key={toast.id} className="pointer-events-auto flex animate-sheet-up items-center gap-3 rounded-2xl bg-ink py-2.5 pl-4 pr-2 text-sm text-white shadow-xl">
          <CheckCircle2 className="size-4.5 text-income" aria-hidden />
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action()
                onDismiss()
              }}
              className="hit-44 h-9 rounded-lg px-3 font-semibold text-income hover:bg-white/10"
            >
              เลิกทำ
            </button>
          )}
        </div>
      )}
    </div>
  )
}
