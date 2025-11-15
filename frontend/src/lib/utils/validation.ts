import { isAddress } from 'viem'
import type { ValidationResult, FormFieldError } from '../types'
import {
  ADDRESS_REGEX,
  MIN_PAYMENT_AMOUNT,
  MAX_PAYMENT_AMOUNT,
  VALIDATION_MESSAGES,
} from '../constants'

export function validateAddress(address: string): FormFieldError | null {
  if (!address) {
    return {
      field: 'address',
      message: VALIDATION_MESSAGES.REQUIRED_FIELD,
    }
  }

  if (!ADDRESS_REGEX.test(address) || !isAddress(address)) {
    return {
      field: 'address',
      message: VALIDATION_MESSAGES.INVALID_ADDRESS,
    }
  }

  return null
}

export function validateAmount(amount: string): FormFieldError | null {
  if (!amount) {
    return {
      field: 'amount',
      message: VALIDATION_MESSAGES.REQUIRED_FIELD,
    }
  }

  const numAmount = parseFloat(amount)

  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      field: 'amount',
      message: VALIDATION_MESSAGES.INVALID_AMOUNT,
    }
  }

  if (numAmount < parseFloat(MIN_PAYMENT_AMOUNT)) {
    return {
      field: 'amount',
      message: VALIDATION_MESSAGES.AMOUNT_TOO_LOW,
    }
  }

  if (numAmount > parseFloat(MAX_PAYMENT_AMOUNT)) {
    return {
      field: 'amount',
      message: VALIDATION_MESSAGES.AMOUNT_TOO_HIGH,
    }
  }

  return null
}

export function validatePayment(
  amount: string,
  recipient: string
): ValidationResult {
  const errors: FormFieldError[] = []

  const amountError = validateAmount(amount)
  if (amountError) errors.push(amountError)

  const addressError = validateAddress(recipient)
  if (addressError) errors.push(addressError)

  return {
    isValid: errors.length === 0,
    errors,
  }
}

