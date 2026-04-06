import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, smtp_host, smtp_port, smtp_user, smtp_pass, api_key } = body

    if (provider === 'smtp') {
      const nodemailer = await import('nodemailer')
      
      const transporter = nodemailer.default.createTransport({
        host: smtp_host,
        port: parseInt(smtp_port) || 465,
        secure: parseInt(smtp_port) === 465,
        auth: {
          user: smtp_user,
          pass: smtp_pass
        },
        connectionTimeout: 10000,
        socketTimeout: 10000
      })

      await transporter.verify()
      return NextResponse.json({ success: true, message: 'Conexión SMTP exitosa' })
    }

    if (provider === 'resend') {
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${api_key}`
        }
      })
      
      if (response.ok) {
        return NextResponse.json({ success: true, message: 'API Key de Resend válida' })
      } else {
        const error = await response.json()
        return NextResponse.json({ 
          success: false, 
          message: error.message || 'API Key inválida' 
        }, { status: 400 })
      }
    }

    if (provider === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/user/account', {
        headers: {
          'Authorization': `Bearer ${api_key}`
        }
      })
      
      if (response.ok) {
        return NextResponse.json({ success: true, message: 'API Key de SendGrid válida' })
      } else {
        const error = await response.json()
        return NextResponse.json({ 
          success: false, 
          message: error.errors?.[0]?.message || 'API Key inválida' 
        }, { status: 400 })
      }
    }

    return NextResponse.json({ success: false, message: 'Proveedor no soportado' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Error testing sender:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    if (errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        success: false, 
        message: 'No se pudo conectar al servidor. Verifica el host y puerto.' 
      }, { status: 400 })
    }
    if (errorMessage.includes('EAUTH') || errorMessage.includes('Invalid login')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Credenciales inválidas. Verifica usuario y contraseña.' 
      }, { status: 400 })
    }
    if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ETIMEOUT')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tiempo de conexión agotado. Verifica el servidor y puerto.' 
      }, { status: 400 })
    }
    if (errorMessage.includes('ESOCKET')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error de socket. Posiblemente SSL/TLS. Intenta con puerto 465 (SSL) o 587 (TLS).' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: `Error: ${errorMessage}` 
    }, { status: 400 })
  }
}