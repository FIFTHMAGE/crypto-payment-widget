/** CORS Configuration */
export const corsOptions = {
  origin: ['http://localhost:5173', 'https://app.example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

