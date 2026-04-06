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

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)

    // Get total posts
    const { count: totalPosts } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)

    // Get published posts
    const { count: publishedPosts } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)
      .eq('estado', 'publicado')

    // Get total products
    const { count: totalProducts } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)

    // Get total purchases
    const { count: totalPurchases } = await supabase
      .from('compras')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)

    // Get total revenue (coins)
    const { data: revenueData } = await supabase
      .from('boveda_transacciones')
      .select('monto')
      .eq('empresa_id', empresa_id)
      .in('tipo', ['venta', 'compra'])

    const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.monto || 0), 0) || 0

    // Get total coins in circulation
    const { data: coinsData } = await supabase
      .from('profiles')
      .select('blis_coins')
      .eq('empresa_id', empresa_id)

    const totalCoins = coinsData?.reduce((sum, p) => sum + (p.blis_coins || 0), 0) || 0

    // Get referrals count
    const { count: totalReferrals } = await supabase
      .from('referidos')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: recentUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)
      .gte('creado_en', sevenDaysAgo.toISOString())

    // Get recent posts (last 7 days)
    const { count: recentPosts } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)
      .gte('creado_en', sevenDaysAgo.toISOString())

    // Get most read posts
    const { data: topPosts } = await supabase
      .from('blog_posts')
      .select('id, titulo, vistas, creado_en')
      .eq('empresa_id', empresa_id)
      .order('vistas', { ascending: false })
      .limit(5)

    // Get most active users
    const { data: topUsers } = await supabase
      .from('profiles')
      .select('id, nombre, apellido, blis_coins, creado_en')
      .eq('empresa_id', empresa_id)
      .order('blis_coins', { ascending: false })
      .limit(5)

    // Get blog views by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: blogViews } = await supabase
      .from('blog_lecturas')
      .select('creado_en')
      .eq('empresa_id', empresa_id)
      .gte('creado_en', thirtyDaysAgo.toISOString())

    // Group views by day
    const viewsByDay: Record<string, number> = {}
    blogViews?.forEach(view => {
      const day = new Date(view.creado_en).toISOString().split('T')[0]
      viewsByDay[day] = (viewsByDay[day] || 0) + 1
    })

    // Get purchases by day
    const { data: purchases } = await supabase
      .from('compras')
      .select('creado_en, monto_usd')
      .eq('empresa_id', empresa_id)
      .gte('creado_en', thirtyDaysAgo.toISOString())

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
        purchasesByDay
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}