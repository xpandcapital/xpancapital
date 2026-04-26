import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Cliente admin (service role - bypass RLS) - se usa para todas las operaciones de BD
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Función para crear cliente que lee cookies
function createServerSupabase(request: NextRequest) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { cookie: request.headers.get('cookie') || '' } },
      cookies: {
        getAll() { return []; },
        setAll() {}
      },
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );
}

// Genera contraseña aleatoria legible
function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Envía email de bienvenida con contraseña
async function sendWelcomeEmail(to: string, nombre: string, password: string, productos: string[]) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const productList = productos.map(p => `<li style="margin-bottom:6px;">✅ ${p}</li>`).join('');

    await transporter.sendMail({
      from: `"BLIS Corp" <${process.env.SMTP_USER}>`,
      to,
      subject: '🎉 ¡Tu compra fue exitosa! Aquí está tu acceso',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#050505;font-family:Arial,sans-serif;color:#ffffff;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-block;background:#be0b24;padding:12px 24px;border-radius:12px;">
                <span style="font-size:20px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">BLIS Corp</span>
              </div>
            </div>

            <h1 style="font-size:28px;font-weight:900;text-align:center;text-transform:uppercase;letter-spacing:-1px;margin-bottom:8px;">
              ¡Compra Exitosa!
            </h1>
            <p style="text-align:center;color:#9ca3af;margin-bottom:32px;">
              Hola <strong style="color:#fff">${nombre}</strong>, tu acceso está listo.
            </p>

            <!-- Productos comprados -->
            <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:24px;">
              <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:0 0 16px;">
                Productos Adquiridos
              </h3>
              <ul style="margin:0;padding:0;list-style:none;font-size:14px;color:#e5e7eb;">
                ${productList}
              </ul>
            </div>

            <!-- Credenciales -->
            <div style="background:#0a1a0f;border:1px solid #16a34a33;border-radius:16px;padding:24px;margin-bottom:24px;">
              <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#4ade80;margin:0 0 16px;">
                🔑 Tus Credenciales de Acceso
              </h3>
              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">Email:</p>
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#fff;">${to}</p>
              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">Contraseña temporal:</p>
              <div style="background:#111;border:1px solid #222;border-radius:10px;padding:14px;text-align:center;">
                <span style="font-family:monospace;font-size:22px;font-weight:900;letter-spacing:4px;color:#4ade80;">${password}</span>
              </div>
              <p style="margin:16px 0 0;font-size:11px;color:#6b7280;text-align:center;">
                Cambia tu contraseña desde tu perfil después de iniciar sesión.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'}/miembros"
                style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:16px 40px;border-radius:12px;">
                Acceder a Mis Productos →
              </a>
            </div>

            <p style="text-align:center;color:#4b5563;font-size:11px;">
              BLIS Corp · Si no realizaste esta compra, contáctanos de inmediato.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (err) {
    console.error('Error enviando email:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      empresa_id,
      user_id,
      nombre,
      email,
      telefono,
      productos,
      metodo_pago,
      monto_coins,
      monto_usd,
      tiene_fisicos,
      direccion_envio,
    } = body;

    if (!email || !productos?.length) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 });
    }

    let finalUserId = user_id;
    let isNewUser = false;
    let tempPassword = '';

    // ── Intentar obtener usuario de la sesión si user_id es null ─────────────
    if (!finalUserId) {
      // Intentar obtener de cookies usando cliente con anon key
      const supabaseWithCookies = createServerSupabase(request);
      const { data: { user } } = await supabaseWithCookies.auth.getUser();
      if (user) {
        finalUserId = user.id;
        console.log('[CHECKOUT] Usuario obtenido de cookies:', user.id);
      } else {
        // Si no funciona, intentar con Authorization header
        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const supabaseAnon = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const { data: sessionData } = await supabaseAnon.auth.getUser(token);
          if (sessionData?.user) {
            finalUserId = sessionData.user.id;
            console.log('[CHECKOUT] Usuario obtenido de token:', sessionData.user.id);
          }
        }
      }
    }

    // ── Si no hay user_id, buscar o crear usuario ────────────────────────────
    if (!finalUserId) {
      // 1. Buscar si ya existe en auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase());

      if (existingUser) {
        finalUserId = existingUser.id;
      } else {
        // 2. Crear usuario nuevo con contraseña generada
        tempPassword = generatePassword();
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email.toLowerCase(),
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            nombre,
            telefono,
          },
        });

        if (createError) {
          console.error('Error creando usuario:', createError);
          // No bloqueamos la compra si falla la creación de usuario
        } else {
          finalUserId = newUser.user?.id;
          isNewUser = true;

          // Crear perfil en tabla profiles
          if (finalUserId) {
            await supabase.from('profiles').upsert({
              id: finalUserId,
              email: email.toLowerCase(),
              nombre,
              telefono,
              empresa_id,
              creado_en: new Date().toISOString(),
            }, { onConflict: 'id' });
          }
        }
      }
    }

    // ── Crear la orden en Supabase ───────────────────────────────────────────
    const primerProductoId = productos?.[0]?.producto_id || productos?.[0]?.id || null;
    
    console.log('[CHECKOUT] Creando orden con:', {
      empresa_id,
      user_id: finalUserId,
      producto_id: primerProductoId,
      metodo_pago,
      monto_coins,
      monto_usd,
      productosCount: productos?.length
    });
    
    const { data: orden, error: ordenError } = await supabase
      .from('compras')
      .insert({
        empresa_id,
        user_id: finalUserId || null,
        producto_id: primerProductoId,
        metodo_pago,
        monto_coins: monto_coins || 0,
        monto_usd: monto_usd || 0,
        estado: 'completado',
        metadata: {
          productos,
          email_cliente: email.toLowerCase(),
          nombre_cliente: nombre,
          telefono_cliente: telefono,
          tiene_fisicos: tiene_fisicos || false,
          direccion_envio: direccion_envio || null,
        },
        creado_en: new Date().toISOString(),
      })
      .select()
      .single();

    console.log('[CHECKOUT] Resultado de inserción:', { orden, ordenError });

    if (ordenError) {
      console.error('Error creando orden:', ordenError);
      return NextResponse.json({ success: false, error: 'Error al crear la orden' }, { status: 500 });
    }

    if (!orden) {
      console.error('[CHECKOUT] No se pudo crear la orden - orden es null');
      return NextResponse.json({ success: false, error: 'No se pudo crear la orden' }, { status: 500 });
    }

    // ── Crear registros en compra_items ────────────────────────────────────
    if (orden && productos?.length > 0) {
      const items = productos.map((p: any) => ({
        compra_id: orden.id,
        producto_id: p.producto_id || p.id,
        cantidad: p.cantidad || 1,
        precio_unitario: p.precio_unitario || p.price || 0,
        product_type: p.productType || 'digital',
      })).filter((item: any) => item.producto_id); // Solo items con producto_id válido

      if (items.length > 0) {
        const { error: itemsError } = await supabase.from('compra_items').insert(items);
        if (itemsError) {
          console.error('Error creando items de compra:', itemsError);
        }
      }
    }

    // ── Si pagó con coins, descontarlos ─────────────────────────────────────
    if (metodo_pago === 'coins' && finalUserId && monto_coins > 0) {
      await supabase.from('coins_transacciones').insert({
        user_id: finalUserId,
        tipo: 'compra',
        monto: -monto_coins,
        descripcion: `Compra de ${productos.length} producto(s)`,
        empresa_id,
        creado_en: new Date().toISOString(),
      });
    }

      // ── Auto-asignar cursos comprados en la tienda ───────────────────────────
    let coursesAssigned = 0;
    let courseAssignmentError = null;
    if (finalUserId && email) {
      console.log('[Checkout] Buscando cursos para asignar, productos:', JSON.stringify(productos, null, 2));
      const cursoProducts = productos.filter((p: any) => p.productType === 'curso' || p.tipo === 'servicio');
      console.log('[Checkout] Cursos detectados:', cursoProducts.length);
      for (const product of cursoProducts) {
        try {
          // Primero intentar con curso_id directo (vínculo explícito productos→cursos)
          let cursoId = product.curso_id || null;
          let cursoExists = !!cursoId;

          // Si no hay curso_id, intentar lookup por slug del producto
          if (!cursoExists && (product.slug || product.producto_id)) {
            const { data: cursoBySlug } = await supabase
              .from('cursos')
              .select('id')
              .eq('slug', product.slug || product.producto_id)
              .maybeSingle();
            if (cursoBySlug) {
              cursoId = cursoBySlug.id;
              cursoExists = true;
              console.log(`[Checkout] Curso encontrado por slug: ${cursoId}`);
            }
          }

          // Si sigue sin existir, buscar por ID directo del producto
          if (!cursoExists && product.id) {
            const { data: cursoData } = await supabase
              .from('cursos')
              .select('id')
              .eq('id', product.id)
              .maybeSingle();
            if (cursoData) {
              cursoId = cursoData.id;
              cursoExists = true;
              console.log(`[Checkout] Curso encontrado por ID: ${cursoId}`);
            }
          }

          if (!cursoExists) {
            console.log(`[Checkout] Curso NO encontrado para producto:`, product);
          }

          if (cursoExists && cursoId) {
            const { data: advisor } = await supabase
              .from('advisors')
              .select('id')
              .eq('email', email.toLowerCase())
              .maybeSingle();
            let advisorId = advisor?.id;
            if (!advisorId) {
              const { data: newAdvisor, error: createAdvError } = await supabase
                .from('advisors')
                .insert({
                  email: email.toLowerCase(),
                  name: nombre || email.split('@')[0],
                })
                .select('id')
                .single();
              if (createAdvError) {
                console.error('[Checkout] Error creando advisor:', createAdvError);
                courseAssignmentError = 'No se pudo crear el registro de asesor';
                continue;
              }
              advisorId = newAdvisor?.id;
              console.log(`[Checkout] Advisor creado: ${advisorId}`);
            }
            if (advisorId) {
              const { error: assignError } = await supabase
                .from('equipo_cursos')
                .insert({
                  advisor_id: advisorId,
                  curso_id: cursoId,
                  user_id: finalUserId,
                  estado: 'asignado',
                  lecciones_completadas: [],
                });
              if (assignError && assignError.code !== '23505') {
                console.error('[Checkout] Error auto-asignando curso:', assignError);
                courseAssignmentError = 'Error al asignar el curso';
              } else if (!assignError) {
                console.log(`[Checkout] Curso ${cursoId} auto-asignado a ${email}`);
                coursesAssigned++;
              } else if (assignError?.code === '23505') {
                console.log(`[Checkout] Curso ${cursoId} ya estaba asignado a ${email}`);
                coursesAssigned++;
              }
            }
          }
        } catch (e) {
          console.error('[Checkout] Error en auto-asignación de curso:', e);
          courseAssignmentError = 'Error interno al asignar curso';
        }
      }
      console.log(`[Checkout] Cursos asignados: ${coursesAssigned}, errores: ${courseAssignmentError}`);
    }

    // ── Enviar email ─────────────────────────────────────────────────────────
    const nombreProductos = productos.map((p: any) => p.nombre || `Producto #${p.producto_id?.substring(0, 6)}`);

    if (isNewUser && tempPassword) {
      await sendWelcomeEmail(email, nombre, tempPassword, nombreProductos);
    } else {
      // Email de confirmación sin contraseña para usuarios existentes
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const productList = nombreProductos.map((p: string) => `<li style="margin-bottom:6px;">✅ ${p}</li>`).join('');

        await transporter.sendMail({
          from: `"BLIS Corp" <${process.env.SMTP_USER}>`,
          to: email,
          subject: '✅ Confirmación de compra — BLIS Corp',
          html: `
            <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#050505;color:#fff;font-family:Arial,sans-serif;">
              <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;">¡Compra Confirmada!</h1>
              <p>Hola <strong>${nombre}</strong>, gracias por tu compra.</p>
              <div style="background:#111;border-radius:12px;padding:20px;margin:20px 0;">
                <ul style="margin:0;padding:0;list-style:none;">${productList}</ul>
              </div>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://blis-corp.com'}/miembros" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:900;text-transform:uppercase;">
                Ver Mis Productos →
              </a>
            </div>
          `,
        });
      } catch { /* Silent fail */ }
    }

    return NextResponse.json({
      success: true,
      isNewUser,
      ordenId: orden?.id || null,
      coursesAssigned,
      courseAssignmentError,
    });

  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
