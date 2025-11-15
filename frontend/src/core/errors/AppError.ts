export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Wallet errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTION_REJECTED = 'WALLET_CONNECTION_REJECTED',
  WRONG_NETWORK = 'WRONG_NETWORK',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',

  // Transaction errors
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  GAS_ESTIMATION_FAILED = 'GAS_ESTIMATION_FAILED',

  // Validation errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_INPUT = 'INVALID_INPUT',

  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  API_KEY_INVALID = 'API_KEY_INVALID',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  code: ErrorCode
  statusCode?: number
  details?: any

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode?: number,
    details?: any
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    }
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred', details?: any) {
    super(message, ErrorCode.NETWORK_ERROR, undefined, details)
    this.name = 'NetworkError'
  }
}

export class WalletError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.WALLET_NOT_CONNECTED,
    details?: any
  ) {
    super(message, code, undefined, details)
    this.name = 'WalletError'
  }
}

export class TransactionError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.TRANSACTION_FAILED,
    details?: any
  ) {
    super(message, code, undefined, details)
    this.name = 'TransactionError'
  }
}

export class ValidationError extends AppError {
  field?: string

  constructor(message: string, field?: string, details?: any) {
    super(message, ErrorCode.INVALID_INPUT, 400, details)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number, details?: any) {
    super(message, ErrorCode.API_ERROR, statusCode, details)
    this.name = 'ApiError'
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message = 'Unauthorized access',
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    statusCode = 401
  ) {
    super(message, code, statusCode)
    this.name = 'AuthorizationError'
  }
}

export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export function getErrorCode(error: unknown): ErrorCode {
  if (isAppError(error)) {
    return error.code
  }
  return ErrorCode.UNKNOWN_ERROR
}

