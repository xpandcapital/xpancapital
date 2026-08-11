import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";
import { createUserAndNotify } from "@/lib/email/createUserAndNotify";
import { assignCoursesToUser } from "@/lib/courses/assignCourses";
import { generateSecurePassword } from "@/lib/crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET — listar todas las ventas con datos de cliente y producto
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const estado = searchParams.get("estado") || "";
    const search = searchParams.get("search") || "";
    const logsCompraId = searchParams.get("logs_compra_id");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Si se pide historial de una compra específica
    if (logsCompraId) {
      const { data } = await supabase
        .from("compras_logs")
        .select("*, admin:profiles!user_id(id, nombre)")
        .eq("compra_id", logsCompraId)
        .order("creado_en", { ascending: false });

      return NextResponse.json({ success: true, logs: data || [] });
    }

    let query = supabase
      .from("compras")
      .select(`
        *,
        cliente:profiles!user_id(id, nombre, apellido, email, avatar_url),
        producto:productos!producto_id(id, nombre, imagen_principal, tipo, curso_id, categoria:producto_categorias(nombre), curso:cursos(id, nombre))
      `, { count: "exact" })
      .order("creado_en", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (estado) query = query.eq("estado", estado);
    if (search) {
      query = query.or(`cliente.nombre.ilike.%${search}%,cliente.email.ilike.%${search}%,producto.nombre.ilike.%${search}%,metadata->>'nombre_cliente'.ilike.%${search}%,metadata->>'email_cliente'.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, ventas: data, total: count, page, limit });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT — actualizar estado y/o método de pago de una venta (con logs)
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { id, estado, metodo_pago, notas, sub_tipo_pago } = body;

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener estado anterior para el log
    const { data: compraActual } = await supabase
      .from("compras")
      .select("estado")
      .eq("id", id)
      .single();

    const updates: any = {};
    if (estado) updates.estado = estado;
    if (metodo_pago) updates.metodo_pago = metodo_pago;

    const { data, error } = await supabase
      .from("compras")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    // Guardar sub_tipo_pago en metadata
    if (sub_tipo_pago && data) {
      const metaActual = data.metadata || {}
      await supabase.from('compras').update({
        metadata: { ...metaActual, sub_tipo_pago }
      }).eq('id', id)
    }

    // Insertar log de cambio si cambió el estado
    if (estado && compraActual && compraActual.estado !== estado) {
      await supabase.from("compras_logs").insert({
        compra_id: id,
        user_id: auth.userId,
        estado_anterior: compraActual.estado,
        estado_nuevo: estado,
        notas: notas || null,
      });

      // Si se confirma como completado, crear usuario (si es invitado), asignar cursos y enviar email
      if (estado === 'completado') {
        const meta = (data.metadata || {}) as Record<string, unknown>
        const email = (meta.email_cliente as string) || ''
        const nombreCompleto = (meta.nombre_cliente as string) || 'Cliente'
        const nombreParts = nombreCompleto.trim().split(/\s+/)
        const nombre = nombreParts[0] || 'Cliente'
        const apellido = nombreParts.slice(1).join(' ') || ''
        const productos = (meta.productos as Array<any>) || []

        console.log('[admin/ventas PUT] Marcando completado. user_id actual:', data.user_id, '| email:', email, '| nombre:', nombre, '| apellido:', apellido, '| productos:', productos.length)

        if (email && productos.length > 0) {
          const prodNames = productos.map((p: any) => p.nombre || 'Producto')
          const prodPrices = productos.map((p: any) => ({
            nombre: p.nombre || 'Producto',
            precio: p.precio_unitario?.toFixed(2) || data.monto_usd?.toFixed(2) || '0',
            cantidad: p.cantidad || 1,
            categoria: p.productType || '',
            imagen: p.imagen || '',
          }))

          // Detectar si fue una compra de invitado (sin sesión al momento del checkout)
          const esInvitadoOriginal = !!(meta.es_invitado) || !data.user_id
          console.log('[admin/ventas PUT] esInvitadoOriginal:', esInvitadoOriginal, '| meta.es_invitado:', meta.es_invitado, '| data.user_id:', data.user_id)

          // Si el usuario fue creado por el checkout pero nunca recibió su contraseña,
          // generar una nueva para incluirla en el email
          let passwordParaEmail = ''
          if (esInvitadoOriginal && data.user_id) {
            passwordParaEmail = generateSecurePassword()
            const { error: passError } = await supabase.auth.admin.updateUserById(data.user_id, { password: passwordParaEmail })
            if (passError) {
              console.error('[admin/ventas PUT] Error actualizando contraseña:', passError.message)
              passwordParaEmail = ''
            } else {
              console.log('[admin/ventas PUT] Contraseña actualizada para usuario existente invitado:', passwordParaEmail.substring(0, 3) + '***')
            }
          }

          const createResult = await createUserAndNotify({
            email, nombre, apellido,
            isGuest: esInvitadoOriginal,
            productos: prodNames,
            total: `${data.monto_usd?.toFixed(2) || '0'} USD`,
            metodo_pago: data.metodo_pago || 'Manual',
            productPrices: prodPrices,
            newUserPassword: passwordParaEmail || undefined,
          }).catch((err) => {
            console.error('[admin/ventas PUT] Error en createUserAndNotify:', err)
            return { userId: null, isNewUser: false, tempPassword: '' }
          })

          console.log('[admin/ventas PUT] createUserAndNotify result:', { userId: createResult.userId, isNewUser: createResult.isNewUser, tempPasswordLength: createResult.tempPassword?.length || 0 })

          const userId = createResult.userId
          const effectiveUserId = data.user_id || userId

          if (userId && !data.user_id) {
            await supabase.from('compras').update({ user_id: userId }).eq('id', id)
          }

          // Asignar cursos comprados al usuario efectivo
          if (effectiveUserId) {
            await assignCoursesToUser(supabase as any, productos, email, effectiveUserId, nombre)
          }
        }
      }
    }

    return NextResponse.json({ success: true, venta: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — eliminar venta (admin/superadmin)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || !["superadmin", "admin"].includes(auth.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("compras").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — registrar venta offline/transferencia
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { email, producto_id, metodo_pago, monto_usd, monto_coins, fecha_compra, nombre, apellido, telefono } = body;

    if (!email || !producto_id) {
      return NextResponse.json({ error: "email y producto_id requeridos" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar o crear usuario
    let userId: string | null = null;
    let tempPassword: string | null = null;
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      // Crear usuario en Auth
      tempPassword = Math.random().toString(36).slice(-10) + "Aa1!";
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: { nombre: `${nombre || ""} ${apellido || ""}`.trim() || email.split("@")[0] },
      });

      if (!authError && newUser.user?.id) {
        userId = newUser.user.id;
      } else {
        // Intentar recuperar usuario existente en Auth si createUser falló (email duplicado)
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const found = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
        if (found?.id) {
          userId = found.id
        } else {
          const msg = authError?.message || 'Usuario no retornado'
          return NextResponse.json({ error: `No se pudo crear el usuario: ${msg}` }, { status: 500 });
        }
      }

      // Crear/actualizar perfil
      await supabase.from("profiles").upsert({
        id: userId,
        email: email.toLowerCase(),
        nombre: nombre || email.split("@")[0],
        apellido: apellido || null,
        empresa_id: auth.empresaId,
        rol: "cliente",
        telefono: telefono || null,
      }, { onConflict: "id" });

      // Enviar email con contraseña temporal (solo para usuarios nuevos)
      if (tempPassword) {
        try {
          const { sendTemplateEmail } = await import("@/lib/email/sendTemplateEmail");
          sendTemplateEmail({
            evento: "cuenta_bienvenida",
            to: email,
            variables: {
              nombre: nombre || email.split("@")[0],
              email: email,
              contrasena: tempPassword,
              enlace_acceso: `${process.env.NEXT_PUBLIC_APP_URL || "https://xpandcapital.org"}/login`,
            },
          }).catch(() => {});
        } catch {}
      }
    }

    // Calcular fecha de vencimiento si el producto tiene duración
    let fechaVencimiento = null;
    if (producto_id) {
      const { data: prod } = await supabase
        .from("productos")
        .select("duracion_dias")
        .eq("id", producto_id)
        .single();
      if (prod?.duracion_dias) {
        const inicio = fecha_compra ? new Date(fecha_compra) : new Date();
        fechaVencimiento = new Date(inicio.getTime() + prod.duracion_dias * 86400000).toISOString();
      }
    }

    const { data, error } = await supabase
      .from("compras")
      .insert({
        user_id: userId,
        producto_id,
        metodo_pago: metodo_pago || "transferencia",
        monto_usd: monto_usd || 0,
        monto_coins: monto_coins || 0,
        estado: "completado",
        creado_en: fecha_compra ? new Date(fecha_compra).toISOString() : new Date().toISOString(),
        fecha_vencimiento_acceso: fechaVencimiento,
        metadata: {
          nombre_cliente: [nombre, apellido].filter(Boolean).join(' '),
          apellido_cliente: apellido || null,
          email_cliente: email.toLowerCase(),
          telefono_cliente: telefono || null,
          es_registro_manual: true,
        },
      })
      .select("*")
      .single();

    if (error) {
      console.error('[Ventas POST] Error insertando compra:', error);
      throw error;
    }
    console.log('[Ventas POST] Compra creada:', data.id, 'userId:', userId);

    // Crear compra_item vinculado
    await supabase.from("compra_items").insert({
      compra_id: data.id,
      producto_id,
      cantidad: 1,
      precio_unitario: monto_usd || 0,
    });

    // Asignar cursos si el producto tiene curso vinculado
    const { data: productoInfo } = await supabase
      .from("productos")
      .select("id, nombre, curso_id")
      .eq("id", producto_id)
      .single();

    if (productoInfo?.curso_id) {
      try {
        await assignCoursesToUser(
          supabase as any,
          [{ id: producto_id, curso_id: productoInfo.curso_id, nombre: productoInfo.nombre }],
          email,
          userId!,
          nombre || email.split("@")[0]
        );
      } catch {}
    }

    // Marcar perfil como cliente con compras
    await supabase.from("profiles").update({ ha_comprado: true }).eq("id", userId)

    // Crear notificación para todos los admins
    try {
      const productoNombre = productoInfo?.nombre || 'Producto'
      await supabase.from("notificaciones").insert({
        empresa_id: auth.empresaId,
        tipo: 'venta',
        titulo: 'Nueva venta registrada',
        mensaje: `${nombre || email.split('@')[0]} compró ${productoNombre}${metodo_pago === 'regalo' ? ' (Regalo)' : ''}`,
        destinatario_tipo: 'por_rol',
        destinatario_ids: ['admin', 'superadmin'],
        leida: false,
        creado_en: new Date().toISOString(),
      })
    } catch {}

    console.log('[Ventas POST] Venta completada:', { ventaId: data.id, userId, email, tempPassword: !!tempPassword });
    return NextResponse.json({ success: true, venta: data, tempPassword, esNuevo: !existingProfile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
