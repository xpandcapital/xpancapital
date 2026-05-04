import crypto from 'crypto'
import type {
  CryptomusInvoiceRequest,
  CryptomusInvoiceResponse,
  CryptomusWebhookPayload,
  CryptomusConfig,
} from './types'
import { CRYPTOMUS_BASE_URL } from './types'

export function generateSign(data: Record<string, unknown>, apiKey: string): string {
  const jsonBody = JSON.stringify(data)
  const base64 = Buffer.from(jsonBody).toString('base64')
  return crypto.createHash('md5').update(base64 + apiKey).digest('hex')
}

export function verifyWebhookSign(
  body: Record<string, unknown>,
  receivedSign: string,
  apiKey: string
): boolean {
  const dataForSign = JSON.parse(
    JSON.stringify(body).replace(/\//g, '\\/')
  )
  const hash = crypto
    .createHash('md5')
    .update(Buffer.from(JSON.stringify(dataForSign)).toString('base64') + apiKey)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(receivedSign))
}

export async function createInvoice(
  params: CryptomusInvoiceRequest,
  config: CryptomusConfig
): Promise<CryptomusInvoiceResponse> {
  const body: Record<string, unknown> = {
    amount: params.amount,
    currency: params.currency,
    order_id: params.order_id,
  }

  if (params.to_currency) body.to_currency = params.to_currency
  if (params.network) body.network = params.network
  if (params.url_return) body.url_return = params.url_return
  if (params.url_success) body.url_success = params.url_success
  if (params.url_callback) body.url_callback = params.url_callback
  if (params.lifetime) body.lifetime = params.lifetime
  if (params.is_payment_multiple !== undefined) body.is_payment_multiple = params.is_payment_multiple
  if (params.subtract !== undefined) body.subtract = params.subtract
  if (params.accuracy_payment_percent !== undefined) body.accuracy_payment_percent = params.accuracy_payment_percent
  if (params.additional_data) body.additional_data = params.additional_data
  if (params.currencies?.length) body.currencies = params.currencies
  if (params.except_currencies?.length) body.except_currencies = params.except_currencies
  if (params.course_source) body.course_source = params.course_source
  if (params.discount_percent !== undefined) body.discount_percent = params.discount_percent

  const sign = generateSign(body, config.apiKey)

  const response = await fetch(`${CRYPTOMUS_BASE_URL}/v1/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      merchant: config.merchantId,
      sign,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()
  return data as CryptomusInvoiceResponse
}

export async function getPaymentInfo(
  identifier: { uuid: string } | { order_id: string },
  config: CryptomusConfig
): Promise<CryptomusInvoiceResponse> {
  const body: Record<string, string> = {}
  if ('uuid' in identifier) body.uuid = identifier.uuid
  if ('order_id' in identifier) body.order_id = identifier.order_id

  const sign = generateSign(body, config.apiKey)

  const response = await fetch(`${CRYPTOMUS_BASE_URL}/v1/payment/info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      merchant: config.merchantId,
      sign,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()
  return data as CryptomusInvoiceResponse
}

export function extractSignFromWebhook(body: CryptomusWebhookPayload): {
  sign: string
  data: Record<string, unknown>
} {
  const { sign, ...data } = body
  return { sign, data }
}
