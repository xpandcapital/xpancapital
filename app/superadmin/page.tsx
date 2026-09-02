"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  DollarSign, Package, Users, Eye,
  ShoppingCart, FileText, TrendingUp, RefreshCw, Clock, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa';
import { useAkademiaStats, AkademiaStats, AkademiaRanking } from './_components/dashboard';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD' }).format(val);

const formatNumber = (val: number) => new Intl.NumberFormat('es-PE').format(val);

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function SkeletonStats() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl animate-pulse">
            <div className="w-10 h-10 bg-white/5 rounded-xl mb-4" />
            <div className="h-3 w-24 bg-white/5 rounded mb-3" />
            <div className="h-8 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl flex items-center gap-5 animate-pulse">
            <div className="w-14 h-14 bg-white/5 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-8 w-16 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-pulse">
          <div className="h-4 w-40 bg-white/5 rounded mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-white/5 rounded-lg" style={{ width: `${40 + Math.random() * 50}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-pulse">
          <div className="h-4 w-32 bg-white/5 rounded mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-6 w-6 bg-white/5 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-1.5 bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl animate-pulse">
            <div className="h-4 w-32 bg-white/5 rounded mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
      <AlertTriangle size={18} className="text-red-400 shrink-0" />
      <p className="text-sm text-red-300">{message}</p>
    </div>
  );
}

export default function Dashboard() {
  const [productsCount, setProductsCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [blogViews, setBlogViews] = useState(0);
  const [compras, setCompras] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<{ nombre: string; ventas: number }[]>([]);
  const [lastCompras, setLastCompras] = useState<any[]>([]);
  const [lastPosts, setLastPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartMonths, setChartMonths] = useState(6);
  const { stats: academiaStats, loading: academiaLoading } = useAkademiaStats();
  const fetchData = useCallback(async () => {
    setError('');
    setLoading(true);

    const safetyTimer = setTimeout(() => setLoading(false), 8000);

    try {
      const res = await fetch('/api/admin/dashboard');
      const d = await res.json();

      if (!d.success) {
        setError(d.error || 'Error al cargar datos');
        return;
      }

      setProductsCount(d.prodCount || 0);
      setClientsCount(d.cliCount || 0);
      setBlogViews(d.blogCount || 0);
      setCompras(d.compras || []);
      setLastCompras(d.lastCompras || []);
      setLastPosts(d.lastPosts || []);

      // Top products from compras
      if (d.compras?.length) {
        const productMap = new Map<string, number>();
        for (const c of d.compras) {
          const name = c.producto?.nombre || 'Producto';
          productMap.set(name, (productMap.get(name) || 0) + 1);
        }
        const sorted = [...productMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([nombre, ventas]) => ({ nombre, ventas }));
        setTopProducts(sorted);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(`Error de conexión: ${err.message || 'Error desconocido'}`);
    }

    clearTimeout(safetyTimer);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime: actualización incremental (solo contadores, no 11 queries)
  useEffect(() => {
    const comprasChannel = supabase
      .channel('dashboard-compras')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'compras' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'compras' }, () => {
        fetchData()
      })
      .subscribe()

    const blogChannel = supabase
      .channel('dashboard-blog')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blog_posts', filter: `empresa_id=eq.${DEFAULT_EMPRESA_ID}` }, () => {
        setBlogViews(prev => prev + 1)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'blog_posts', filter: `empresa_id=eq.${DEFAULT_EMPRESA_ID}` }, () => {
        // Solo refrescar posts recientes (ligero)
        supabase.from('blog_posts').select('id, titulo, creado_en, estado').eq('empresa_id', DEFAULT_EMPRESA_ID).order('creado_en', { ascending: false }).limit(5).then(({ data }) => {
          if (data) setLastPosts(data)
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(comprasChannel)
      supabase.removeChannel(blogChannel)
    }
  }, []);

  const totalVentas = useMemo(() => compras.filter(c => c.estado === 'completado').reduce((s, c) => s + (Number(c.monto_usd) || 0), 0), [compras]);

  const monthlySales = useMemo(() => {
    const now = new Date();
    const months: { label: string; ventas: number }[] = [];
    for (let i = chartMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: MESES[d.getMonth()], ventas: 0 });
    }
    for (const c of compras) {
      if (!c.creado_en) continue;
      const d = new Date(c.creado_en);
      const key = MESES[d.getMonth()];
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - chartMonths);
      if (d < monthAgo) continue;
      const entry = months.find(m => m.label === key);
      if (entry) entry.ventas += Number(c.monto_usd) || 0;
    }
    return months;
  }, [compras, chartMonths]);

  const timeSinceUpdate = lastUpdated
    ? Math.round((Date.now() - lastUpdated.getTime()) / 1000)
    : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                Xpand Capital <span className="text-blis-red">Panel</span>
              </h1>
              <button onClick={() => { setLoading(true); fetchData(); }} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-normal md:tracking-[0.4em] mt-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> Panel de Control Corporativo
              {timeSinceUpdate !== null && !loading && (
                <span className="flex items-center gap-1 text-zinc-700">
                  <Clock size={10} /> Actualizado hace {timeSinceUpdate < 60 ? `${timeSinceUpdate}s` : `${Math.floor(timeSinceUpdate / 60)}min`}
                </span>
              )}
            </p>
          </div>
          <div className="bg-[#050505] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-emerald-500/10 rounded-xl"><DollarSign size={20} className="text-emerald-500" /></div>
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase">Ventas Totales</p>
              <p className="text-xl font-black text-white">{formatCurrency(totalVentas)}</p>
            </div>
          </div>
        </div>

        <ErrorBanner message={error} />

        {loading ? (
          <SkeletonStats />
        ) : (
          <>
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Productos Activos', val: productsCount, icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/5', fmt: formatNumber },
            { label: 'Clientes', val: clientsCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5', fmt: formatNumber },
            { label: 'Posts de Blog', val: blogViews, icon: Eye, color: 'text-amber-500', bg: 'bg-amber-500/5', fmt: formatNumber },
            { label: 'Ventas Totales', val: totalVentas, icon: DollarSign, color: 'text-blis-red', bg: 'bg-blis-red/5', fmt: formatCurrency },
          ].map((s, i) => (
            <div key={i} className="bg-[#050505] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`} />
              <s.icon className={`${s.color} mb-4 relative z-10`} size={24} />
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest relative z-10">{s.label}</p>
              <h4 className="text-3xl font-black text-white mt-1 relative z-10">{s.fmt(s.val)}</h4>
            </div>
          ))}
        </div>

        {/* Academia Section */}
        {academiaLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/5 p-5 rounded-3xl shadow-2xl animate-pulse">
                  <div className="w-8 h-8 bg-white/5 rounded-xl mb-3" />
                  <div className="h-2.5 w-20 bg-white/5 rounded mb-3" />
                  <div className="h-7 w-14 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : academiaStats ? (
          <div className="space-y-8">
            <AkademiaStats stats={academiaStats} />
            <AkademiaRanking ranking={academiaStats.ranking} />
          </div>
        ) : null}

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Monthly Sales Bar Chart */}
          <div className="xl:col-span-2 bg-[#050505] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <TrendingUp size={18} className="text-blis-red" /> Ventas Mensuales
              </h3>
              <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {[6, 12].map((n) => (
                  <button
                    key={n}
                    onClick={() => setChartMonths(n)}
                    className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${
                      chartMonths === n ? 'bg-blis-red text-white' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {n}M
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="label" stroke="#52525b" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis stroke="#52525b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1rem' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Ventas']}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 700, fontSize: 12 }}
                  />
                  <Bar dataKey="ventas" fill="#d5c108" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-[#050505] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <Package size={18} className="text-emerald-500" /> Top Productos
            </h3>
            {topProducts.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-12">Sin datos de ventas</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xl font-black text-zinc-700 w-6 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{p.nombre}</p>
                      <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${topProducts[0] ? (p.ventas / topProducts[0].ventas) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-black text-zinc-500">{p.ventas} ventas</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {[
            {
              title: 'Últimas Ventas Pagadas', icon: ShoppingCart, color: 'text-emerald-500',
              data: lastCompras, empty: 'Sin ventas pagadas',
              render: (item: any) => (
                <div key={item.id}>
                  <p className="text-sm font-bold text-white">{formatCurrency(item.monto_usd || 0)}</p>
                  <p className="text-[10px] text-zinc-600 font-black uppercase mt-0.5">
                    {item.creado_en ? new Date(item.creado_en).toLocaleDateString('es-PE') : ''}
                  </p>
                </div>
              )
            },
            {
              title: 'Últimos Posts', icon: FileText, color: 'text-amber-500',
              data: lastPosts, empty: 'Sin posts recientes',
              render: (item: any) => (
                <div key={item.id}>
                  <p className="text-sm font-bold text-white truncate">{item.titulo}</p>
                  <p className="text-[10px] text-zinc-600 font-black uppercase mt-0.5">
                    {item.estado || 'borrador'} • {item.creado_en ? new Date(item.creado_en).toLocaleDateString('es-PE') : ''}
                  </p>
                </div>
              )
            },
          ].map((col, i) => (
            <div key={i} className="bg-[#050505] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <col.icon size={18} className={col.color} /> {col.title}
              </h3>
              <div className="space-y-4">
                {col.data.length === 0 ? (
                  <p className="text-zinc-500 text-xs py-8 text-center">{col.empty}</p>
                ) : (
                  col.data.map(col.render)
                )}
              </div>
            </div>
          ))}
        </div>
          </>
        )}

      </div>
    </div>
  );
}


