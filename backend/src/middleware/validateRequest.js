import { AppError } from './errorHandler.js'

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    
    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ')
      return next(new AppError(message, 400))
    }
    
    next()
  }
}

export const validateQueryParams = (allowedParams) => {
  return (req, res, next) => {
    const queryKeys = Object.keys(req.query)
    const invalidParams = queryKeys.filter((key) => !allowedParams.includes(key))
    
    if (invalidParams.length > 0) {
      return next(
        new AppError(`Invalid query parameters: ${invalidParams.join(', ')}`, 400)
      )
    }
    
    next()
  }
}

