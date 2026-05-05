export type HelioPaymentMode = 'card' | 'crypto'

export interface HelioCreateChargeRequest {
  paylinkId: string
  price?: string
  successRedirectUrl?: string
  additionalJson?: Record<string, unknown>
  customerDetails?: {
    email?: string
    fullName?: string
    country?: string
    deliveryAddress?: string
    phoneNumber?: string
  }
}

export interface HelioChargeResponse {
  id: string
  url: string
  chargeToken: string
  paylinkId: string
  price: string
  status?: string
}

export interface HelioWebhookPayload {
  transaction: string
  event: 'CREATED' | 'STARTED' | 'RENEWED' | 'ENDED'
  transactionObject: {
    id: string
    paylinkId: string
    fee: string
    quantity: number
    createdAt: string
    paymentType: 'PAYLINK' | 'PAYSTREAM'
    meta: {
      id: string
      amount: string
      senderPK: string
      recipientPK: string
      customerDetails: {
        country?: string
        deliveryAddress?: string
        email?: string
        fullName?: string
        phoneNumber?: string
        additionalJSON?: string
      } | null
      transactionSignature: string
      transactionStatus: 'SUCCESS' | 'FAILED' | 'PENDING'
      totalAmount: string
    }
  }
}

export interface HelioConfig {
  publicKey: string
  secretKey: string
  paylinkId: string
  webhookSecret: string
}

export const HELIO_BASE_URL = 'https://api.hel.io'
export const HELIO_DEV_URL = 'https://api.dev.hel.io'
