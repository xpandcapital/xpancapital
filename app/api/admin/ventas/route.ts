import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/supabase/api-auth";
import { createUserAndNotify } from "@/lib/email/createUserAndNotify";
import { assignCoursesToUser } from "@/lib/courses/assignCourses";

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
        cliente:profiles!user_id(id, nombre, email, avatar_url),
        producto:productos!producto_id(id, nombre, imagen_principal, tipo, categoria:producto_categorias(nombre))
      `, { count: "exact" })
      .order("creado_en", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (estado) query = query.eq("estado", estado);
    if (search) query = query.or(`cliente.nombre.ilike.%${search}%,producto.nombre.ilike.%${search}%`);

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
        const nombre = (meta.nombre_cliente as string) || 'Cliente'
        const productos = (meta.productos as Array<any>) || []

        if (email && productos.length > 0) {
          const prodNames = productos.map((p: any) => p.nombre || 'Producto')
          const prodPrices = productos.map((p: any) => ({
            nombre: p.nombre || 'Producto',
            precio: p.precio_unitario?.toFixed(2) || data.monto_usd?.toFixed(2) || '0',
            cantidad: p.cantidad || 1,
            categoria: p.productType || '',
            imagen: p.imagen || '',
          }))

          const { userId } = await createUserAndNotify({
            email, nombre,
            isGuest: !data.user_id,
            productos: prodNames,
            total: `${data.monto_usd?.toFixed(2) || '0'} USD`,
            metodo_pago: data.metodo_pago || 'Manual',
            productPrices: prodPrices,
          }).catch(() => ({ userId: null, isNewUser: false, tempPassword: '' }))

          const effectiveUserId = data.user_id || userId

          if (userId && !data.user_id) {
            await supabase.from('compras').update({ user_id: userId }).eq('id', id)
          }

          // Asignar cursos comprados al usuario efectivo
          if (effectiveUserId) {
            await assignCoursesToUser(supabase, productos, email, effectiveUserId, nombre)
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
    const { user_id, producto_id, metodo_pago, monto_usd } = body;

    if (!user_id || !producto_id) {
      return NextResponse.json({ error: "user_id y producto_id requeridos" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("compras")
      .insert({
        user_id,
        producto_id,
        metodo_pago: metodo_pago || "transferencia",
        monto_usd: monto_usd || 0,
        monto_coins: 0,
        estado: "completado",
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, venta: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
