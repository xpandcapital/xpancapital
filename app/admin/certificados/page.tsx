"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Award, Plus, Save, Eye, Trash2, 
    Loader2, Palette, Type, Move, Image
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/Toast";

interface Plantilla {
    id: string;
    nombre: string;
    descripcion?: string;
    ancho: number;
    alto: number;
    color_fondo: string;
    color_primario: string;
    color_secundario: string;
    color_texto: string;
    color_texto_secundario: string;
    tamano_titulo: number;
    tamano_cuerpo: number;
    posicion_nombre: { x: number; y: number };
    posicion_curso: { x: number; y: number };
    posicion_fecha: { x: number; y: number };
    posicion_codigo: { x: number; y: number };
    logo_url?: string;
    fondo_url?: string;
    firma_url?: string;
    texto_titulo: string;
    texto_subtitulo: string;
    texto_completado: string;
    texto_fecha: string;
    texto_firma: string;
    activo: boolean;
}

const defaultPlantilla: Partial<Plantilla> = {
    ancho: 297,
    alto: 210,
    color_fondo: '#0a0a0a',
    color_primario: '#B10D24',
    color_secundario: '#10B981',
    color_texto: '#ffffff',
    color_texto_secundario: '#9ca3af',
    tamano_titulo: 48,
    tamano_cuerpo: 16,
    posicion_nombre: { x: 50, y: 45 },
    posicion_curso: { x: 50, y: 55 },
    posicion_fecha: { x: 30, y: 80 },
    posicion_codigo: { x: 85, y: 90 },
    texto_titulo: 'CERTIFICADO',
    texto_subtitulo: 'Se certifica que',
    texto_completado: 'ha completado satisfactoriamente el curso',
    texto_fecha: 'Fecha de emisión',
    texto_firma: 'Director Académico'
};

export default function AdminCertificadosPage() {
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchPlantillas();
    }, []);

    const fetchPlantillas = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/certificados/plantillas');
            const data = await response.json();

            if (data.success) {
                setPlantillas(data.data || []);
            }
        } catch {
            showToast('Error al cargar plantillas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingPlantilla) return;

        try {
            const method = editingPlantilla.id ? 'PUT' : 'POST';
            const { id, ...rest } = editingPlantilla;
            const body = editingPlantilla.id 
                ? { id, ...rest }
                : editingPlantilla;

            const response = await fetch('/api/certificados/plantillas', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                showToast(editingPlantilla.id ? 'Plantilla actualizada' : 'Plantilla creada', 'success');
                setShowModal(false);
                fetchPlantillas();
            } else {
                showToast(data.error || 'Error al guardar', 'error');
            }
        } catch {
            showToast('Error al guardar', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;

        try {
            const response = await fetch(`/api/certificados/plantillas?id=${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                showToast('Plantilla eliminada', 'success');
                fetchPlantillas();
            }
        } catch {
            showToast('Error al eliminar', 'error');
        }
    };

    const openNewPlantilla = () => {
        setEditingPlantilla({ ...defaultPlantilla } as Plantilla);
        setShowModal(true);
    };

    const openEditPlantilla = (plantilla: Plantilla) => {
        setEditingPlantilla(plantilla);
        setShowModal(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase">Plantillas de Certificados</h1>
                        <p className="text-gray-400 text-sm">Configura el diseño de los certificados</p>
                    </div>
                    <button
                        onClick={openNewPlantilla}
                        className="flex items-center gap-2 px-4 py-2 bg-blis-red text-white font-bold text-sm rounded-xl hover:bg-blis-red/80 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Plantilla
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                    </div>
                ) : plantillas.length === 0 ? (
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 text-center">
                        <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No hay plantillas configuradas</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plantillas.map((plantilla) => (
                            <motion.div
                                key={plantilla.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden"
                            >
                                <div 
                                    className="aspect-[1.4/1] relative"
                                    style={{ backgroundColor: plantilla.color_fondo }}
                                >
                                    <div className="absolute inset-4 border-2 rounded-lg" style={{ borderColor: plantilla.color_primario }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs uppercase tracking-widest" style={{ color: plantilla.color_texto_secundario }}>
                                                {plantilla.texto_titulo}
                                            </p>
                                            <p className="text-lg font-black mt-1" style={{ color: plantilla.color_primario }}>
                                                {plantilla.nombre}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-white">{plantilla.nombre}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${plantilla.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                            {plantilla.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>{plantilla.ancho} × {plantilla.alto} mm</span>
                                        <span>•</span>
                                        <span>Font: {plantilla.tamano_titulo}px / {plantilla.tamano_cuerpo}px</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditPlantilla(plantilla)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plantilla.id)}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {showModal && editingPlantilla && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="absolute inset-0 bg-black/80" onClick={() => setShowModal(false)} />
                        <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6">
                                {editingPlantilla.id ? 'Editar Plantilla' : 'Nueva Plantilla'}
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                                        <input
                                            type="text"
                                            value={editingPlantilla.nombre}
                                            onChange={(e) => setEditingPlantilla({ ...editingPlantilla, nombre: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                                        <input
                                            type="text"
                                            value={editingPlantilla.descripcion || ''}
                                            onChange={(e) => setEditingPlantilla({ ...editingPlantilla, descripcion: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Move className="w-4 h-4" />
                                        Dimensiones (mm)
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Ancho</label>
                                            <input
                                                type="number"
                                                value={editingPlantilla.ancho}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, ancho: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Alto</label>
                                            <input
                                                type="number"
                                                value={editingPlantilla.alto}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, alto: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Palette className="w-4 h-4" />
                                        Colores
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Fondo</label>
                                            <input
                                                type="color"
                                                value={editingPlantilla.color_fondo}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, color_fondo: e.target.value })}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Primario</label>
                                            <input
                                                type="color"
                                                value={editingPlantilla.color_primario}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, color_primario: e.target.value })}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Secundario</label>
                                            <input
                                                type="color"
                                                value={editingPlantilla.color_secundario}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, color_secundario: e.target.value })}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Texto</label>
                                            <input
                                                type="color"
                                                value={editingPlantilla.color_texto}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, color_texto: e.target.value })}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Texto Sec.</label>
                                            <input
                                                type="color"
                                                value={editingPlantilla.color_texto_secundario}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, color_texto_secundario: e.target.value })}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Type className="w-4 h-4" />
                                        Tipografía
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Tamaño título (px)</label>
                                            <input
                                                type="number"
                                                value={editingPlantilla.tamano_titulo}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, tamano_titulo: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Tamaño cuerpo (px)</label>
                                            <input
                                                type="number"
                                                value={editingPlantilla.tamano_cuerpo}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, tamano_cuerpo: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Image className="w-4 h-4" />
                                        Textos
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Título</label>
                                            <input
                                                type="text"
                                                value={editingPlantilla.texto_titulo}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, texto_titulo: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Subtítulo</label>
                                            <input
                                                type="text"
                                                value={editingPlantilla.texto_subtitulo}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, texto_subtitulo: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Texto Completado</label>
                                            <input
                                                type="text"
                                                value={editingPlantilla.texto_completado}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, texto_completado: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Firma</label>
                                            <input
                                                type="text"
                                                value={editingPlantilla.texto_firma}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, texto_firma: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Image className="w-4 h-4" />
                                        Imágenes (URLs)
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Logo URL</label>
                                            <input
                                                type="url"
                                                value={editingPlantilla.logo_url || ''}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, logo_url: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Fondo URL</label>
                                            <input
                                                type="url"
                                                value={editingPlantilla.fondo_url || ''}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, fondo_url: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Firma URL</label>
                                            <input
                                                type="url"
                                                value={editingPlantilla.firma_url || ''}
                                                onChange={(e) => setEditingPlantilla({ ...editingPlantilla, firma_url: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blis-red"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-white/5 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-blis-red text-white font-bold text-sm rounded-xl hover:bg-blis-red/80 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}