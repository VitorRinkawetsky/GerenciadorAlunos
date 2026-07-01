import { useState, useCallback, useEffect } from 'react'
import { setToastListener, type ToastType } from '../lib/toast'

interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

let _seq = 0

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const remove = useCallback((id: number) =>
    setToasts(prev => prev.filter(t => t.id !== id)), [])

  useEffect(() => {
    setToastListener((message, type) => {
      const id = ++_seq
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => remove(id), 3500)
    })
    return () => setToastListener(null)
  }, [remove])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          <span>{t.message}</span>
          <button className="toast-close" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}
