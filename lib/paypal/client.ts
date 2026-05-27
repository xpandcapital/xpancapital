const PAYPAL_API = 'https://api-m.sandbox.paypal.com'
const PRODUCTION_API = 'https://api-m.paypal.com'

export function getPayPalApiUrl(isProduction: boolean) {
  return isProduction ? PRODUCTION_API : PAYPAL_API
}

async function getAccessToken(clientId: string, secret: string, isProduction = false) {
  const baseUrl = getPayPalApiUrl(isProduction)
  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  return data.access_token as string
}

export interface PayPalItem {
  name: string
  quantity: string
  unit_amount: { currency_code: string; value: string }
}

export interface PayPalCreateOrderRequest {
  totalUSD: number
  currency: string
  orderId: string
  items?: PayPalItem[]
  returnUrl?: string
  cancelUrl?: string
}

export async function createOrder(
  params: PayPalCreateOrderRequest,
  clientId: string,
  secret: string,
  isProduction = false
) {
  const accessToken = await getAccessToken(clientId, secret, isProduction)
  const baseUrl = getPayPalApiUrl(isProduction)

  const purchaseUnit: Record<string, unknown> = {
    amount: {
      currency_code: params.currency,
      value: params.totalUSD.toFixed(2),
    },
    reference_id: params.orderId,
  }

  if (params.items?.length) {
    purchaseUnit.items = params.items
    purchaseUnit.amount = {
      ...purchaseUnit.amount,
      breakdown: {
        item_total: {
          currency_code: params.currency,
          value: params.totalUSD.toFixed(2),
        },
      },
    }
  }

  const body: Record<string, unknown> = {
    intent: 'CAPTURE',
    purchase_units: [purchaseUnit],
  }

  if (params.returnUrl || params.cancelUrl) {
    body.payment_source = {
      paypal: {
        experience_context: {
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl || params.returnUrl,
        },
      },
    }
  }

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return { id: data.id as string, status: data.status as string, data }
}

export async function captureOrder(
  orderId: string,
  clientId: string,
  secret: string,
  isProduction = false
) {
  const accessToken = await getAccessToken(clientId, secret, isProduction)
  const baseUrl = getPayPalApiUrl(isProduction)

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()
  return { id: data.id as string, status: data.status as string, data }
}
