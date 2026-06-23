import crypto from 'crypto'

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghjkmnpqrstuvwxyz'
const DIGITS = '23456789'
const CHARSET = UPPER + LOWER + DIGITS

export function generateSecurePassword(length = 16): string {
  const chars: string[] = []

  chars.push(UPPER[crypto.randomInt(0, UPPER.length)])
  chars.push(LOWER[crypto.randomInt(0, LOWER.length)])
  chars.push(DIGITS[crypto.randomInt(0, DIGITS.length)])

  for (let i = chars.length; i < length; i++) {
    chars.push(CHARSET[crypto.randomInt(0, CHARSET.length)])
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}
