"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Package, Plus, Search, Edit, Trash2,
    Loader2, X
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/Toast";

interface Product {
    id: string;
    nombre: string;
    slug: string;
    descripcion?: string;
    precio_coins?: number;
    precio_usd?: number;
    tipo: string;
    categoria_id?: string;
    activo: boolean;
    destacado: boolean;
    creado_en: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/productos');
            const data = await response.json();
            
            if (data.success) {
                setProducts(data.data || []);
            }
        } catch {
            showToast('Error al cargar productos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        
        try {
            const response = await fetch(`/api/productos?id=${id}`, { method: 'DELETE' });
            const data = await response.json();
            
            if (data.success) {
                showToast('Producto eliminado', 'success');
                fetchProducts();
            } else {
                showToast(data.error || 'Error al eliminar', 'error');
            }
        } catch {
            showToast('Error al eliminar', 'error');
        }
    };

    const handleToggleActive = async (product: Product) => {
        try {
            const response = await fetch('/api/productos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product.id,
                    activo: !product.activo
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast(`Producto ${!product.activo ? 'activado' : 'desactivado'}`, 'success');
                fetchProducts();
            }
        } catch {
            showToast('Error al actualizar', 'error');
        }
    };

    const filteredProducts = products.filter(p => 
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase">Productos</h1>
                        <p className="text-gray-400 text-sm">Gestiona los productos de la tienda</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar productos..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-blis-red transition-colors w-64"
                            />
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blis-red text-white font-bold text-sm rounded-xl hover:bg-blis-red/80 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo
                        </button>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Producto</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Precio</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Estado</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-white">{product.nombre}</p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.descripcion}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-gray-300">
                                                    {product.tipo}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    {product.precio_usd && (
                                                        <span className="text-sm font-bold text-white">${product.precio_usd}</span>
                                                    )}
                                                    {product.precio_coins && (
                                                        <span className="text-xs text-amber-500">{product.precio_coins} coins</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleToggleActive(product)}
                                                    className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${
                                                        product.activo
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}
                                                >
                                                    {product.activo ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            setShowModal(true);
                                                        }}
                                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Package className="w-12 h-12 text-gray-600 mb-4" />
                            <p className="text-gray-400">No hay productos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for creating/editing products - simplified */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowModal(false)} />
                    <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Próximamente: Formulario completo de productos
                        </p>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}