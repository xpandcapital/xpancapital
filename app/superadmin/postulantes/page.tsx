"use client"

import { useState, useEffect } from "react"
import {
  UserPlus, Search, Filter, Download, User, Mail,
  Briefcase, Trash2, Edit3, Loader2,
  Eye, TrendingUp, Users, UserCheck, AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/Toast"
import { Postulante, diccionarioPreguntas } from "./_types"
import { PostulanteDetailModal } from "./_components/PostulanteDetailModal"
import { PostulanteFormModal } from "./_components/PostulanteFormModal"

const EMPRESA_ID = "6186f014-c8c7-4027-9f08-8acf2bae3eae"

const ESTADOS = ["nuevo", "en_revision", "entrevista", "aceptado", "rechazado"] as const

const ESTADO_LABELS: Record<string, string> = {
  nuevo: "Nuevo", en_revision: "En Revisión", entrevista: "Entrevista",
  aceptado: "Aceptado", rechazado: "Rechazado",
}

const ESTADO_STYLES: Record<string, string> = {
  nuevo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  en_revision: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  entrevista: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  aceptado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rechazado: "bg-rose-500/20 text-rose-400 border-rose-500/30",
}

interface FormField {
  nombre_completo: string; correo_contacto: string; puesto_postula: string;
  celular_contacto: string; estado: Postulante["estado"]
}
const emptyForm: FormField = {
  nombre_completo: "", correo_contacto: "", puesto_postula: "",
  celular_contacto: "", estado: "nuevo",
}

export default function AdminPostulantes() {
  const { showToast } = useToast()
  const [postulantes, setPostulantes] = useState<Postulante[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailPostulante, setDetailPostulante] = useState<Postulante | null>(null)
  const [editingPostulante, setEditingPostulante] = useState<Postulante | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormField>(emptyForm)
  useEffect(() => { fetchPostulantes() }, [])

  const fetchPostulantes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/postulantes")
      const data = await res.json()
      if (data.success && data.data) setPostulantes(data.data)
    } catch { showToast("Error al cargar postulantes", "error") }
    finally { setLoading(false) }
  }

  const openCreateModal = () => {
    setEditingPostulante(null); setForm(emptyForm); setIsModalOpen(true)
  }

  const openEditModal = (p: Postulante) => {
    setEditingPostulante(p)
    setForm({
      nombre_completo: p.nombre_completo, correo_contacto: p.correo_contacto,
      puesto_postula: p.puesto_postula || "", celular_contacto: p.celular_contacto || "",
      estado: p.estado,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre_completo.trim() || !form.correo_contacto.trim() || !form.puesto_postula.trim()) {
      showToast("Nombre, correo y puesto son obligatorios", "error"); return
    }
    setSaving(true)
    try {
      const payload = { ...form, celular_contacto: form.celular_contacto || null, empresa_id: EMPRESA_ID }
      const res = await fetch("/api/postulantes", {
        method: editingPostulante ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPostulante ? { ...payload, id: editingPostulante.id } : payload),
      })
      const data = await res.json()
      if (data.success) {
        showToast(editingPostulante ? "Postulante actualizado" : "Postulante creado", "success")
        setIsModalOpen(false); fetchPostulantes()
      } else { showToast(data.error || "Error al guardar", "error") }
    } catch { showToast("Error al guardar postulante", "error") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/postulantes", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) { showToast("Postulante eliminado", "success"); fetchPostulantes() }
      else { showToast(data.error || "Error al eliminar", "error") }
    } catch { showToast("Error al eliminar postulante", "error") }
    setDeleteConfirm(null)
  }

  const exportCSV = () => {
    const fields = Object.keys(diccionarioPreguntas)
    const headers = fields.map((f) => `"${diccionarioPreguntas[f]}"`).join(",") + "\n"
    const rows = postulantes.map((p) =>
      fields.map((f) => `"${String((p as unknown as Record<string, unknown>)[f] ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n")
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob); a.download = `postulantes_${new Date().toISOString().split("T")[0]}.csv`; a.click()
  }

  const filtered = postulantes.filter((p) => {
    const q = searchTerm.toLowerCase()
    const matchSearch = p.nombre_completo?.toLowerCase().includes(q)
      || p.correo_contacto?.toLowerCase().includes(q)
      || p.puesto_postula?.toLowerCase().includes(q)
    const matchStatus = statusFilter === "Todos" || p.estado === statusFilter
    return matchSearch && matchStatus
  })

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const stats = {
    total: postulantes.length,
    newThisWeek: postulantes.filter((p) => new Date(p.creado_en) >= weekAgo).length,
    inInterview: postulantes.filter((p) => p.estado === "entrevista").length,
    accepted: postulantes.filter((p) => p.estado === "aceptado").length,
  }

  return (
    <div className="space-y-8 w-full mx-auto pb-10 px-4 md:px-8 pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
            Postulantes{" "}
            <span className="text-blis-red text-[10px] sm:text-sm align-middle ml-2 bg-blis-red/10 px-2 py-0.5 rounded-full border border-blis-red/20">
              {postulantes.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">Gestión de aspirantes y proceso de selección.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={exportCSV} className="flex-1 sm:flex-none bg-white/5 border border-white/10 text-white px-3 sm:px-5 py-3 sm:py-4 rounded-xl font-bold uppercase tracking-wider text-[10px] sm:text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Exportar CSV</span><span className="sm:hidden">Exportar</span>
          </button>
          <button onClick={openCreateModal} className="flex-1 sm:flex-none bg-blis-red text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold uppercase tracking-wider text-[10px] sm:text-xs hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
            <UserPlus className="w-3.5 h-3.5 sm:w-5 sm:h-5" /><span className="hidden sm:inline">Nuevo Postulante</span><span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-white" },
          { label: "Nuevos esta semana", value: stats.newThisWeek, icon: TrendingUp, color: "text-blue-400" },
          { label: "En entrevista", value: stats.inInterview, icon: Eye, color: "text-purple-400" },
          { label: "Aceptados", value: stats.accepted, icon: UserCheck, color: "text-emerald-400" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Buscar por nombre, correo o puesto..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blis-red"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none appearance-none pr-6">
            <option value="Todos">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No se encontraron postulantes</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/[0.02] text-gray-300 uppercase font-semibold text-[10px] tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-5">Nombre</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Puesto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => setDetailPostulante(p)}>
                    <td className="px-6 py-5 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blis-red/10 text-blis-red border border-white/5 flex items-center justify-center font-black">
                          {p.nombre_completo?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-white">{p.nombre_completo}</div>
                          {p.celular_contacto && <div className="text-[10px] text-gray-500">{p.celular_contacto}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-500" /><span className="text-gray-300">{p.correo_contacto}</span></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-gray-500" /><span className="text-gray-300">{p.puesto_postula || "—"}</span></div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold border ${ESTADO_STYLES[p.estado]}`}>
                        {ESTADO_LABELS[p.estado]}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-500">{new Date(p.creado_en).toLocaleDateString()}</td>
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(p)} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white" title="Editar"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <PostulanteFormModal form={form} setForm={setForm} editingPostulante={editingPostulante}
            saving={saving} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailPostulante && (
          <PostulanteDetailModal postulante={detailPostulante} onClose={() => setDetailPostulante(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <div className="absolute inset-0 bg-black/80" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Eliminar Postulante</h3>
                  <p className="text-sm text-gray-400 mt-1">Esta acción no se puede deshacer.</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase tracking-wider text-xs hover:bg-white/10 transition-colors">Cancelar</button>
                  <button onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-red-600 transition-colors">Eliminar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}