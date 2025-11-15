import { AppError } from './errorHandler.js'

export const timeoutMiddleware = (duration = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      next(new AppError('Request timeout', 408))
    }, duration)

    res.on('finish', () => {
      clearTimeout(timeout)
    })

    res.on('close', () => {
      clearTimeout(timeout)
    })

    next()
  }
}

