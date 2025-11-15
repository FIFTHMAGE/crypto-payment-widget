import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUIStore } from '../uiStore'

describe('UI Store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useUIStore.setState({
      toasts: [],
      modals: {},
      theme: 'light',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should add toast notification', () => {
    const store = useUIStore.getState()
    
    store.addToast('Test message', 'success')

    expect(useUIStore.getState().toasts).toHaveLength(1)
    expect(useUIStore.getState().toasts[0].message).toBe('Test message')
    expect(useUIStore.getState().toasts[0].type).toBe('success')
  })

  it('should remove toast notification', () => {
    const store = useUIStore.getState()
    
    store.addToast('Test message', 'success')
    const toastId = useUIStore.getState().toasts[0].id

    store.removeToast(toastId)

    expect(useUIStore.getState().toasts).toHaveLength(0)
  })

  it('should auto-remove toast after duration', () => {
    const store = useUIStore.getState()
    
    store.addToast('Test message', 'success')

    expect(useUIStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(5000)

    expect(useUIStore.getState().toasts).toHaveLength(0)
  })

  it('should open modal', () => {
    const store = useUIStore.getState()
    
    store.openModal('confirmPayment')

    expect(useUIStore.getState().modals.confirmPayment).toBe(true)
  })

  it('should close modal', () => {
    const store = useUIStore.getState()
    
    store.openModal('confirmPayment')
    store.closeModal('confirmPayment')

    expect(useUIStore.getState().modals.confirmPayment).toBe(false)
  })

  it('should toggle theme', () => {
    const store = useUIStore.getState()
    
    expect(useUIStore.getState().theme).toBe('light')

    store.toggleTheme()

    expect(useUIStore.getState().theme).toBe('dark')

    store.toggleTheme()

    expect(useUIStore.getState().theme).toBe('light')
  })
})
