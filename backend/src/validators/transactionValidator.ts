/**
 * Transaction validation utilities
 */

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

export interface TransactionInput {
  txHash: string;
  from: string;
  to: string;
  amount: string | number;
  token?: string;
  chainId?: number;
  nonce?: number;
  gasLimit?: string;
  gasPrice?: string;
  data?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validate a transaction
 */
export const validateTransaction = (data: Partial<TransactionInput>): ValidationResult => {
  const errors: ValidationError[] = [];
  const { txHash, from, to, amount, chainId, nonce, gasLimit, gasPrice } = data;

  // Validate txHash
  if (!txHash) {
    errors.push({
      field: 'txHash',
      message: 'Transaction hash is required',
      code: 'REQUIRED',
    });
  } else if (!TX_HASH_REGEX.test(txHash)) {
    errors.push({
      field: 'txHash',
      message: 'Invalid transaction hash format',
      code: 'INVALID_FORMAT',
    });
  }

  // Validate from address
  if (!from) {
    errors.push({
      field: 'from',
      message: 'From address is required',
      code: 'REQUIRED',
    });
  } else if (!ADDRESS_REGEX.test(from)) {
    errors.push({
      field: 'from',
      message: 'Invalid from address format',
      code: 'INVALID_FORMAT',
    });
  }

  // Validate to address
  if (!to) {
    errors.push({
      field: 'to',
      message: 'To address is required',
      code: 'REQUIRED',
    });
  } else if (!ADDRESS_REGEX.test(to)) {
    errors.push({
      field: 'to',
      message: 'Invalid to address format',
      code: 'INVALID_FORMAT',
    });
  }

  // Validate amount
  if (!amount) {
    errors.push({
      field: 'amount',
      message: 'Amount is required',
      code: 'REQUIRED',
    });
  } else {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Amount must be a positive number',
        code: 'INVALID_VALUE',
      });
    }
  }

  // Validate chainId if provided
  if (chainId !== undefined) {
    if (typeof chainId !== 'number' || chainId <= 0 || !Number.isInteger(chainId)) {
      errors.push({
        field: 'chainId',
        message: 'Chain ID must be a positive integer',
        code: 'INVALID_VALUE',
      });
    }
  }

  // Validate nonce if provided
  if (nonce !== undefined) {
    if (typeof nonce !== 'number' || nonce < 0 || !Number.isInteger(nonce)) {
      errors.push({
        field: 'nonce',
        message: 'Nonce must be a non-negative integer',
        code: 'INVALID_VALUE',
      });
    }
  }

  // Validate gasLimit if provided
  if (gasLimit !== undefined) {
    const gas = BigInt(gasLimit);
    if (gas <= 0) {
      errors.push({
        field: 'gasLimit',
        message: 'Gas limit must be positive',
        code: 'INVALID_VALUE',
      });
    }
  }

  // Validate gasPrice if provided
  if (gasPrice !== undefined) {
    const price = BigInt(gasPrice);
    if (price <= 0) {
      errors.push({
        field: 'gasPrice',
        message: 'Gas price must be positive',
        code: 'INVALID_VALUE',
      });
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors[0].message,
      errors,
    };
  }

  return { valid: true };
};

/**
 * Validate an Ethereum address
 */
export const validateAddress = (address: string): ValidationResult => {
  if (!address) {
    return { valid: false, error: 'Address is required' };
  }

  if (!ADDRESS_REGEX.test(address)) {
    return { valid: false, error: 'Invalid address format' };
  }

  return { valid: true };
};

/**
 * Validate a transaction hash
 */
export const validateTxHash = (txHash: string): ValidationResult => {
  if (!txHash) {
    return { valid: false, error: 'Transaction hash is required' };
  }

  if (!TX_HASH_REGEX.test(txHash)) {
    return { valid: false, error: 'Invalid transaction hash format' };
  }

  return { valid: true };
};

/**
 * Validate an amount
 */
export const validateAmount = (
  amount: string | number,
  options?: { min?: number; max?: number }
): ValidationResult => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);

  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a number' };
  }

  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be positive' };
  }

  if (options?.min !== undefined && numAmount < options.min) {
    return { valid: false, error: `Amount must be at least ${options.min}` };
  }

  if (options?.max !== undefined && numAmount > options.max) {
    return { valid: false, error: `Amount must be at most ${options.max}` };
  }

  return { valid: true };
};

/**
 * Validate a payment request
 */
export const validatePaymentRequest = (data: {
  amount: string | number;
  token?: string;
  recipient: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate amount
  const amountResult = validateAmount(data.amount);
  if (!amountResult.valid) {
    errors.push({
      field: 'amount',
      message: amountResult.error || 'Invalid amount',
      code: 'INVALID_VALUE',
    });
  }

  // Validate recipient
  const recipientResult = validateAddress(data.recipient);
  if (!recipientResult.valid) {
    errors.push({
      field: 'recipient',
      message: recipientResult.error || 'Invalid recipient',
      code: 'INVALID_FORMAT',
    });
  }

  // Validate description length if provided
  if (data.description && data.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be 500 characters or less',
      code: 'TOO_LONG',
    });
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors[0].message,
      errors,
    };
  }

  return { valid: true };
};

export default {
  validateTransaction,
  validateAddress,
  validateTxHash,
  validateAmount,
  validatePaymentRequest,
};

