// Types ────────────────────────────────────────────────────────────────────────
import type { Advisor, EquipoCurso, EquipoProducto, Role } from '../_types';

interface CursoInfo {
  id: string;
  nombre: string;
  precio_usd: number;
  imagen_principal: string | null;
  para_equipo?: boolean;
}

interface ProductoInfo {
  id: string;
  nombre: string;
  precio_usd: number;
  imagen_principal: string | null;
}

type EquipoCursoRow = Omit<EquipoCurso, 'cursos'>;
type EquipoProductoRow = Omit<EquipoProducto, 'productos'>;

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

export function useAsesores() {
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAdvisors = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('advisors')
        .select('*')
        .order('name')
      if (err) throw err
      setAdvisors(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar equipo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAdvisors() }, [fetchAdvisors])

  return { advisors, loading, error, refetch: fetchAdvisors }
}

export function useEquipoCursos(advisorId: string | null) {
  const [cursos, setCursos] = useState<EquipoCurso[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCursos = useCallback(async () => {
    if (!advisorId) { setCursos([]); return }
    setLoading(true)
    try {
      const { data: equipoData, error } = await supabase
        .from('equipo_cursos')
        .select('*')
        .eq('advisor_id', advisorId)
        .order('asignado_en', { ascending: false })
      if (error) throw error

      let cursosInfo: Record<string, CursoInfo> = {}
      if (equipoData && equipoData.length > 0) {
        const cursoIds = [...new Set(equipoData.map(e => e.curso_id).filter(Boolean))]
        if (cursoIds.length > 0) {
          const { data: cursosData } = await supabase
            .from('cursos')
            .select('id, nombre, precio_usd, imagen_principal, para_equipo')
            .in('id', cursoIds)
          if (cursosData) {
            for (const c of (cursosData as CursoInfo[])) cursosInfo[c.id] = c
          }
        }
      }

      const merged = (equipoData || []).map((ec: EquipoCursoRow) => ({
        ...ec,
        cursos: cursosInfo[ec.curso_id] || null,
      }))
      setCursos(merged as EquipoCurso[])
    } catch {
      setCursos([])
    } finally {
      setLoading(false)
    }
  }, [advisorId])

  useEffect(() => { fetchCursos() }, [fetchCursos])

  const assignCurso = async (cursoId: string) => {
    if (!advisorId) return false
    const res = await fetch('/api/equipo-cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ advisor_id: advisorId, curso_id: cursoId }),
    })
    const result = await res.json()
    if (result.success) { await fetchCursos(); return true }
    return false
  }

  const removeCurso = async (id: string) => {
    const res = await fetch(`/api/equipo-cursos?id=${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (result.success) { await fetchCursos(); return true }
    return false
  }

  return { cursos, loading, assignCurso, removeCurso, refetch: fetchCursos }
}

export function useEquipoProductos(advisorId: string | null) {
  const [productos, setProductos] = useState<EquipoProducto[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProductos = useCallback(async () => {
    if (!advisorId) { setProductos([]); return }
    setLoading(true)
    try {
      const { data: equipoProdsData, error } = await supabase
        .from('equipo_productos')
        .select('*')
        .eq('advisor_id', advisorId)
        .order('asignado_en', { ascending: false })

      let productosInfo: Record<string, ProductoInfo> = {}
      if (equipoProdsData && equipoProdsData.length > 0) {
        const productoIds = [...new Set(equipoProdsData.map(e => e.producto_id).filter(Boolean))]
        if (productoIds.length > 0) {
          const { data: prodsData } = await supabase
            .from('productos')
            .select('id, nombre, precio_usd, imagen_principal')
            .in('id', productoIds)
          if (prodsData) {
            for (const p of (prodsData as ProductoInfo[])) productosInfo[p.id] = p
          }
        }
      }

      const merged = (equipoProdsData || []).map((ep: EquipoProductoRow) => ({
        ...ep,
        productos: productosInfo[ep.producto_id] || null,
      }))
      setProductos(merged as EquipoProducto[])
    } catch {
      setProductos([])
    } finally {
      setLoading(false)
    }
  }, [advisorId])

  useEffect(() => { fetchProductos() }, [fetchProductos])

  const assignProducto = async (productoId: string) => {
    if (!advisorId) return false
    const res = await fetch('/api/equipo-productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ advisor_id: advisorId, producto_id: productoId }),
    })
    const result = await res.json()
    if (result.success) { await fetchProductos(); return true }
    return false
  }

  const removeProducto = async (id: string) => {
    const res = await fetch(`/api/equipo-productos?id=${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (result.success) { await fetchProductos(); return true }
    return false
  }

  return { productos, loading, assignProducto, removeProducto, refetch: fetchProductos }
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/roles')
      const data = await res.json()
      if (data.success) setRoles(data.data || [])
    } catch {
      setRoles([
        { id: '1', nombre: 'usuario', label: 'Usuario', permisos: ['ver_productos', 'comprar'], color: '#6b7280' },
        { id: '2', nombre: 'cliente', label: 'Cliente', permisos: ['ver_productos', 'comprar', 'ver_historial'], color: '#3b82f6' },
        { id: '3', nombre: 'editor', label: 'Editor', permisos: ['ver_productos', 'comprar', 'editar_contenido', 'crear_posts'], color: '#8b5cf6' },
        { id: '4', nombre: 'admin', label: 'Admin', permisos: ['ver_productos', 'comprar', 'editar_contenido', 'gestionar_productos', 'gestionar_usuarios'], color: '#f59e0b' },
        { id: '5', nombre: 'superadmin', label: 'Super Admin', permisos: ['*'], color: '#be0b3c' },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  return { roles, loading, refetch: fetchRoles }
}
