export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export const isValidTxHash = (txHash) => {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash)
}

export const isValidAmount = (amount) => {
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
}

export const validatePagination = (limit, offset) => {
  const parsedLimit = parseInt(limit) || 50
  const parsedOffset = parseInt(offset) || 0
  
  return {
    limit: Math.min(Math.max(parsedLimit, 1), 100), // Between 1 and 100
    offset: Math.max(parsedOffset, 0), // At least 0
  }
}

