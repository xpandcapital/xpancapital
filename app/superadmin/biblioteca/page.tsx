"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Edit3, Trash2, Loader2, BookOpen, Search,
  Upload, Image as ImageIcon, Check, X, ArrowUp, ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Libro {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  portada_url: string | null;
  descripcion: string | null;
  download_link: string | null;
  is_featured: boolean;
  activo: boolean;
  orden: number;
  created_at: string;
}

export default function BibliotecaAdminPage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Libro | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    titulo: "", autor: "", categoria: "",
    portada_url: "", descripcion: "", download_link: "",
    is_featured: false, activo: true,
  });

  const cargar = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/biblioteca?limit=100");
    const data = await res.json();
    if (data.success) setLibros(data.libros || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const openCreate = () => {
    setEditando(null);
    setForm({ titulo: "", autor: "", categoria: "", portada_url: "", descripcion: "", download_link: "", is_featured: false, activo: true });
    setModal(true);
  };

  const openEdit = (libro: Libro) => {
    setEditando(libro);
    setForm({
      titulo: libro.titulo, autor: libro.autor, categoria: libro.categoria,
      portada_url: libro.portada_url || "", descripcion: libro.descripcion || "",
      download_link: libro.download_link || "", is_featured: libro.is_featured,
      activo: libro.activo,
    });
    setModal(true);
  };

  const guardar = async () => {
    if (!form.titulo.trim()) return;
    setGuardando(true);
    const method = editando ? "PUT" : "POST";
    const body = editando ? { id: editando.id, ...form } : form;
    const res = await fetch("/api/admin/biblioteca", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) { await cargar(); setModal(false); }
    setGuardando(false);
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este libro?")) return;
    await fetch(`/api/admin/biblioteca?id=${id}`, { method: "DELETE" });
    await cargar();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/biblioteca/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm((prev) => ({ ...prev, portada_url: data.url }));
    }
    setUploading(false);
  };

  const toggleActivo = async (libro: Libro) => {
    await fetch("/api/admin/biblioteca", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: libro.id, activo: !libro.activo }),
    });
    await cargar();
  };

  const filtrarLibros = libros.filter((l) =>
    l.titulo.toLowerCase().includes(search.toLowerCase()) ||
    l.autor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Biblioteca</h1>
            <p className="text-gray-400 text-sm mt-1">{libros.length} libros • Gestiona la biblioteca digital</p>
          </div>
          <Button onClick={openCreate} className="bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase tracking-wider text-xs">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Libro
          </Button>
        </div>

        <div className="mb-6">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o autor..."
            className="bg-zinc-900/50 border-white/10 text-white placeholder:text-gray-600 rounded-xl"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blis-red" /></div>
        ) : (
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Portada</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Autor</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Estado</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarLibros.map((libro) => (
                    <tr key={libro.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        {libro.portada_url ? (
                          <img src={libro.portada_url} alt="" className="w-10 h-14 object-cover rounded-lg border border-white/10" />
                        ) : (
                          <div className="w-10 h-14 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-bold text-white truncate max-w-[300px]">{libro.titulo}</p>
                        <p className="text-xs text-gray-500 md:hidden">{libro.autor}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="text-sm text-gray-300">{libro.autor}</p>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Switch checked={libro.activo} onCheckedChange={() => toggleActivo(libro)} />
                          <Badge className={libro.activo ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                            {libro.activo ? "Activo" : "Inactivo"}
                          </Badge>
                          {libro.is_featured && <Badge className="bg-amber-500/20 text-amber-400">Destacado</Badge>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(libro)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => eliminar(libro.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtrarLibros.length === 0 && (
              <p className="text-center py-12 text-gray-500">No se encontraron libros</p>
            )}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              {editando ? "Editar Libro" : "Nuevo Libro"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Título *</label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Autor</label>
                <Input value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Categoría</label>
                <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Portada</label>
              <div className="flex gap-3">
                <Input value={form.portada_url} onChange={(e) => setForm({ ...form, portada_url: e.target.value })} placeholder="URL de la imagen" className="bg-white/5 border-white/10 text-white flex-1" />
                <label className="p-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 text-gray-400 hover:text-white flex items-center gap-1">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              {form.portada_url && (
                <img src={form.portada_url} alt="Preview" className="mt-2 w-20 h-28 object-cover rounded-lg border border-white/10" />
              )}
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Link de descarga</label>
              <Input value={form.download_link} onChange={(e) => setForm({ ...form, download_link: e.target.value })} placeholder="https://drive.google.com/..." className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                <span className="text-xs text-gray-400">Destacado</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.activo} onCheckedChange={(v) => setForm({ ...form, activo: v })} />
                <span className="text-xs text-gray-400">Activo</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setModal(false)} variant="outline" className="flex-1 border-white/10 text-gray-300 hover:bg-white/5">
                Cancelar
              </Button>
              <Button onClick={guardar} disabled={guardando || !form.titulo.trim()} className="flex-1 bg-blis-red hover:bg-blis-red/90 text-white font-bold">
                {guardando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editando ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
