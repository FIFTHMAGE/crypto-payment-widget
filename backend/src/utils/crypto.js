import crypto from 'crypto'

export const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex')
}

export const hashPassword = (password) => {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex')
}

export const verifySignature = (message, signature, publicKey) => {
  try {
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(message)
    return verify.verify(publicKey, signature, 'hex')
  } catch (error) {
    return false
  }
}

export const generateNonce = () => {
  return crypto.randomBytes(16).toString('hex')
}

export const createHmac = (data, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('hex')
}

export const verifyHmac = (data, signature, secret) => {
  const expected = createHmac(data, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

