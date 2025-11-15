import zlib from 'zlib'
import { promisify } from 'util'

const gzip = promisify(zlib.gzip)

export const compressionMiddleware = (options = {}) => {
  const { threshold = 1024 } = options

  return async (req, res, next) => {
    const originalSend = res.json

    res.json = function(data) {
      const acceptEncoding = req.headers['accept-encoding'] || ''
      const jsonData = JSON.stringify(data)
      
      // Only compress if response is larger than threshold
      if (jsonData.length < threshold || !acceptEncoding.includes('gzip')) {
        return originalSend.call(this, data)
      }

      // Compress and send
      gzip(Buffer.from(jsonData))
        .then((compressed) => {
          res.setHeader('Content-Encoding', 'gzip')
          res.setHeader('Content-Type', 'application/json')
          res.send(compressed)
        })
        .catch(() => {
          // Fall back to uncompressed
          originalSend.call(res, data)
        })
    }

    next()
  }
}

