import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const empresa_id = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Wave 1: 10 queries independientes en paralelo
    const [
      { count: totalUsers },
      { count: totalPosts },
      { count: publishedPosts },
      { count: totalProducts },
      { count: totalPurchases },
      { data: revenueData },
      { count: totalReferrals },
      { count: recentUsers },
      { count: recentPosts },
      { data: topPosts },
      { data: topUsers },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id).eq('estado', 'publicado'),
      supabase.from('productos').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id),
      supabase.from('compras').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id),
      supabase.from('boveda_transacciones').select('monto').eq('empresa_id', empresa_id).in('tipo', ['venta', 'compra']),
      supabase.from('referidos').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id).gte('creado_en', sevenDaysAgo.toISOString()),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('empresa_id', empresa_id).gte('creado_en', sevenDaysAgo.toISOString()),
      supabase.from('blog_posts').select('id, titulo, vistas, creado_en').eq('empresa_id', empresa_id).order('vistas', { ascending: false }).limit(5),
      supabase.from('profiles').select('id, nombre, apellido, xpand_coins, creado_en').eq('empresa_id', empresa_id).order('xpand_coins', { ascending: false }).limit(5),
    ])

    // Wave 2: queries que dependen de datos (coins, blog views, purchases)
    const [{ data: coinsData }, { data: blogViews }, { data: purchases }] = await Promise.all([
      supabase.from('profiles').select('xpand_coins').eq('empresa_id', empresa_id),
      supabase.from('blog_lecturas').select('creado_en').eq('empresa_id', empresa_id).gte('creado_en', thirtyDaysAgo.toISOString()).limit(5000),
      supabase.from('compras').select('creado_en, monto_usd').eq('empresa_id', empresa_id).gte('creado_en', thirtyDaysAgo.toISOString()),
    ])

    const totalRevenue = (revenueData || []).reduce((sum, t) => sum + (t.monto || 0), 0)
    const totalCoins = (coinsData || []).reduce((sum, p) => sum + (p.xpand_coins || 0), 0)

    const viewsByDay: Record<string, number> = {}
    blogViews?.forEach(view => {
      const day = new Date(view.creado_en).toISOString().split('T')[0]
      viewsByDay[day] = (viewsByDay[day] || 0) + 1
    })

    const purchasesByDay: Record<string, number> = {}
    purchases?.forEach(purchase => {
      const day = new Date(purchase.creado_en).toISOString().split('T')[0]
      purchasesByDay[day] = (purchasesByDay[day] || 0) + (purchase.monto_usd || 0)
    })

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        publishedPosts: publishedPosts || 0,
        totalProducts: totalProducts || 0,
        totalPurchases: totalPurchases || 0,
        totalRevenue,
        totalCoins,
        totalReferrals: totalReferrals || 0,
        recentUsers: recentUsers || 0,
        recentPosts: recentPosts || 0,
        topPosts: topPosts || [],
        topUsers: topUsers || [],
        viewsByDay,
        purchasesByDay,
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
