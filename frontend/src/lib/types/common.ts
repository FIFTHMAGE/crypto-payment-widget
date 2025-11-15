export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
  page?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface FormFieldError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: FormFieldError[]
}

