import { isAddress } from 'viem'

export const validateEthereumAddress = (address: string): boolean => {
  return isAddress(address)
}

export const validateAmount = (
  amount: string,
  min?: string,
  max?: string
): { valid: boolean; error?: string } => {
  const numAmount = parseFloat(amount)

  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' }
  }

  if (min && numAmount < parseFloat(min)) {
    return { valid: false, error: `Amount must be at least ${min}` }
  }

  if (max && numAmount > parseFloat(max)) {
    return { valid: false, error: `Amount must not exceed ${max}` }
  }

  return { valid: true }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

export const validateLength = (
  value: string,
  min?: number,
  max?: number
): { valid: boolean; error?: string } => {
  if (min && value.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` }
  }

  if (max && value.length > max) {
    return { valid: false, error: `Must not exceed ${max} characters` }
  }

  return { valid: true }
}

export interface PaymentFormData {
  recipient: string
  amount: string
  token?: string
  description?: string
}

export const validatePaymentForm = (
  data: PaymentFormData
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  if (!validateRequired(data.recipient)) {
    errors.recipient = 'Recipient address is required'
  } else if (!validateEthereumAddress(data.recipient)) {
    errors.recipient = 'Invalid Ethereum address'
  }

  if (!validateRequired(data.amount)) {
    errors.amount = 'Amount is required'
  } else {
    const amountValidation = validateAmount(data.amount)
    if (!amountValidation.valid && amountValidation.error) {
      errors.amount = amountValidation.error
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

