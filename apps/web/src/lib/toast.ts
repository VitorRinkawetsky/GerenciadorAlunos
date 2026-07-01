export type ToastType = 'success' | 'error'

export type ToastListener = (message: string, type: ToastType) => void

let _emit: ToastListener | null = null

export function toast(message: string, type: ToastType = 'success') {
  _emit?.(message, type)
}

export function setToastListener(listener: ToastListener | null) {
  _emit = listener
}
