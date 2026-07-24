export type WompiTransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'

export type WompiPaymentMethodType = 'CARD' | 'PSE' | 'NEQUI' | 'BANCOLOMBIA_TRANSFER' | 'BANCOLOMBIA_COLLECT' | 'WOMPI_BUTTON'

export interface WompiTransactionRequest {
  acceptance_token: string
  amount_in_cents: number
  currency: string
  signature: string
  customer_email: string
  reference: string
  redirect_url?: string
  customer_data?: {
    full_name?: string
    phone_number?: string
    legal_id?: string
    legal_id_type?: string
  }
}

export interface WompiTransactionResponse {
  data: {
    id: string
    created_at: string
    amount_in_cents: number
    status: WompiTransactionStatus
    reference: string
    customer_email: string
    currency: string
    payment_method_type: WompiPaymentMethodType
    payment_method: Record<string, unknown>
    shipping_address: Record<string, unknown> | null
    redirect_url: string | null
    payment_link_id: string | null
  }
}

export interface WompiMerchantData {
  data: {
    id: number
    name: string
    email: string
    contact_name: string
    phone_number: string
    active: boolean
    logo_url: string | null
    public_key: string
    accepted_payment_methods: string[]
    accepted_currencies: string[]
    presigned_acceptance: {
      acceptance_token: string
      permalink: string
      type: string
    }
  }
}

export interface WompiWebhookEvent {
  event: string
  data: {
    transaction: {
      id: string
      reference: string
      status: WompiTransactionStatus
      amount_in_cents: number
      currency: string
    }
  }
  sent_at: string
  timestamp: number
  signature: {
    checksum: string
    properties: string[]
  }
}
