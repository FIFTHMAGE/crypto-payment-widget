import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../uiStore'

describe('UI Store', () => {
  beforeEach(() => {
    useUIStore.getState().clearToasts()
  })

  it('should add toast', () => {
    useUIStore.getState().addToast('Test message', 'success')
    
    const state = useUIStore.getState()
    expect(state.toasts).toHaveLength(1)
    expect(state.toasts[0].message).toBe('Test message')
    expect(state.toasts[0].type).toBe('success')
  })

  it('should remove toast', () => {
    useUIStore.getState().addToast('Test', 'info')
    const toastId = useUIStore.getState().toasts[0].id
    
    useUIStore.getState().removeToast(toastId)
    expect(useUIStore.getState().toasts).toHaveLength(0)
  })

  it('should clear all toasts', () => {
    useUIStore.getState().addToast('Test 1', 'info')
    useUIStore.getState().addToast('Test 2', 'success')
    
    useUIStore.getState().clearToasts()
    expect(useUIStore.getState().toasts).toHaveLength(0)
  })

  it('should generate unique IDs', () => {
    useUIStore.getState().addToast('Test 1', 'info')
    useUIStore.getState().addToast('Test 2', 'info')
    
    const state = useUIStore.getState()
    expect(state.toasts[0].id).not.toBe(state.toasts[1].id)
  })
})

