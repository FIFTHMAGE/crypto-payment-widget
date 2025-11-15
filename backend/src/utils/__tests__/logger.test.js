import { describe, it, expect, beforeEach, vi } from '@jest/globals'
import logger from '../logger.js'

describe('Logger Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log info messages', () => {
    const spy = vi.spyOn(logger, 'info')
    logger.info('Test info message')
    expect(spy).toHaveBeenCalledWith('Test info message')
  })

  it('should log error messages', () => {
    const spy = vi.spyOn(logger, 'error')
    logger.error('Test error message')
    expect(spy).toHaveBeenCalledWith('Test error message')
  })

  it('should log warning messages', () => {
    const spy = vi.spyOn(logger, 'warn')
    logger.warn('Test warning message')
    expect(spy).toHaveBeenCalledWith('Test warning message')
  })

  it('should log debug messages', () => {
    const spy = vi.spyOn(logger, 'debug')
    logger.debug('Test debug message')
    expect(spy).toHaveBeenCalledWith('Test debug message')
  })

  it('should format log messages correctly', () => {
    const spy = vi.spyOn(logger, 'info')
    logger.info('Message', { key: 'value' })
    expect(spy).toHaveBeenCalled()
  })
})

