import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import { createClient } from '@/lib/supabase/server'
import { sendTemplateEmail } from '@/lib/email/sendTemplateEmail'

function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface CreateUserParams {
  email: string
  nombre: string
  productos: string[] // nombres de productos
  total: string
  metodo_pago: string
  empresa_id?: string
  telefono?: string
}

interface CreateUserResult {
  userId: string | null
  isNewUser: boolean
  tempPassword: string
}

export async function createUserAndNotify(params: CreateUserParams): Promise<CreateUserResult> {
  const supabase = createClient()
  const empresa_id = params.empresa_id || DEFAULT_EMPRESA_ID
  const email = params.email.toLowerCase()
  let userId: string | null = null
  let isNewUser = false
  let tempPassword = ''

  // 1. Buscar si ya existe usuario con ese email
  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)
    if (existingUser) userId = existingUser.id
  } catch (e) {
    console.error('[createUserAndNotify] Error buscando usuario:', e)
  }

  // 2. Crear nuevo usuario si no existe
  if (!userId) {
    try {
      tempPassword = generatePassword()
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { nombre: params.nombre, telefono: params.telefono || '' },
      })

      if (!createError && newUser.user?.id) {
        userId = newUser.user.id
        isNewUser = true

        await supabase.from('profiles').upsert({
          id: userId, email, nombre: params.nombre,
          telefono: params.telefono || '', empresa_id,
          creado_en: new Date().toISOString(),
        }, { onConflict: 'id' })
      }
    } catch (e) {
      console.error('[createUserAndNotify] Error creando usuario:', e)
    }
  }

  // 3. Enviar email
    const nombresList = params.productos
      .map(p => `<li style="margin-bottom:6px;font-size:14px;color:#e5e7eb;">✅ ${p}</li>`)
      .join('')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'

    if (isNewUser && tempPassword) {
      // Email de bienvenida con contraseña (fallback simple)
      await sendEmailRaw({
        to: email,
        subject: '🎉 ¡Tu cuenta BLIS Corp fue creada!',
        html: buildWelcomeHTML(params.nombre, email, tempPassword, params.productos, siteUrl),
      })
    } else {
      // Email de confirmación (usuario existente)
      const nombresList2 = params.productos
        .map(p => `<li style="margin-bottom:6px;font-size:14px;color:#e5e7eb;">✅ ${p}</li>`)
        .join('')

      await sendTemplateEmail({
        evento: userId ? 'transaccion_compra_completada_logueado' : 'transaccion_compra_completada_invitado',
        to: email,
        variables: {
          nombre: params.nombre, email,
          productos: `<ul style="margin:0;padding:0;list-style:none;">${nombresList2}</ul>`,
          total: params.total, metodo_pago: params.metodo_pago,
          fecha_compra: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }),
          enlace_acceso: `<a href="${siteUrl}/miembros" target="_blank">Acceder a Mis Productos →</a>`,
        },
      })
    }

  return { userId, isNewUser, tempPassword }
}

async function sendEmailRaw(opts: { to: string; subject: string; html: string }) {
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await transporter.sendMail({
    from: `"BLIS Corp" <${process.env.SMTP_USER}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  }).catch((e: any) => console.error('[sendEmailRaw] Error:', e))
}

function buildWelcomeHTML(nombre: string, email: string, password: string, productos: string[], siteUrl: string): string {
  const pl = productos.map(p => `<li style="margin-bottom:6px;">✅ ${p}</li>`).join('')
  return `
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#050505;color:#fff;font-family:Arial,sans-serif;">
    <div style="text-align:center;margin-bottom:24px;"><span style="background:#be0b24;padding:12px 24px;border-radius:12px;font-size:20px;font-weight:900;letter-spacing:2px;">BLIS Corp</span></div>
    <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;text-align:center;">¡Tu Cuenta fue Creada!</h1>
    <p style="text-align:center;color:#9ca3af;">Hola <strong style="color:#fff">${nombre}</strong>, aquí están tus credenciales.</p>
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin:24px 0;">
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:0 0 16px;">Productos</h3>
      <ul style="margin:0;padding:0;list-style:none;font-size:14px;color:#e5e7eb;">${pl}</ul>
    </div>
    <div style="background:#0a1a0f;border:1px solid #16a34a33;border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#4ade80;margin:0 0 16px;">🔑 Credenciales</h3>
      <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">Email: <strong style="color:#fff">${email}</strong></p>
      <p style="margin:0 0 16px;color:#9ca3af;font-size:13px;">Contraseña: <span style="font-family:monospace;font-size:20px;font-weight:900;color:#4ade80;letter-spacing:3px;">${password}</span></p>
    </div>
    <div style="text-align:center;"><a href="${siteUrl}/miembros" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:16px 40px;border-radius:12px;">Acceder a Mis Productos →</a></div>
    <p style="text-align:center;color:#4b5563;font-size:11px;margin-top:24px;">BLIS Corp · Cambia tu contraseña desde tu perfil</p>
  </div>`
}
