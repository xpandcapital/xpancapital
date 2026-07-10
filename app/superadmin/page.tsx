"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  DollarSign, Package, Users, Eye, Contact, Briefcase,
  ShoppingCart, FileText, TrendingUp, RefreshCw, Clock, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa';

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

function getActiveEmpresaId(): string {
  if (typeof window === 'undefined') return DEFAULT_EMPRESA_ID;
  try {
    const stored = localStorage.getItem('blis_active_empresa');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return DEFAULT_EMPRESA_ID;
}

export default function Dashboard() {
  const [empresa, setEmpresa] = useState<{ nombre: string; id: string }>({ nombre: 'BLIS Corp', id: DEFAULT_EMPRESA_ID });
  const [productsCount, setProductsCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [blogViews, setBlogViews] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [compras, setCompras] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<{ nombre: string; ventas: number }[]>([]);
  const [lastLeads, setLastLeads] = useState<any[]>([]);
  const [lastCompras, setLastCompras] = useState<any[]>([]);
  const [lastPosts, setLastPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartMonths, setChartMonths] = useState(6);
  const [initialLoad, setInitialLoad] = useState(true);
  const empresaIdRef = useRef(getActiveEmpresaId());

  const fetchData = useCallback(async (empresaIdOverride?: string) => {
    const empresaId = DEFAULT_EMPRESA_ID;
    empresaIdRef.current = empresaId;
    setError('');
    setLoading(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
    }, 8000);

    try {
      const [
        rEmpresa,
        rProdCount,
        rCliCount,
        rBlogCount,
        rLeadsTotal,
        rProjectsData,
        rComprasData,
        rTopProdData,
        rLastLeadsData,
        rLastComprasData,
        rLastPostsData,
      ] = await Promise.all([
        supabase.from('empresas').select('id, nombre').eq('id', empresaId).single(),
        supabase.from('productos').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('activo', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).neq('rol', 'superadmin').neq('rol', 'admin'),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId),
        supabase.from('projects').select('id').eq('empresa_id', empresaId).eq('is_active', true),
        supabase.from('compras').select('id, monto_usd, estado, creado_en, user_id').eq('empresa_id', empresaId).eq('estado', 'completado'),
        supabase.from('compra_items').select('cantidad, compra_id, producto:productos!inner(nombre), compras!inner(empresa_id)').eq('compras.empresa_id', empresaId).order('compra_id').limit(500),
        supabase.from('leads').select('id, nombre, email, creado_en, estado').eq('empresa_id', empresaId).order('creado_en', { ascending: false }).limit(5),
        supabase.from('compras').select('id, monto_usd, estado, creado_en, user_id').eq('empresa_id', empresaId).order('creado_en', { ascending: false }).limit(5),
        supabase.from('blog_posts').select('id, titulo, creado_en, estado').eq('empresa_id', empresaId).order('creado_en', { ascending: false }).limit(5),
      ]);

      // Verificar errores individuales
      const errors: string[] = [];
      if (rEmpresa.error) errors.push('empresa');
      if (rProdCount.error) errors.push('productos');
      if (rCliCount.error) errors.push('clientes');
      if (rBlogCount.error) errors.push('blog');
      if (rLeadsTotal.error) errors.push('leads');
      if (rProjectsData.error) errors.push('proyectos');
      if (rComprasData.error) errors.push('compras');
      if (rTopProdData.error) errors.push('compra_items');
      if (rLastLeadsData.error) errors.push('leads recientes');
      if (rLastComprasData.error) errors.push('compras recientes');
      if (rLastPostsData.error) errors.push('posts recientes');
      if (errors.length > 0) {
        setError(`Error al cargar: ${errors.join(', ')}`);
      }

      const { data: empresaData } = rEmpresa;
      const { count: prodCount } = rProdCount;
      const { count: cliCount } = rCliCount;
      const { count: blogCount } = rBlogCount;
      const { count: leadsTotal } = rLeadsTotal;
      const { data: projectsData } = rProjectsData;
      const { data: comprasData } = rComprasData;
      const { data: topProdData } = rTopProdData;
      const { data: lastLeadsData } = rLastLeadsData;
      const { data: lastComprasData } = rLastComprasData;
      const { data: lastPostsData } = rLastPostsData;

      if (empresaData) setEmpresa({ nombre: empresaData.nombre, id: empresaData.id });
      setProductsCount(prodCount || 0);
      setClientsCount(cliCount || 0);
      setBlogViews(blogCount || 0);
      setLeadsCount(leadsTotal || 0);
      setProjectsCount((projectsData || []).length);
      setCompras(comprasData || []);
      setLastLeads(lastLeadsData || []);
      setLastCompras(lastComprasData || []);
      setLastPosts(lastPostsData || []);

      if (comprasData && topProdData) {
        const completedIds = new Set(comprasData.map((c: any) => c.id));
        const filtered = (topProdData || []).filter((item: any) => completedIds.has(item.compra_id));
        const productMap = new Map<string, number>();
        for (const item of filtered) {
          const prod = Array.isArray(item.producto) ? item.producto[0] : item.producto;
          const name = prod?.nombre || 'Sin nombre';
          productMap.set(name, (productMap.get(name) || 0) + (item.cantidad || 1));
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
    setInitialLoad(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Escuchar cambios de empresa desde el CompanySwitcher
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'blis_active_empresa') {
        const newId = getActiveEmpresaId();
        if (newId !== empresaIdRef.current) {
          setLoading(true);
          fetchData(newId);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchData]);

  // Realtime: actualización incremental (solo contadores, no 11 queries)
  useEffect(() => {
    const comprasChannel = supabase
      .channel('dashboard-compras')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'compras', filter: `empresa_id=eq.${empresaIdRef.current}` }, (payload) => {
        const monto = (payload.new as any)?.monto_usd || 0
        setCompras(prev => [payload.new as any, ...prev].slice(0, 50))
        setLastCompras(prev => [payload.new as any, ...prev].slice(0, 5))
      })
      .subscribe()

    const leadsChannel = supabase
      .channel('dashboard-leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads', filter: `empresa_id=eq.${empresaIdRef.current}` }, (payload) => {
        setLeadsCount(prev => prev + 1)
        setLastLeads(prev => [payload.new as any, ...prev].slice(0, 5))
      })
      .subscribe()

    const blogChannel = supabase
      .channel('dashboard-blog')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blog_posts', filter: `empresa_id=eq.${empresaIdRef.current}` }, () => {
        setBlogViews(prev => prev + 1)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'blog_posts', filter: `empresa_id=eq.${empresaIdRef.current}` }, () => {
        // Solo refrescar posts recientes (ligero)
        supabase.from('blog_posts').select('id, titulo, creado_en, estado').eq('empresa_id', empresaIdRef.current).order('creado_en', { ascending: false }).limit(5).then(({ data }) => {
          if (data) setLastPosts(data)
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(comprasChannel)
      supabase.removeChannel(leadsChannel)
      supabase.removeChannel(blogChannel)
    }
  }, []);

  // Re-fetch cuando cambia empresaIdRef (CompanySwitcher hace reload, así que este efecto cubre el caso post-reload)
  useEffect(() => {
    const id = getActiveEmpresaId();
    if (id !== empresaIdRef.current) {
      empresaIdRef.current = id;
      setLoading(true);
      fetchData(id);
    }
  }, []);

  const totalVentas = useMemo(() => compras.reduce((s, c) => s + (Number(c.monto_usd) || 0), 0), [compras]);

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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                {empresa.nombre} <span className="text-blis-red">Panel</span>
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

        {initialLoad ? (
          <SkeletonStats />
        ) : (
          <>
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Productos Activos', val: productsCount, icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/5', fmt: formatNumber },
            { label: 'Clientes', val: clientsCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5', fmt: formatNumber },
            { label: 'Visitas al Blog', val: blogViews, icon: Eye, color: 'text-amber-500', bg: 'bg-amber-500/5', fmt: formatNumber },
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

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Leads', val: leadsCount, icon: Contact, color: 'text-purple-500', bg: 'bg-purple-500/5', fmt: formatNumber },
            { label: 'Proyectos Activos', val: projectsCount, icon: Briefcase, color: 'text-cyan-500', bg: 'bg-cyan-500/5', fmt: formatNumber },
          ].map((s, i) => (
            <div key={i} className="bg-[#050505] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl flex items-center gap-5">
              <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`} />
              <div className={`p-4 ${s.bg} rounded-2xl relative z-10`}><s.icon className={s.color} size={28} /></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{s.label}</p>
                <h4 className="text-4xl font-black text-white mt-1">{s.fmt(s.val)}</h4>
              </div>
            </div>
          ))}
        </div>

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
                  <Bar dataKey="ventas" fill="#be0b3c" radius={[8, 8, 0, 0]} />
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {[
            {
              title: 'Últimos Leads', icon: Contact, color: 'text-purple-500',
              data: lastLeads, empty: 'Sin leads recientes',
              render: (item: any) => (
                <div key={item.id}>
                  <p className="text-sm font-bold text-white">{item.nombre}</p>
                  <p className="text-[10px] text-zinc-600 font-black uppercase mt-0.5">
                    {item.email || 'Sin email'} • {item.estado || 'nuevo'}
                  </p>
                </div>
              )
            },
            {
              title: 'Últimas Compras', icon: ShoppingCart, color: 'text-emerald-500',
              data: lastCompras, empty: 'Sin compras recientes',
              render: (item: any) => (
                <div key={item.id}>
                  <p className="text-sm font-bold text-white">{formatCurrency(item.monto_usd || 0)}</p>
                  <p className="text-[10px] text-zinc-600 font-black uppercase mt-0.5">
                    {item.id?.slice(0, 8)}... • {item.estado || 'pendiente'}
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
