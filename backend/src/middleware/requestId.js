import { generateId } from '../utils/helpers.js'

export const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || generateId()
  req.id = id
  res.setHeader('X-Request-ID', id)
  next()
}

