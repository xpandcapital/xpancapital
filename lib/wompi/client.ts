import type { WompiTransactionRequest, WompiTransactionResponse, WompiMerchantData } from './types'

const BASE_URL = 'https://production.wompi.co/v1'
const SANDBOX_URL = 'https://sandbox.wompi.co/v1'

function getBaseUrl(env: string): string {
  return env === 'production' ? BASE_URL : SANDBOX_URL
}

export async function createTransaction(
  data: WompiTransactionRequest,
  privateKey: string,
  environment: string = 'production'
): Promise<WompiTransactionResponse> {
  const baseUrl = getBaseUrl(environment)
  const res = await fetch(`${baseUrl}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${privateKey}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Wompi createTransaction failed: ${res.status} ${errBody}`)
  }

  return res.json()
}

export async function getTransaction(
  transactionId: string,
  privateKey: string,
  environment: string = 'production'
): Promise<WompiTransactionResponse> {
  const baseUrl = getBaseUrl(environment)
  const res = await fetch(`${baseUrl}/transactions/${transactionId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${privateKey}` },
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Wompi getTransaction failed: ${res.status} ${errBody}`)
  }

  return res.json()
}

export async function getMerchant(
  publicKey: string,
  environment: string = 'production'
): Promise<WompiMerchantData> {
  const baseUrl = getBaseUrl(environment)
  const res = await fetch(`${baseUrl}/merchants/${publicKey}`)

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Wompi getMerchant failed: ${res.status} ${errBody}`)
  }

  return res.json()
}

export async function generateSignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integrityKey: string
): Promise<string> {
  const data = `${reference}${amountInCents}${currency}${integrityKey}`
  // SHA256 hash
  const encoder = new TextEncoder()
  const bytes = encoder.encode(data)
  return crypto.subtle.digest('SHA-256', bytes).then(hash => {
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  })
}
