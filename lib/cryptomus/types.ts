export type CryptomusPaymentMode = 'card' | 'crypto'

export interface CryptomusInvoiceRequest {
  amount: string
  currency: string
  order_id: string
  to_currency?: string
  network?: string
  url_return?: string
  url_success?: string
  url_callback?: string
  lifetime?: number
  is_payment_multiple?: boolean
  subtract?: number
  accuracy_payment_percent?: number
  additional_data?: string
  currencies?: Array<{ currency: string; network?: string }>
  except_currencies?: Array<{ currency: string; network?: string }>
  course_source?: 'Binance' | 'BinanceP2P' | 'Exmo' | 'Kucoin'
  from_referral_code?: string
  discount_percent?: number
}

export interface CryptomusInvoiceResponse {
  state: number
  result?: {
    uuid: string
    order_id: string
    amount: string
    payment_amount: string | null
    payer_amount: string | null
    discount_percent: number | null
    discount: string
    payer_currency: string | null
    currency: string
    merchant_amount: string | null
    network: string | null
    address: string | null
    from: string | null
    txid: string | null
    payment_status: CryptomusPaymentStatus
    url: string
    expired_at: number
    status: string
    is_final: boolean
    additional_data: string | null
    created_at: string
    updated_at: string
  }
  errors?: Record<string, string[]>
  message?: string
}

export interface CryptomusWebhookPayload {
  type: 'payment' | 'wallet'
  uuid: string
  order_id: string
  amount: string
  payment_amount: string
  payment_amount_usd: string
  merchant_amount: string
  commission: string
  is_final: boolean
  status: CryptomusPaymentStatus
  from: string
  wallet_address_uuid: string | null
  network: string
  currency: string
  payer_currency: string
  payer_amount: string
  payer_amount_exchange_rate: string
  transfer_id?: string
  additional_data: string | null
  convert?: {
    to_currency: string
    commission: string | null
    rate: string
    amount: string
  }
  txid?: string
  sign: string
}

export type CryptomusPaymentStatus =
  | 'check'
  | 'confirm_check'
  | 'paid'
  | 'paid_over'
  | 'wrong_amount'
  | 'wrong_amount_waiting'
  | 'process'
  | 'fail'
  | 'cancel'
  | 'system_fail'
  | 'refund_process'
  | 'refund_fail'
  | 'refund_paid'
  | 'locked'

export interface CryptomusConfig {
  merchantId: string
  apiKey: string
}

export const CRYPTOMUS_BASE_URL = 'https://api.cryptomus.com'

export const CRYPTOMUS_SUCCESS_STATUSES: CryptomusPaymentStatus[] = ['paid', 'paid_over']
export const CRYPTOMUS_FAILURE_STATUSES: CryptomusPaymentStatus[] = ['fail', 'cancel', 'system_fail']
