import { config } from './env.js'

export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = config.corsOrigin.split(',')
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

