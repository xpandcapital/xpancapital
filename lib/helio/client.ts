import crypto from 'crypto'
import type {
  HelioCreateChargeRequest,
  HelioChargeResponse,
  HelioConfig,
} from './types'
import { HELIO_BASE_URL } from './types'

export function verifyWebhookSign(
  body: string,
  signature: string,
  webhookSecret: string
): boolean {
  const hmac = crypto.createHmac('sha256', webhookSecret)
  hmac.update(body)
  const digest = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function createCharge(
  params: HelioCreateChargeRequest,
  config: HelioConfig
): Promise<HelioChargeResponse> {
  const body: Record<string, unknown> = {
    paylinkId: params.paylinkId,
  }

  if (params.price) body.price = params.price
  if (params.successRedirectUrl) body.successRedirectUrl = params.successRedirectUrl
  if (params.additionalJson) body.additionalJson = params.additionalJson
  if (params.customerDetails) body.customerDetails = params.customerDetails

  const url = `${HELIO_BASE_URL}/v1/charge/create/api-key?apiKey=${encodeURIComponent(config.publicKey)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.secretKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await response.json()

    if (!response.ok) {
      return {
        id: '',
        url: '',
        chargeToken: '',
        paylinkId: '',
        price: '0',
        status: 'error',
        ...data,
      }
    }

    return data as HelioChargeResponse
  } catch (err: any) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      return {
        id: '',
        url: '',
        chargeToken: '',
        paylinkId: '',
        price: '0',
        status: 'timeout',
      }
    }
    return {
      id: '',
      url: '',
      chargeToken: '',
      paylinkId: '',
      price: '0',
      status: err.message || 'network_error',
    }
  }
}
