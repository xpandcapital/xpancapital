import crypto from 'crypto'

const API_ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || process.env.EMAIL_ENCRYPTION_KEY || ''

if (!API_ENCRYPTION_KEY || API_ENCRYPTION_KEY.length < 32) {
  console.warn('[API Crypto] API_ENCRYPTION_KEY no configurada o muy corta. Las claves se guardarán sin cifrar.')
}

function getKey(): Buffer {
  // Derivar una clave de 32 bytes desde la env var usando SHA-256
  return crypto.createHash('sha256').update(API_ENCRYPTION_KEY).digest()
}

export function encryptApiKey(plaintext: string): string {
  if (!plaintext || !API_ENCRYPTION_KEY || API_ENCRYPTION_KEY.length < 32) return plaintext
  try {
    const key = getKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    // Formato: iv:authTag:encrypted
    return `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch {
    return plaintext
  }
}

export function decryptApiKey(ciphertext: string): string {
  if (!ciphertext || !ciphertext.startsWith('enc:') || !API_ENCRYPTION_KEY || API_ENCRYPTION_KEY.length < 32) {
    return ciphertext
  }
  try {
    const parts = ciphertext.split(':')
    if (parts.length !== 4) return ciphertext
    const iv = Buffer.from(parts[1], 'hex')
    const authTag = Buffer.from(parts[2], 'hex')
    const encrypted = parts[3]
    const key = getKey()
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return ciphertext
  }
}

export function maskKey(value: string | null): string {
  if (!value || value.length <= 8) return value ? '••••' : ''
  return value.slice(0, 4) + '••••' + value.slice(-4)
}
