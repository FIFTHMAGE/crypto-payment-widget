const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/

export const validateTransaction = (data) => {
  const { txHash, from, to, amount } = data

  if (!txHash) {
    return { valid: false, error: 'Transaction hash is required' }
  }

  if (!TX_HASH_REGEX.test(txHash)) {
    return { valid: false, error: 'Invalid transaction hash format' }
  }

  if (!from) {
    return { valid: false, error: 'From address is required' }
  }

  if (!ADDRESS_REGEX.test(from)) {
    return { valid: false, error: 'Invalid from address format' }
  }

  if (!to) {
    return { valid: false, error: 'To address is required' }
  }

  if (!ADDRESS_REGEX.test(to)) {
    return { valid: false, error: 'Invalid to address format' }
  }

  if (!amount) {
    return { valid: false, error: 'Amount is required' }
  }

  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' }
  }

  return { valid: true }
}

