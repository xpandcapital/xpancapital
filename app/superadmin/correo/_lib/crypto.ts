import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENV_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'blis-corp-email-cipher-key-32chr!'

function getKey(): Buffer {
  return crypto.scryptSync(ENV_KEY, 'blis-corp-salt', 32)
}

export function encrypt(text: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(data: string): string {
  const key = getKey()
  const buf = Buffer.from(data, 'base64')
  const iv = buf.subarray(0, 16)
  const tag = buf.subarray(16, 32)
  const encrypted = buf.subarray(32)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
