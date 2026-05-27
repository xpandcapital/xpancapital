import crypto from 'crypto'
import type {
  IzipayCreatePaymentRequest,
  IzipayCreatePaymentResponse,
  IzipayConfig,
} from './types'
import { MICUENTAWEB_URLS } from './types'

export async function createPayment(
  params: IzipayCreatePaymentRequest,
  config: IzipayConfig
): Promise<IzipayCreatePaymentResponse> {
  const authString = Buffer.from(`${config.shopId}:${config.secretKey}`).toString('base64')
  const apiUrl = `${MICUENTAWEB_URLS[config.environment].api}/api-payment/v4/Charge/CreatePayment`

  const body = {
    amount: params.amount,
    currency: params.currency,
    orderId: params.orderId,
    customer: params.customer,
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await response.json()

    if (!response.ok || data.status === 'ERROR') {
      console.error('[Izipay] CreatePayment error:', data)
      return {
        webService: 'Charge',
        version: '4.0',
        applicationVersion: '',
        status: 'ERROR',
        answer: { formToken: '', orderId: params.orderId },
      }
    }

    return data as IzipayCreatePaymentResponse
  } catch (err: any) {
    clearTimeout(timeout)
    console.error('[Izipay] CreatePayment exception:', err)
    return {
      webService: 'Charge',
      version: '4.0',
      applicationVersion: '',
      status: 'ERROR',
      answer: { formToken: '', orderId: params.orderId },
    }
  }
}

export function verifyKRHash(
  krAnswer: string,
  krHash: string,
  hmacKey: string
): boolean {
  try {
    const computed = crypto.createHmac('sha256', hmacKey).update(krAnswer).digest('hex')
    return computed === krHash
  } catch {
    return false
  }
}
