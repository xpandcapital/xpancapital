"use client";

import { useState, useEffect, useRef, Fragment, useMemo } from "react";
import {
    Plus, Search, Filter, Download, Edit2, Trash2,
    Package, Tag, Layers, ChevronRight, X,
    CheckCircle2, AlertCircle, TrendingUp, ShoppingBag, XCircle, QrCode,
    Image as ImageIcon, MoreVertical, LayoutGrid, List, Rows, ChevronUp, ChevronDown,
    Check, Trash, Square, CheckSquare, Sparkles, RotateCw, Save, Hash, Globe, Barcode as BarcodeIcon, Printer, ImagePlus, Settings2,
    Calendar, Clock, Users, BarChart3, PieChart, Monitor, Smartphone, Tablet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import RichTextEditor from "@/components/superadmin/RichTextEditor";
import { createPortal } from "react-dom";
import { CategoryProvider, useCategories } from "@/context/CategoryContext";
import { StatusProvider, useStatuses } from "@/context/StatusContext";
import { SkuProvider, useSku } from "@/context/SkuContext";
import { CurrencyProvider, useCurrency } from "@/context/CurrencyContext";
import { LabelProvider, useLabel } from "@/context/LabelContext";
import { CategoryManager } from "@/components/superadmin/CategoryManager";
import { StatusManager } from "@/components/superadmin/StatusManager";
import { SkuManager } from "@/components/superadmin/SkuManager";
import { UnitManager } from "@/components/superadmin/UnitManager";
import { CurrencyManager } from "@/components/superadmin/CurrencyManager";
import { LabelManager } from "@/components/superadmin/LabelManager";
import { ViewManager } from "@/components/superadmin/ViewManager";
import { BusinessEngineManager } from "@/components/superadmin/BusinessEngineManager";
import { ShippingManager } from "@/components/superadmin/ShippingManager";

import { UnitProvider } from "@/context/UnitContext";
import { BusinessSettingsProvider, useBusinessSettings } from "@/context/BusinessSettingsContext";
import { ShippingProvider } from "@/context/ShippingContext";

export default function AdminProducts() {
    return (
        <BusinessSettingsProvider>
            <CategoryProvider>
                <StatusProvider>
                    <SkuProvider>
                        <UnitProvider>
                            <CurrencyProvider>
                                <LabelProvider>
                                    <ShippingProvider>
                                        <AdminProductsContent />
                                    </ShippingProvider>
                                </LabelProvider>
                            </CurrencyProvider>
                        </UnitProvider>
                    </SkuProvider>
                </StatusProvider>
            </CategoryProvider>
        </BusinessSettingsProvider>
    );
}

function AdminProductsContent() {
    const { settings, updateSettings } = useBusinessSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUnlimitedSettings, setIsUnlimitedSettings] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilters, setCategoryFilters] = useState<string[]>(["Todas"]);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("list");

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("blis_default_view");
            if (saved === "compact" || saved === "list" || saved === "grid") {
                setViewMode(saved as any);
            }
        }
    }, []);
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isGlobalSelection, setIsGlobalSelection] = useState(false);

    const [products, setProducts] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoadingData(true);
            try {
                const res = await fetch('/api/productos?all=true');
                const data = await res.json();
                if (data.success && data.data) {
                    const mapped = data.data.map((p: any) => ({
                        id: p.id,
                        sku: p.sku || `SKU-${p.id.substring(0,6).toUpperCase()}`,
                        skuPrefix: p.sku_prefix || 'SKU',
                        isAutoSku: p.is_auto_sku !== false,
                        name: p.nombre,
                        category: p.categoria?.nombre || 'Capacitaciones',
                        price: p.precio_usd || 0,
                        originalPrice: p.precio_comparacion || p.precio_usd || 0,
                        discountPercentage: p.descuento_porcentaje || 0,
                        discountUntil: p.descuento_hasta || '',
                        bliscoins: p.precio_coins || 0,
                        isBlisCoinsOnly: p.metodo_pago === 'coins',
                        stock: p.stock_ilimitado ? -1 : p.stock,
                        lowStockThreshold: p.stock_bajo_nivel || 10,
                        status: p.stock_ilimitado ? "Ilimitado" : (p.stock === 0 ? "Agotado" : (p.stock <= (p.stock_bajo_nivel || 10) ? "Bajo Stock" : "Disponible")),
                        image: p.imagen_principal || '/images/placeholder-product.jpg',
                        description: p.descripcion || '',
                        currencyCode: "USD",
                        isPerishable: p.es_perecedero || false,
                        purchaseDate: p.fecha_compra || '',
                        expirationDate: p.fecha_vencimiento || '',
                        perishableHandling: p.manejo_perecedero || 'discard',
                        batchUid: p.lote_uid || ''
                    }));
                    setProducts(mapped);
                    setInitialProducts(mapped);
                }
            } catch (err) {
                console.error("Error fetching products", err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchProducts();
    }, []);

    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ isOpen: boolean; productId: number | 'bulk' }>({ isOpen: false, productId: -1 });
    const [isMassEditing, setIsMassEditing] = useState(false);
    const [massEditData, setMassEditData] = useState({ category: '', status: '' });
    const [initialProducts, setInitialProducts] = useState<any[]>([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "deleted">("success");
    const [qrModal, setQrModal] = useState<{ isOpen: boolean; items: { product: any; quantity: number }[]; type: 'qr' | 'barcode' | 'web-qr' | 'default' }>({ isOpen: false, items: [], type: 'default' });
    const [overrideHeight, setOverrideHeight] = useState<number | null>(null);
    const [paperSize, setPaperSize] = useState<'A2' | 'A3' | 'A4' | 'A5'>('A4');
    const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);
    const [zoom, setZoom] = useState(1);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);

    const [isPagingOpen, setIsPagingOpen] = useState(false);
    const { settings: labelSettings, updateSettings: updateLabelSettings } = useLabel();

    const { categories: contextCategories, loading: categoriesLoading } = useCategories();
    const { statuses: contextStatuses, loading: statusesLoading } = useStatuses();
    const { skuPatterns, loading: skuLoading } = useSku();
    const { currencies, selectedCurrency, taxCurrency, activeCurrencyCodes, isMultiCurrencyEnabled, isBlisCoinsEnabled } = useCurrency();
    const categories = ["Todas", ...contextCategories.map(c => c.name)];
    const statusOptions = contextStatuses.map(s => s.name);

    // Active currencies for selectors
    const activeCurrencies = currencies.filter(c => activeCurrencyCodes.includes(c.code));

    const updateProductBulk = async (id: string, field: string, value: any) => {
        setProducts(products.map(p => {
            if (p.id === id) {
                const updated = { ...p, [field]: value };

                // Recalculate SKU if auto and category changed OR prefix changed
                if ((field === 'category' || field === 'skuPrefix') && updated.isAutoSku) {
                    const prefix = field === 'skuPrefix' ? value : (contextCategories.find(c => c.name === updated.category)?.skuPrefix || 'SKU');
                    updated.skuPrefix = prefix;
                    updated.sku = `${prefix}-${id.substring(0, 4).toUpperCase()}`;
                }

                // Recalculate SKU if isAutoSku toggled
                if (field === 'isAutoSku') {
                    if (value) {
                        const prefix = updated.skuPrefix || (contextCategories.find(c => c.name === updated.category)?.skuPrefix || 'SKU');
                        updated.skuPrefix = prefix;
                        updated.sku = `${prefix}-${id.substring(0, 4).toUpperCase()}`;
                    }
                }

                // Recalculate status
                if (field === 'stock' || field === 'lowStockThreshold') {
                    const s = updated.stock;
                    const t = updated.lowStockThreshold;
                    updated.status = s === -1 ? "Ilimitado" : (s === 0 ? "Agotado" : (s <= t ? "Bajo Stock" : (contextStatuses[0]?.name || "Disponible")));
                }

                return updated;
            }
            return p;
        }));
        
        // Sync to Supabase
        const dbUpdate: any = {};
        if (field === 'name') dbUpdate.nombre = value;
        if (field === 'price') dbUpdate.precio_usd = value;
        if (field === 'stock') { dbUpdate.stock = value === -1 ? 0 : value; dbUpdate.stock_ilimitado = value === -1; }
        if (field === 'sku') dbUpdate.sku = value;
        
        if (Object.keys(dbUpdate).length > 0) {
            try {
                await fetch('/api/productos', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, ...dbUpdate })
                });
            } catch (err) {
                console.error("Error updating", err);
            }
        }
    };

    const [isPerishable, setIsPerishable] = useState(false);
    const [perishableHandling, setPerishableHandling] = useState<'reimburse' | 'discard'>('discard');
    const [unitsPerBox, setUnitsPerBox] = useState(1);
    const [boxesToRegister, setBoxesToRegister] = useState(1);
    const [isSerialized, setIsSerialized] = useState(false);

    const handleOpenModal = (product: any = null) => {
        console.log('🚀 Abriendo modal:', { product, categories: contextCategories.length, categoriesList: contextCategories });
        setEditingProduct(product);
        setIsUnlimitedSettings(product?.stock === -1);
        setIsPerishable(product?.isPerishable || false);
        setPerishableHandling(product?.perishableHandling || 'discard');
        setUnitsPerBox(product?.unitsPerBox || 1);
        setBoxesToRegister(1);
        setIsSerialized(product?.isSerialized || false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const normalizeText = (text: string) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredProducts = useMemo(() => products.filter(p => {
        const search = normalizeText(searchTerm);
        const matchesSearch =
            normalizeText(p.name).includes(search) ||
            normalizeText(p.category).includes(search) ||
            normalizeText(p.sku).includes(search) ||
            normalizeText(p.currencyCode || selectedCurrency.code).includes(search);

        const matchesCategory = categoryFilters.includes("Todas") || categoryFilters.includes(p.category);
        return matchesSearch && matchesCategory;
    }), [products, searchTerm, categoryFilters, selectedCurrency]);

    const {
        inventoryValue,
        lowStockCount,
        outOfStockCount,
        totalPhysicalItems,
        inventoryStatusData,
        topCategoriesByStock,
        perishableStats
    } = useMemo(() => {
        const value = filteredProducts.reduce((sum, p) => sum + (p.price * (p.stock === -1 ? 0 : p.stock)), 0);
        const low = filteredProducts.filter(p => p.stock !== -1 && p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)).length;
        const out = filteredProducts.filter(p => p.stock === 0).length;
        const total = filteredProducts.reduce((sum, p) => sum + (p.stock === -1 ? 0 : p.stock), 0);

        const statusData = {
            disponible: filteredProducts.filter(p => p.stock > (p.lowStockThreshold || 10) || p.stock === -1).length,
            bajoStock: low,
            agotado: out
        };

        const cats = categories.filter(c => c !== "Todas").map(c => {
            const catProducts = filteredProducts.filter(p => p.category === c);
            const stock = catProducts.reduce((sum, p) => sum + (p.stock === -1 ? 0 : p.stock), 0);
            return { name: c, stock };
        }).sort((a, b) => b.stock - a.stock).slice(0, 5);

        const perishableProducts = filteredProducts.filter(p => p.isPerishable && p.expirationDate);
        const today = new Date();
        const criticalExp = perishableProducts.filter(p => {
            const expStr = p.expirationDate as string;
            if (!expStr) return false;
            const exp = new Date(expStr);
            const diff = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
            return diff > 0 && diff <= 15;
        }).length;

        const expiredCount = perishableProducts.filter(p => {
            const expStr = p.expirationDate as string;
            if (!expStr) return false;
            const exp = new Date(expStr);
            return exp < today;
        }).length;

        const pStats = {
            total: perishableProducts.length,
            critical: criticalExp,
            expired: expiredCount
        };

        return {
            inventoryValue: value,
            lowStockCount: low,
            outOfStockCount: out,
            totalPhysicalItems: total,
            inventoryStatusData: statusData,
            topCategoriesByStock: cats,
            perishableStats: pStats
        };
    }, [filteredProducts, categories]);


    const toggleProductSelection = (id: number, e?: React.MouseEvent) => {
        if (e?.shiftKey && lastSelectedId !== null) {
            const currentIndex = filteredProducts.findIndex(p => p.id === id);
            const lastIndex = filteredProducts.findIndex(p => p.id === lastSelectedId);

            if (currentIndex !== -1 && lastIndex !== -1) {
                const start = Math.min(currentIndex, lastIndex);
                const end = Math.max(currentIndex, lastIndex);
                const rangeIds = filteredProducts.slice(start, end + 1).map(p => p.id);

                setSelectedProducts(prev => {
                    const newSelection = [...new Set([...prev, ...rangeIds])];
                    return newSelection;
                });
                setLastSelectedId(id);
                return;
            }
        }

        setSelectedProducts(prev => {
            const isSelecting = !prev.includes(id);
            if (isSelecting) setLastSelectedId(id);
            return isSelecting ? [...prev, id] : prev.filter(pId => pId !== id);
        });
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                return { key: '', direction: null };
            }
            return { key, direction: 'asc' };
        });
    };

    const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
        if (!sortConfig.key || !sortConfig.direction) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Special handling for Currency
        if (sortConfig.key === 'currencyCode') {
            aValue = a.currencyCode || selectedCurrency.code;
            bValue = b.currencyCode || selectedCurrency.code;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const aString = String(aValue || '').toLowerCase();
        const bString = String(bValue || '').toLowerCase();

        if (sortConfig.direction === 'asc') {
            return aString.localeCompare(bString);
        } else {
            return bString.localeCompare(aString);
        }
    });

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleAllSelection = () => {
        const pageIds = paginatedProducts.map(p => p.id);
        const allPageSelected = pageIds.every(id => selectedProducts.includes(id));

        if (allPageSelected) {
            setSelectedProducts(prev => prev.filter(id => !pageIds.includes(id)));
            setIsGlobalSelection(false);
        } else {
            setSelectedProducts(prev => {
                const newSelection = [...new Set([...prev, ...pageIds])];
                return newSelection;
            });
        }
    };

    const handleSelectAllGlobal = () => {
        setSelectedProducts(filteredProducts.map(p => p.id));
        setIsGlobalSelection(true);
    };

    const handleDelete = () => {
        const { productId } = showDeleteConfirm;
        if (productId === 'bulk') {
            setProducts(products.filter(p => !selectedProducts.includes(p.id)));
            setSelectedProducts([]);
        } else {
            setProducts(products.filter(p => p.id !== productId));
            setSelectedProducts(prev => prev.filter(pId => pId !== productId));
        }
        setShowDeleteConfirm({ isOpen: false, productId: -1 });
        setToastType("deleted");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleAIGenerate = (title: string, idea: string) => {
        setIsGeneratingAI(true);
        // Simulate AI generation
        setTimeout(() => {
            const aiDescription = `<h3>${title}</h3><p>Este es un texto generado por IA basado en la idea: ${idea}. Ofrece una visiÃ³n profesional sobre los beneficios y caracterÃ­sticas Ãºnicas del producto, diseÃ±ado para maximizar la conversiÃ³n y el interÃ©s del usuario.</p>`;
            setEditingProduct((prev: any) => ({ ...prev, description: (prev?.description || "") + aiDescription }));
            setIsGeneratingAI(false);
        }, 2000);
    };

    const handleMassEdit = () => {
        setProducts(products.map(p => {
            if (selectedProducts.includes(p.id)) {
                return {
                    ...p,
                    category: massEditData.category || p.category,
                    status: massEditData.status || p.status
                };
            }
            return p;
        }));
        setSelectedProducts([]);
        setIsMassEditing(false);
        setMassEditData({ category: '', status: '' });
        setToastType("success");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const downloadLabelImage = async (idx: number, product: any) => {
        const labelEl = document.querySelector(`.label-item-${idx}`) as HTMLElement;
        if (!labelEl) return;

        const scale = 4; // High resolution
        const width = labelEl.offsetWidth;
        const height = labelEl.offsetHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear for transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // If user wants a background, we could fill it here. 
        // User asked for "sin fondo" (likely transparent or just the label content).
        // We'll keep it transparent.

        // Draw the code (QR/Barcode)
        const codeSvg = labelEl.querySelector('svg');
        if (codeSvg) {
            const svgData = new XMLSerializer().serializeToString(codeSvg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const codeContainer = codeSvg.parentElement as HTMLElement;
                const lRect = labelEl.getBoundingClientRect();
                const cRect = codeContainer.getBoundingClientRect();

                const x = (cRect.left - lRect.left) * scale;
                const y = (cRect.top - lRect.top) * scale;
                const w = cRect.width * scale;
                const h = cRect.height * scale;

                ctx.drawImage(img, x, y, w, h);
                URL.revokeObjectURL(url);

                // Now draw the text info
                drawLabelText(ctx, labelEl, scale, product);

                // Trigger download
                const link = document.createElement('a');
                link.download = `label-${product.sku}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
            img.src = url;
        }
    };

    const drawLabelText = (ctx: CanvasRenderingContext2D, labelEl: HTMLElement, scale: number, product: any) => {
        const infoEl = labelEl.querySelector('.flex-col.justify-center') as HTMLElement;
        if (!infoEl) return;

        const lRect = labelEl.getBoundingClientRect();
        const iRect = infoEl.getBoundingClientRect();
        const offsetX = (iRect.left - lRect.left) * scale;
        const offsetY = (iRect.top - lRect.top) * scale;

        ctx.textBaseline = 'top';

        // Category
        const catEl = infoEl.querySelector('p');
        if (catEl && labelSettings.showCategory) {
            const fontSize = parseFloat(window.getComputedStyle(catEl).fontSize) * scale;
            ctx.font = `900 ${fontSize}px "Inter", sans-serif`; // Use 900 for black
            ctx.fillStyle = '#ef4444'; // blis-red
            ctx.fillText(product.category.toUpperCase(), offsetX, offsetY);
        }

        // Name
        const nameEl = infoEl.querySelector('h4');
        if (nameEl && labelSettings.showName) {
            const fontSize = parseFloat(window.getComputedStyle(nameEl).fontSize) * scale;
            ctx.font = `900 ${fontSize}px "Inter", sans-serif`; // Use 900 for black
            ctx.fillStyle = '#000000';
            const nameY = offsetY + (catEl ? (parseFloat(window.getComputedStyle(catEl).fontSize) * scale * 1.5) : 0);

            // Basic text wrapping for name if needed (simplified)
            ctx.fillText(product.name.toUpperCase(), offsetX, nameY);
        }

        // Price and SKU
        const priceContainer = infoEl.querySelector('.flex.items-center.gap-2.leading-none');
        if (priceContainer) {
            const pRect = priceContainer.getBoundingClientRect();
            const pY = (pRect.top - lRect.top) * scale;
            const pX = (pRect.left - lRect.left) * scale;

            if (labelSettings.showSku) {
                const skuEl = priceContainer.querySelector('span');
                if (skuEl) {
                    const fontSize = parseFloat(window.getComputedStyle(skuEl).fontSize) * scale;
                    ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
                    ctx.fillStyle = '#9ca3af';
                    ctx.fillText(product.sku.toUpperCase(), pX, pY);
                }
            }

            if (labelSettings.showPrice) {
                const priceEl = priceContainer.querySelector('span:last-child');
                if (priceEl) {
                    const fontSize = parseFloat(window.getComputedStyle(priceEl).fontSize) * scale;
                    ctx.font = `900 ${fontSize}px "Inter", sans-serif`; // Use 900 for black
                    ctx.fillStyle = '#000000';
                    // Calculate priceX based on SKU width if SKU is shown
                    const skuTextWidth = labelSettings.showSku ? ctx.measureText(product.sku.toUpperCase()).width + (5 * scale) : 0; // 5px gap
                    const priceX = pX + skuTextWidth;
                    ctx.fillText(`${selectedCurrency.symbol}${product.price.toFixed(2)}`, priceX, pY);
                }
            }
        }
    };

    const handlePrintQR = () => {
        window.print();
    };

    const totalProducts = products.length;

    if (isModalOpen) {
        return (
            <div className="w-full space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-8 pt-8 md:pt-8">
                <div className="sticky top-[-1px] bg-black/80 backdrop-blur-2xl z-[50] py-4 border-b border-white/5 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={handleCloseModal} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <div>
                            <h1 className="text-sm font-black text-white uppercase tracking-widest">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h1>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Gestor de CatÃ¡logo</p>
                        </div>
                    </div>
                </div>

                {/* Tax Currency Info Bar */}
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-8">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center animate-pulse">
                                <Globe className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{taxCurrency.name} ({taxCurrency.code})</span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Moneda Fiscal de Referencia / Contabilidad</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 px-8 py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-gray-600 uppercase">Multimoneda</span>
                                <span className={`text-[10px] font-black uppercase ${isMultiCurrencyEnabled ? 'text-emerald-500' : 'text-gray-600'}`}>{isMultiCurrencyEnabled ? 'Activo' : 'Inactivo'}</span>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-gray-600 uppercase">BlisCoins</span>
                                <span className={`text-[10px] font-black uppercase ${isBlisCoinsEnabled ? 'text-amber-500' : 'text-gray-600'}`}>{isBlisCoinsEnabled ? 'Activo' : 'Inactivo'}</span>
                            </div>
                        </div>
                    </div>
</div>

                <form key={editingProduct?.id || 'new'} className="max-w-4xl mx-auto space-y-8" onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                        const formData = new FormData(e.currentTarget);
                        const stockVal = isUnlimitedSettings ? -1 : parseInt(formData.get('stock') as string) || 0;
                        const threshold = parseInt(formData.get('lowStockThreshold') as string) || 15;
                        const isAutoSku = formData.get('isAutoSku') === 'on';
                        const categoryName = formData.get('category') as string;
                        const selectedPrefix = formData.get('skuPrefix') as string;
                        const id = editingProduct?.id || Date.now();
                        const sku = isAutoSku ? `${selectedPrefix}-${id.toString().padStart(4, '0')}` : formData.get('sku') as string;

                        const finalStock = !editingProduct && isSerialized ? (boxesToRegister * unitsPerBox) : stockVal;

                        // Find category_id from contextCategories
                        const category = contextCategories.find(c => c.name === categoryName);
                        const categoryId = category?.id || null;

                        // Prepare data for API
                        const apiData = {
                            nombre: formData.get('name') as string,
                            slug: (formData.get('name') as string).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                            descripcion: editingProduct?.description || '',
                            contenido: editingProduct?.description || '',
                            metodo_pago: 'ambos',
                            precio_usd: parseFloat(formData.get('price') as string) || 0,
                            precio_coins: parseInt(formData.get('bliscoins') as string) || 0,
                            tipo: 'digital',
                            categoria_id: categoryId,
                            imagen_principal: editingProduct?.image || null,
                            stock: finalStock === -1 ? 0 : finalStock,
                            stock_ilimitado: finalStock === -1,
                            sku,
                            sku_prefix: selectedPrefix,
                            is_auto_sku: isAutoSku,
                            precio_comparacion: parseFloat(formData.get('originalPrice') as string) || 0,
                            descuento_porcentaje: parseInt(formData.get('discountPercentage') as string) || 0,
                            descuento_hasta: formData.get('discountUntil') as string || null,
                            stock_bajo_nivel: threshold,
                            activo: true,
                            destacado: false
                        };

                        console.log('📊 Enviando producto:', apiData);

                        if (editingProduct) {
                            // Update existing product
                            const res = await fetch('/api/productos', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: editingProduct.id, ...apiData })
                            });
                            const data = await res.json();
                            if (!data.success) {
                                console.error('❌ Error actualizando:', data.error);
                                alert('Error al actualizar: ' + data.error);
                                return;
                            }
                            console.log('✅ Producto actualizado');
                        } else {
                            // Create new product
                            const res = await fetch('/api/productos', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(apiData)
                            });
                            const data = await res.json();
                            console.log('📡 Respuesta API:', data);
                            
                            if (!data.success) {
                                console.error('❌ Error creando:', data.error);
                                alert('Error al crear: ' + data.error);
                                return;
                            }
                            console.log('✅ Producto creado:', data.data);
                            
                            // Refresh products list
                            const fetchRes = await fetch('/api/productos?all=true');
                            const fetchData = await fetchRes.json();
                            if (fetchData.success && fetchData.data) {
                                const mapped = fetchData.data.map((p: any) => ({
                                    id: p.id,
                                    sku: p.sku || `SKU-${p.id.substring(0,6).toUpperCase()}`,
                                    skuPrefix: p.sku_prefix || 'SKU',
                                    isAutoSku: p.is_auto_sku !== false,
                                    name: p.nombre,
                                    category: p.categoria?.nombre || 'Capacitaciones',
                                    price: p.precio_usd || 0,
                                    originalPrice: p.precio_comparacion || p.precio_usd || 0,
                                    discountPercentage: p.descuento_porcentaje || 0,
                                    discountUntil: p.descuento_hasta || '',
                                    bliscoins: p.precio_coins || 0,
                                    isBlisCoinsOnly: p.metodo_pago === 'coins',
                                    stock: p.stock_ilimitado ? -1 : p.stock,
                                    lowStockThreshold: p.stock_bajo_nivel || 10,
                                    status: p.stock_ilimitado ? "Ilimitado" : (p.stock === 0 ? "Agotado" : (p.stock <= (p.stock_bajo_nivel || 10) ? "Bajo Stock" : "Disponible")),
                                    image: p.imagen_principal || null,
                                    description: p.descripcion || '',
                                    currencyCode: "USD",
                                    isPerishable: p.es_perecedero || false,
                                    purchaseDate: p.fecha_compra || '',
                                    expirationDate: p.fecha_vencimiento || '',
                                    perishableHandling: p.manejo_perecedero || 'discard',
                                    batchUid: p.lote_uid || ''
                                }));
                                setProducts(mapped);
                                console.log('🔄 Lista actualizada:', mapped.length, 'productos');
                            }
                        }

                        // Show success toast
                        setToastType("success");
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                    } catch (err) {
                        console.error("❌ Error guardando producto:", err);
                        alert('Error: ' + (err instanceof Error ? err.message : String(err)));
                    }

                    handleCloseModal();
                }}>
                    <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-10 shadow-2xl">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Imagen del Producto</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div 
                                    className="aspect-square rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group hover:border-blis-red/30 transition-all cursor-pointer bg-white/[0.02]"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.value = ''; // Reset input value
                                        input.onchange = async (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                                // Check file size (10MB limit)
                                                const maxSize = 10 * 1024 * 1024;
                                                if (file.size > maxSize) {
                                                    alert('La imagen excede el límite de 10MB. Por favor, comprime la imagen o usa una más pequeña.');
                                                    // Reset input to allow re-selecting same file
                                                    input.value = '';
                                                    return;
                                                }
                                                
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                formData.append('folder', 'productos');
                                                try {
                                                    const res = await fetch('/api/upload', {
                                                        method: 'POST',
                                                        body: formData
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        setEditingProduct((prev: any) => ({ 
                                                            ...prev, 
                                                            image: data.url,
                                                            tempImageUrl: data.url 
                                                        }));
                                                    } else {
                                                        alert(data.error || 'Error al subir imagen');
                                                    }
                                                } catch (err) {
                                                    alert('Error al subir imagen');
                                                } finally {
                                                    // Reset input to allow re-selecting same file
                                                    input.value = '';
                                                }
                                            }
                                        };
                                        input.click();
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-5 h-5 text-gray-600 group-hover:text-blis-red" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">AÃ±adir Imagen</span>
                                </div>
                                {editingProduct?.image && (
                                    <div className="aspect-square rounded-[2rem] bg-zinc-900 border border-white/5 overflow-hidden relative group">
                                        <img 
                                            src={editingProduct.image} 
                                            className="w-full h-full object-cover" 
                                            alt="Producto"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1a1a1a/666?text=Sin+Imagen';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setEditingProduct((prev: any) => ({ ...prev, image: null }))}
                                            className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del Producto</label>
                                <input name="name" required defaultValue={editingProduct?.name || ''} type="text" placeholder="Ej. Whey Protein Isolate" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-800 focus:outline-none focus:border-blis-red transition-all" />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DescripciÃ³n (Editor Robusto)</label>
                                <RichTextEditor
                                    value={editingProduct?.description || ''}
                                    onChange={(val) => setEditingProduct((prev: any) => ({ ...prev, description: val }))}
                                    placeholder="Describe el producto detalladamente..."
                                    onAIGenerate={handleAIGenerate}
                                    isGeneratingAI={isGeneratingAI}
                                    onCancelAIGenerate={() => setIsGeneratingAI(false)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</label>
                                {contextCategories.length === 0 && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-3">
                                        <p className="text-[10px] font-bold text-amber-500">
                                            ⚠️ No hay categorías disponibles. Crea una categoría primero usando el botón de Configuración → Categorías.
                                        </p>
                                    </div>
                                )}
                                <select 
                                    name="category" 
                                    required={contextCategories.length > 0} 
                                    defaultValue={editingProduct?.category || (contextCategories.length > 0 ? contextCategories[0]?.name : '')} 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blis-red transition-all appearance-none disabled:opacity-50"
                                    disabled={contextCategories.length === 0}
                                >
                                    {contextCategories.length === 0 && <option value="" className="bg-zinc-900">-- Sin categoría disponible --</option>}
                                    {contextCategories.map(c => <option key={c.id} value={c.name} className="bg-zinc-900">{c.name} ({c.skuPrefix})</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center pb-1">
                                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Prefijo / Patrón SKU</label>
                                    <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer leading-none">
                                        <input type="checkbox" name="isAutoSku" defaultChecked={editingProduct ? editingProduct.isAutoSku : true} className="accent-blue-500 w-3 h-3" />
                                        Automático
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <select name="skuPrefix" defaultValue={editingProduct?.skuPrefix || contextCategories.find(c => c.name === (editingProduct?.category || categories[1]))?.skuPrefix || 'SKU'} className="w-[120px] bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-black text-blue-400 focus:outline-none focus:border-blue-500 transition-all appearance-none uppercase tracking-widest">
                                        <optgroup label="Categorías" className="bg-zinc-900 text-gray-500">
                                            {contextCategories.map(c => <option key={c.id} value={c.skuPrefix}>{c.skuPrefix} ({c.name})</option>)}
                                        </optgroup>
                                        <optgroup label="Independientes" className="bg-zinc-900 text-gray-500">
                                            {skuPatterns.map(p => <option key={p.id} value={p.prefix}>{p.prefix}</option>)}
                                        </optgroup>
                                    </select>
                                    <input name="sku" defaultValue={editingProduct?.sku || ''} type="text" placeholder="SKU Manual" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-800 focus:outline-none focus:border-blue-500 transition-all" />
                                </div>
                            </div>

                            {/* Sección de Precios y Stock - Mejorada */}
                            <div className="md:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6">
                                {/* Header de Precios */}
                                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <span className="text-emerald-500 font-black text-lg">$</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Precios y Stock</h4>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Configuración de precios y disponibilidad</p>
                                    </div>
                                </div>

                                {/* Grid de Precios - 2 columnas en móvil, 4 en desktop */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Precio Base */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Base</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{selectedCurrency.symbol}</span>
                                            <input name="originalPrice" step="0.01" defaultValue={editingProduct?.originalPrice || ''} type="number" placeholder="0.00" className="w-full bg-black/30 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all" />
                                        </div>
                                    </div>

                                    {/* Precio de Venta */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Precio Final</label>
                                        <div className="relative">
                                            {isMultiCurrencyEnabled ? (
                                                <select name="currencyCode" defaultValue={editingProduct?.currencyCode || selectedCurrency.code} className="absolute left-1 top-1 bottom-1 bg-white/10 border border-white/10 rounded-lg px-2 text-[10px] font-black text-emerald-500 focus:outline-none z-10">
                                                    {activeCurrencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                                </select>
                                            ) : (
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">{selectedCurrency.symbol}</span>
                                            )}
                                            <input name="price" step="0.01" defaultValue={editingProduct?.price || ''} type="number" placeholder="0.00" className={`w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl ${isMultiCurrencyEnabled ? 'pl-20' : 'pl-10'} pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all`} />
                                        </div>
                                    </div>

                                    {/* Descuento % */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descuento %</label>
                                        <div className="relative">
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">%</span>
                                            <input name="discountPercentage" type="number" defaultValue={editingProduct?.discountPercentage || ''} placeholder="0" className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all pr-10" />
                                        </div>
                                    </div>

                                    {/* Válido Hasta */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Válido Hasta</label>
                                        <input name="discountUntil" type="date" defaultValue={editingProduct?.discountUntil || ''} className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all" />
                                    </div>
                                </div>

                                {/* Segunda fila: BlisCoins, Stock, Alerta */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                    {/* BlisCoins */}
                                    {isBlisCoinsEnabled && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest">BlisCoins</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-black">B</span>
                                                <input name="bliscoins" defaultValue={editingProduct?.bliscoins || '0'} type="number" placeholder="0" className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-all" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Stock */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input type="checkbox" checked={isUnlimitedSettings} onChange={(e) => setIsUnlimitedSettings(e.target.checked)} className="w-3 h-3 accent-blis-red rounded" />
                                                <span className="text-[9px] font-bold text-blis-red uppercase">Ilimitado</span>
                                            </label>
                                        </div>
                                        <input name="stock" disabled={isUnlimitedSettings} required={!isUnlimitedSettings} defaultValue={editingProduct?.stock === -1 ? '' : editingProduct?.stock} type="number" placeholder={isUnlimitedSettings ? "∞" : "Cantidad"} className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blis-red transition-all disabled:opacity-30" />
                                    </div>

                                    {/* Alerta Stock */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alerta Bajo Stock</label>
                                        <input name="lowStockThreshold" defaultValue={editingProduct?.lowStockThreshold || 15} type="number" placeholder="15" className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Perecibles Section - Engineering Grade Implementation */}
                            {settings.enablePerishables && (
                                <div className="md:col-span-2 overflow-hidden">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative group">
                                        <div className="absolute top-0 right-0 p-8">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPerishable ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 border border-white/10'}`}>
                                                <Clock className={`w-6 h-6 ${isPerishable ? 'text-amber-500' : 'text-gray-600'}`} />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Gestión de Perecibles</h3>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={isPerishable} onChange={(e) => setIsPerishable(e.target.checked)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                                </label>
                                            </div>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Activar para productos con fecha de caducidad o vida útil limitada</p>
                                        </div>

                                        <AnimatePresence>
                                            {isPerishable && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-6 overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Calendar className="w-3 h-3 text-indigo-500" /> Fecha de Compra / Lote
                                                            </label>
                                                            <input name="purchaseDate" type="date" defaultValue={editingProduct?.purchaseDate || ''} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                <AlertCircle className="w-3 h-3 text-rose-500" /> Fecha de Vencimiento
                                                            </label>
                                                            <input name="expirationDate" type="date" required={isPerishable} defaultValue={editingProduct?.expirationDate || ''} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-rose-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pt-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estrategia de Logística Inversa</label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {[
                                                                { id: 'reimburse', label: 'Reembolsable', icon: RotateCw, desc: 'Devolver al proveedor', color: 'peer-checked:border-emerald-500/50 peer-checked:bg-emerald-500/10 text-emerald-500' },
                                                                { id: 'discard', label: 'Descartar', icon: Trash2, desc: 'Eliminar del inventario', color: 'peer-checked:border-rose-500/50 peer-checked:bg-rose-500/10 text-rose-500' }
                                                            ].map((strat) => (
                                                                <label key={strat.id} className="relative cursor-pointer group">
                                                                    <input type="radio" name="perishable_handling_radio" checked={perishableHandling === strat.id} onChange={() => setPerishableHandling(strat.id as any)} className="sr-only peer" />
                                                                    <div className={`p-5 rounded-2xl border border-white/5 bg-white/5 transition-all flex flex-col items-center text-center gap-3 hover:bg-white/[0.08] ${strat.color}`}>
                                                                        <strat.icon className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                                        <div>
                                                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">{strat.label}</p>
                                                                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none">{strat.desc}</p>
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {editingProduct?.expirationDate && (
                                                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Análisis de Ciclo de Vida</p>
                                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                                    {(() => {
                                                                        const diff = (new Date(editingProduct.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                                                                        if (diff < 0) return <span className="text-rose-500">PRODUCTO VENCIDO HACE {Math.abs(Math.round(diff))} DÍAS</span>;
                                                                        if (diff < 30) return <span className="text-amber-500">CRÍTICO: VENCE EN {Math.round(diff)} DÍAS</span>;
                                                                        return <span>Producto saludable: {Math.round(diff)} días restantes</span>;
                                                                    })()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {/* Batch & Serialization Section - Pro Engine Grade */}
                            {settings.enableSerialization && (
                                <div className="md:col-span-2">
                                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSerialized ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/5 border border-white/10'}`}>
                                                <BarcodeIcon className={`w-6 h-6 ${isSerialized ? 'text-indigo-500' : 'text-gray-600'}`} />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Ingreso por Lotes y Serialización</h3>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={isSerialized} onChange={(e) => setIsSerialized(e.target.checked)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Creación masiva de unidades con identificadores únicos para escaneo inteligente</p>
                                        </div>

                                        <AnimatePresence>
                                            {isSerialized && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-6 overflow-hidden pt-4 border-t border-white/5"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidades por Caja/Empaque</label>
                                                            <input
                                                                type="number"
                                                                value={unitsPerBox}
                                                                onChange={(e) => setUnitsPerBox(Math.max(1, parseInt(e.target.value) || 1))}
                                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-black"
                                                            />
                                                        </div>
                                                        {!editingProduct && (
                                                            <>
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cantidad de Cajas</label>
                                                                    <input
                                                                        type="number"
                                                                        value={boxesToRegister}
                                                                        onChange={(e) => setBoxesToRegister(Math.max(1, parseInt(e.target.value) || 1))}
                                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-black text-indigo-400"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black text-indigo-500/50 uppercase tracking-widest">Total a Ingresar</label>
                                                                    <div className="w-full bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-6 py-4 text-white flex items-center justify-between">
                                                                        <span className="text-xl font-black">{unitsPerBox * boxesToRegister}</span>
                                                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Unidades Reales</span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="p-6 bg-black/60 rounded-3xl border border-white/5 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Previsualización de Codificación Única (UID)</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Motor de Generación Activo</span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                                            {Array.from({ length: Math.min(unitsPerBox * (editingProduct ? 1 : boxesToRegister), 24) }).map((_, idx) => (
                                                                <div key={idx} className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col gap-1 group/uid hover:border-indigo-500/30 transition-colors">
                                                                    <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest">UNIT-{idx + 1}</span>
                                                                    <span className="text-[9px] font-black text-white/80 tracking-tighter truncate">
                                                                        {editingProduct?.sku || 'SKU'}#{(idx + 1).toString().padStart(3, '0')}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {(unitsPerBox * (editingProduct ? 1 : boxesToRegister)) > 24 && (
                                                                <div className="bg-indigo-500/5 border border-indigo-500/10 p-2 rounded-xl flex items-center justify-center">
                                                                    <span className="text-[8px] font-black text-gray-500 italic">+ {(unitsPerBox * (editingProduct ? 1 : boxesToRegister)) - 24} MÁS</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Trazabilidad Total Habilitada</p>
                                                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">
                                                                    Al escanear un código <span className="text-white">#{editingProduct?.sku || 'SKU'}#001</span>, el sistema detectará automáticamente su fecha de vencimiento y lote de origen.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-8 flex justify-end gap-4 border-t border-white/5">
                            <button type="button" onClick={handleCloseModal} className="px-8 py-4 text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-white hover:bg-white/5 rounded-2xl transition-colors">
                                Descartar
                            </button>
                            <button type="submit" className="bg-blis-red text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl shadow-blis-red/20 active:scale-95">
                                {editingProduct ? 'Actualizar Producto' : 'Publicar Producto'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    if (!mounted) {
        return (
            <div className="min-h-screen bg-black text-white font-inter selection:bg-blis-red/30 selection:text-white pb-20 overflow-x-hidden">
                <div className="space-y-8 w-full mx-auto px-4 md:px-8 pt-8 md:pt-8 text-center py-20">
                    <div className="w-12 h-12 border-4 border-blis-red/20 border-t-blis-red rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4 font-black uppercase tracking-[0.3em] text-[10px]">Cargando Sistema...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-black text-white font-inter selection:bg-blis-red/30 selection:text-white pb-20 overflow-x-hidden">
                <div id="main-ui" className="print:hidden">
                    <div className="space-y-8 w-full mx-auto px-4 md:px-8 pt-8 md:pt-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                            <div className="space-y-1 w-full sm:w-auto">
                                <div className="flex items-center gap-2 text-blis-red font-black text-[10px] uppercase tracking-[0.3em]">
                                    <ShoppingBag className="w-3 h-3" /> Administración de Tienda
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Inventario de Productos</h1>
                                <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Controla stock, precios y categorías de tus productos físicos y digitales.</p>
                            </div>
                            <div className="flex items-center w-full sm:w-auto mt-4 sm:mt-0 gap-2 justify-between sm:justify-end relative z-[1000]">
                                {/* Actions Toolbar Group - Left on mobile, Stuck to button on desktop */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsToolsOpen(!isToolsOpen);
                                        }}
                                        className={`p-4 sm:p-5 rounded-3xl transition-all flex items-center justify-center active:scale-95 bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl z-20 ${isToolsOpen ? 'bg-blis-red text-white shadow-[0_0_20px_rgba(190,11,60,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                                        title="Configuración de Tienda"
                                    >
                                        {isToolsOpen ? <X className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
                                    </button>

                                    <AnimatePresence>
                                        {isToolsOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 sm:left-auto sm:right-0 mt-3 bg-zinc-950 border border-white/10 rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] min-w-[240px] backdrop-blur-2xl"
                                            >
                                                <div className="flex flex-col gap-1 p-2 min-w-[260px]">
                                                    <CategoryManager />
                                                    <StatusManager />
                                                    <SkuManager />
                                                    <UnitManager />
                                                    <CurrencyManager />
                                                    <ShippingManager />
                                                    <BusinessEngineManager />
                                                    <LabelManager />
                                                    <ViewManager />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={() => handleOpenModal()}
                                    className="flex-1 sm:flex-initial sm:min-w-[180px] bg-blis-red text-white py-4 sm:py-5 px-6 sm:px-10 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(190,11,60,0.3)] z-10"
                                >
                                    <Plus className="w-5 h-4" /> <span>Producto</span>
                                </button>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="relative">
                            {/* Search & Filter Bar */}
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center justify-between">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Buscar productos..."
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-blis-red transition-all"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <AnimatePresence>
                                            {selectedProducts.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-1"
                                                >
                                                    <button
                                                        onClick={() => setQrModal({
                                                            isOpen: true,
                                                            items: products.filter(p => selectedProducts.includes(p.id)).map(p => ({ product: p, quantity: 1 })),
                                                            type: 'default'
                                                        })}
                                                        className="p-2.5 sm:p-3 rounded-xl transition-all text-emerald-500 hover:bg-emerald-500/10"
                                                        title="Imprimir Selección"
                                                    >
                                                        <BarcodeIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm({ isOpen: true, productId: 'bulk' })}
                                                        className="p-2.5 sm:p-3 rounded-xl transition-all text-red-500 hover:bg-red-500/10"
                                                        title="Borrar Múltiples"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-1 flex shrink-0">
                                            <button
                                                onClick={() => setViewMode("compact")}
                                                className={`p-2.5 sm:p-3 rounded-xl transition-all ${viewMode === 'compact' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                                title="Vista Compacta"
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode("list")}
                                                className={`p-2.5 sm:p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                                title="Vista de Lista"
                                            >
                                                <Rows className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode("grid")}
                                                className={`p-2.5 sm:p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                                title="Vista de Cuadrícula"
                                            >
                                                <LayoutGrid className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (!isBulkEditing) {
                                                    setInitialProducts([...products]);
                                                    setIsBulkEditing(true);
                                                } else {
                                                    setIsBulkEditing(false);
                                                    setToastType("success");
                                                    setShowToast(true);
                                                    setTimeout(() => setShowToast(false), 3000);
                                                }
                                            }}
                                            className={`p-2.5 sm:p-3 rounded-xl transition-all ${isBulkEditing ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white'}`}
                                            title={isBulkEditing ? "Guardar Cambios" : "Edición Masiva"}
                                        >
                                            <motion.div animate={{ rotate: isBulkEditing ? 180 : 0 }}>
                                                {isBulkEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                            </motion.div>
                                        </button>

                                        <div className="relative flex-initial">
                                            <button
                                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                                className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white transition-all relative"
                                                title="Filtrar por Categoría"
                                            >
                                                <Filter className="w-4 h-4 text-blis-red" />
                                                {!categoryFilters.includes('Todas') && (
                                                    <span className="absolute -top-1 -right-1 bg-blis-red text-white text-[8px] font-black min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                                                        {categoryFilters.length}
                                                    </span>
                                                )}
                                            </button>

                                            <AnimatePresence>
                                                {isFilterOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute top-full right-0 mt-2 bg-zinc-950 border border-white/10 rounded-3xl p-2 shadow-2xl z-[1001] min-w-[200px] sm:min-w-[240px] backdrop-blur-2xl"
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            {categories.map((c) => {
                                                                const isSelected = categoryFilters.includes(c);
                                                                return (
                                                                    <button
                                                                        key={c}
                                                                        onClick={() => {
                                                                            if (c === 'Todas') {
                                                                                setCategoryFilters(['Todas']);
                                                                            } else {
                                                                                let newFilters = categoryFilters.filter(f => f !== 'Todas');
                                                                                if (isSelected) {
                                                                                    newFilters = newFilters.filter(f => f !== c);
                                                                                    if (newFilters.length === 0) newFilters = ['Todas'];
                                                                                } else {
                                                                                    newFilters.push(c);
                                                                                }
                                                                                setCategoryFilters(newFilters);
                                                                            }
                                                                        }}
                                                                        className={`flex items-center justify-between px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-blis-red text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                                                                    >
                                                                        {c}
                                                                        {isSelected && <Check className="w-3 h-3" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                {/* Pagination & Selection Bar - Compact Single Row */}
                                <div className="flex flex-wrap items-center justify-between gap-2 py-3 px-4 bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl mb-6">
                                    {/* Left: Items per page + selection */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] hidden sm:block">Mostrar</span>
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsPagingOpen(!isPagingOpen)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-white hover:bg-white/10 transition-all ${isPagingOpen ? 'border-blis-red/50 shadow-[0_0_20px_rgba(190,11,60,0.2)] bg-white/[0.08]' : ''}`}
                                            >
                                                <span>{itemsPerPage}</span>
                                                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-500 ${isPagingOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isPagingOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute bottom-full left-0 mb-3 bg-zinc-950/90 border border-white/10 rounded-[1.5rem] p-1.5 shadow-2xl z-[100] min-w-[80px] backdrop-blur-3xl overflow-hidden"
                                                    >
                                                        {[10, 20, 50, 100].map((val) => (
                                                            <button
                                                                key={val}
                                                                onClick={() => {
                                                                    setItemsPerPage(val);
                                                                    setCurrentPage(1);
                                                                    setIsPagingOpen(false);
                                                                }}
                                                                className={`w-full px-4 py-2.5 rounded-xl text-[10px] font-black text-center transition-all ${itemsPerPage === val ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                                                            >
                                                                {val}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {selectedProducts.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blis-red/10 border border-blis-red/20 rounded-lg">
                                                    <div className="w-1 h-1 rounded-full bg-blis-red animate-pulse" />
                                                    <span className="text-[9px] font-black text-blis-red uppercase tracking-wider">{selectedProducts.length}</span>
                                                </div>
                                                {selectedProducts.length < filteredProducts.length && (
                                                    <button
                                                        onClick={handleSelectAllGlobal}
                                                        className="text-[8px] font-black text-gray-400 uppercase px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 transition-all hover:bg-white/10 hover:text-white whitespace-nowrap"
                                                    >
                                                        Todos ({filteredProducts.length})
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Page navigation */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="hidden sm:flex items-center px-2 py-1 bg-white/[0.02] border border-white/5 rounded-lg mr-0.5">
                                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.1em]">{currentPage} <span className="text-gray-800 px-0.5">/</span> {totalPages}</span>
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="w-7 h-8 rounded-lg bg-white/[0.03] border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center group"
                                        >
                                            <ChevronRight className="w-3 h-3 rotate-180 transition-transform group-hover:-translate-x-0.5" />
                                        </button>

                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(pageNum => {
                                                    if (totalPages <= 5) return true;
                                                    return pageNum === 1 ||
                                                        pageNum === totalPages ||
                                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                                                })
                                                .map((pageNum, idx, arr) => {
                                                    const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                                                    return (
                                                        <Fragment key={pageNum}>
                                                            {showEllipsis && <span className="text-gray-700 px-1 text-[9px] font-black">…</span>}
                                                            <button
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={`w-6 h-8 rounded-lg text-[9px] font-black transition-all border ${currentPage === pageNum ? 'bg-blis-red text-white border-blis-red shadow-[0_0_10px_rgba(190,11,60,0.3)]' : 'bg-transparent text-gray-500 border-transparent hover:border-white/10 hover:text-white hover:bg-white/[0.03]'}`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        </Fragment>
                                                    );
                                                })}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-7 h-8 rounded-lg bg-white/[0.03] border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center group"
                                        >
                                            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>


                            {/* Products Display */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    {viewMode === "list" ? (
                                        <table className="w-full text-left border-collapse table-fixed min-w-[1600px]">
                                            <thead>
                                                <tr className="text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                                    <th className="px-4 py-6 w-[50px] text-center">
                                                        <button onClick={toggleAllSelection} className={`p-1.5 rounded-lg transition-all ${selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? 'bg-blis-red text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                                                            {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                        </button>
                                                    </th>
                                                    <th className="px-6 py-6 w-[500px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('name')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            Producto / SKU
                                                            <div className={`transition-all ${sortConfig.key === 'name' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'name' && sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3 text-blis-red" /> : <ChevronUp className="w-3 h-3 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-6 w-[180px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('category')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            Categoría
                                                            <div className={`transition-all ${sortConfig.key === 'category' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'category' && sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3 text-blis-red" /> : <ChevronUp className="w-3 h-3 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-2 py-6 w-[100px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('currencyCode')}>
                                                        <div className="flex items-center gap-1 justify-center">
                                                            Moneda
                                                            <div className={`transition-all ${sortConfig.key === 'currencyCode' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'currencyCode' && sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3 text-blis-red" /> : <ChevronUp className="w-3 h-3 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-6 w-[150px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('price')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            Precio
                                                            <div className={`transition-all ${sortConfig.key === 'price' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'price' && sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3 text-blis-red" /> : <ChevronUp className="w-3 h-3 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-6 w-[130px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('bliscoins')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            BlisCoins
                                                            <div className={`transition-all ${sortConfig.key === 'bliscoins' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'bliscoins' && sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3 text-blis-red" /> : <ChevronUp className="w-3 h-3 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-6 w-[180px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('stock')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            Stock
                                                            <div className={`transition-all ${sortConfig.key === 'stock' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'stock' && sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3 text-blis-red" /> : <ChevronUp className="w-3 h-3 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-6 w-[200px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('status')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            Estado
                                                            <div className={`transition-all ${sortConfig.key === 'status' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'status' && sortConfig.direction === 'desc' ? <ChevronDown className="w-3 h-3 text-blis-red" /> : <ChevronUp className="w-3 h-3 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-6 w-[230px] text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {paginatedProducts.map((product, idx) => (
                                                    <tr key={product.id} className={`group hover:bg-white/[0.02] transition-colors ${selectedProducts.includes(product.id) ? 'bg-white/[0.03]' : ''}`}>
                                                        <td className="px-4 py-6 align-middle w-12 text-center cursor-pointer" onClick={(e) => toggleProductSelection(product.id, e)}>
                                                            <div className={`p-1.5 rounded-lg transition-all inline-flex ${selectedProducts.includes(product.id) ? 'bg-blis-red text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                                                                {selectedProducts.includes(product.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 align-middle min-w-[350px] lg:min-w-[400px]">
                                                            <div className="flex items-center gap-4">
                                                                {!isBulkEditing && (
                                                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative flex-shrink-0 group-hover:scale-110 transition-transform">
                                                                        <img
                                                                            src={product.image?.startsWith('http') ? product.image : `/images/${product.image}`}
                                                                            alt={product.name}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/111111/FFFFFF?text=' + product.name.charAt(0);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col flex-1 gap-1">
                                                                    {isBulkEditing ? (
                                                                        <>
                                                                            <input
                                                                                value={product.name}
                                                                                onChange={(e) => updateProductBulk(product.id, 'name', e.target.value)}
                                                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-full focus:border-blis-red outline-none"
                                                                            />
                                                                            <div className="flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={product.isAutoSku}
                                                                                    onChange={(e) => updateProductBulk(product.id, 'isAutoSku', e.target.checked)}
                                                                                    className="accent-blue-500 w-3 h-3 flex-shrink-0"
                                                                                    title="Auto SKU"
                                                                                />
                                                                                <select
                                                                                    value={product.skuPrefix || product.sku?.split('-')[0] || 'SKU'}
                                                                                    onChange={(e) => updateProductBulk(product.id, 'skuPrefix', e.target.value)}
                                                                                    className="bg-zinc-900 border border-white/10 rounded px-1.5 py-1 text-sm font-black text-blue-400 outline-none w-[80px] appearance-none text-center"
                                                                                >
                                                                                    {contextCategories.map(c => <option key={c.id} value={c.skuPrefix}>{c.skuPrefix}</option>)}
                                                                                    {skuPatterns.map(p => <option key={p.id} value={p.prefix}>{p.prefix}</option>)}
                                                                                </select>
                                                                                <input
                                                                                    value={product.sku}
                                                                                    disabled={product.isAutoSku}
                                                                                    onChange={(e) => updateProductBulk(product.id, 'sku', e.target.value)}
                                                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-gray-400 w-full disabled:opacity-50 outline-none"
                                                                                />
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-xs text-white font-bold group-hover:text-blis-red transition-colors whitespace-nowrap overflow-hidden text-ellipsis block">{product.name}</span>
                                                                            <span className="text-[11px] text-blue-400 font-bold uppercase tracking-widest whitespace-nowrap">{product.sku}</span>
                                                                            {settings.enableSerialization && product.batchUid && (
                                                                                <span className="text-[8px] text-indigo-500 font-black uppercase tracking-widest mt-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">📦 {product.batchUid}</span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 align-middle w-40">
                                                            {isBulkEditing ? (
                                                                <select
                                                                    value={product.category}
                                                                    onChange={(e) => updateProductBulk(product.id, 'category', e.target.value)}
                                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none w-full"
                                                                >
                                                                    {contextCategories.map(c => <option key={c.id} value={c.name} className="bg-zinc-900">{c.name}</option>)}
                                                                </select>
                                                            ) : (
                                                                <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-[11px] text-gray-300 whitespace-nowrap inline-block">
                                                                    {product.category}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-6 align-middle w-[100px] text-[11px] font-black text-emerald-500 uppercase tracking-tighter text-left">
                                                            <div className="flex justify-start">
                                                                <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-1 rounded-lg">
                                                                    {product.currencyCode || selectedCurrency.code}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 align-middle w-32">
                                                            {isBulkEditing ? (
                                                                <div className="flex flex-col gap-2 min-w-[120px]">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                                            <span className="text-[10px] font-black text-emerald-500">
                                                                                {currencies.find(c => c.code === (product.currencyCode || selectedCurrency.code))?.symbol || selectedCurrency.symbol}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex-1 relative">
                                                                            <input
                                                                                type="number"
                                                                                value={product.price}
                                                                                onChange={(e) => updateProductBulk(product.id, 'price', parseFloat(e.target.value))}
                                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-black text-white outline-none focus:border-emerald-500/50 transition-all"
                                                                                placeholder="0.00"
                                                                            />
                                                                            {isMultiCurrencyEnabled && (
                                                                                <select
                                                                                    value={product.currencyCode || selectedCurrency.code}
                                                                                    onChange={(e) => updateProductBulk(product.id, 'currencyCode', e.target.value)}
                                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900 border border-white/10 rounded px-1 py-0.5 text-[7px] font-black text-emerald-400 outline-none appearance-none cursor-pointer"
                                                                                >
                                                                                    {activeCurrencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                                                                </select>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-white font-black text-[13px] whitespace-nowrap">
                                                                        {(() => {
                                                                            const curr = currencies.find(c => c.code === (product.currencyCode || selectedCurrency.code)) || selectedCurrency;
                                                                            return product.price.toFixed(2);
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-6 align-middle w-24">
                                                            {isBulkEditing ? (
                                                                isBlisCoinsEnabled && (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                                                            <span className="text-[10px] font-black text-amber-500">B</span>
                                                                        </div>
                                                                        <input
                                                                            type="number"
                                                                            value={product.bliscoins}
                                                                            onChange={(e) => updateProductBulk(product.id, 'bliscoins', parseInt(e.target.value))}
                                                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-black text-white outline-none focus:border-amber-500/50 transition-all"
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                )
                                                            ) : (
                                                                product.bliscoins > 0 && isBlisCoinsEnabled ? (
                                                                    <span className="bg-amber-500/10 border border-emerald-500/0 px-2.5 py-1 rounded-lg text-[11px] font-black text-amber-500 whitespace-nowrap">
                                                                        {product.bliscoins}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-500 text-[9px] font-black uppercase tracking-tighter">-</span>
                                                                )
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-6 align-middle w-36">
                                                            {isBulkEditing ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[8px] font-black text-gray-500 w-8">STOCK</span>
                                                                        <input
                                                                            type="number"
                                                                            value={product.stock}
                                                                            onChange={(e) => updateProductBulk(product.id, 'stock', parseInt(e.target.value))}
                                                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-20 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[8px] font-black text-gray-500 w-8">ALERTA</span>
                                                                        <input
                                                                            type="number"
                                                                            value={product.lowStockThreshold}
                                                                            onChange={(e) => updateProductBulk(product.id, 'lowStockThreshold', parseInt(e.target.value))}
                                                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-20 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col gap-1.5 min-w-[100px]">
                                                                    <div className="flex justify-between text-[11px] font-black uppercase text-gray-500">
                                                                        <span className="whitespace-nowrap">{product.stock === -1 ? <span className="text-xl leading-none">∞</span> : `${product.stock} un.`}</span>
                                                                    </div>
                                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full ${product.stock === -1 ? 'bg-cyan-500' : product.stock === 0 ? 'bg-red-500' : product.stock <= (product.lowStockThreshold || 15) ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                                            style={{ width: product.stock === -1 ? '100%' : `${Math.min((product.stock / 100) * 100, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-6 align-middle min-w-[200px]">
                                                            {(() => {
                                                                const statusObj = contextStatuses.find(s => s.name === product.status);
                                                                const color = statusObj?.color || (product.status === 'Disponible' ? '#10b981' : product.status === 'Bajo Stock' ? '#f59e0b' : '#ef4444');
                                                                return (
                                                                    <span
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border border-white/5 whitespace-nowrap"
                                                                        style={{ backgroundColor: `${color}15`, color: color }}
                                                                    >
                                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                                                        {product.status}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-6 py-6 align-middle min-w-[250px] text-center">
                                                            <div className="flex items-center justify-center gap-3 text-gray-400 transition-all opacity-100 flex-nowrap shrink-0">
                                                                <button onClick={() => setQrModal({ isOpen: true, items: [{ product: product, quantity: 1 }], type: 'qr' })} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all transform hover:scale-110 shrink-0" title="Generar Etiquetas (Barras)"><BarcodeIcon className="w-4 h-4" /></button>
                                                                <button
                                                                    onClick={() => handleOpenModal(product)}
                                                                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all transform hover:scale-110 shrink-0"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowDeleteConfirm({ isOpen: true, productId: product.id })}
                                                                    className="p-3 rounded-xl bg-white/5 hover:bg-blis-red/20 text-gray-400 hover:text-blis-red transition-all transform hover:scale-110"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : viewMode === "compact" ? (
                                        <table className="w-full text-left border-collapse min-w-[1400px]">
                                            <thead>
                                                <tr className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                                    <th className="px-4 py-3 w-10 text-center">
                                                        <button onClick={toggleAllSelection} className={`p-1 rounded transition-all ${selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? 'text-blis-red' : 'text-gray-700 hover:text-white'}`}>
                                                            {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                                        </button>
                                                    </th>
                                                    <th className="px-4 py-3 w-20 cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('sku')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            SKU
                                                            <div className={`transition-all ${sortConfig.key === 'sku' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'sku' && sortConfig.direction === 'desc' ? <ChevronDown className="w-2.5 h-2.5 text-blis-red" /> : <ChevronUp className="w-2.5 h-2.5 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 min-w-[300px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('name')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            Nombre del Producto
                                                            <div className={`transition-all ${sortConfig.key === 'name' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'name' && sortConfig.direction === 'desc' ? <ChevronDown className="w-2.5 h-2.5 text-blis-red" /> : <ChevronUp className="w-2.5 h-2.5 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 w-40 cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('category')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            Categoría
                                                            <div className={`transition-all ${sortConfig.key === 'category' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'category' && sortConfig.direction === 'desc' ? <ChevronDown className="w-2.5 h-2.5 text-blis-red" /> : <ChevronUp className="w-2.5 h-2.5 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 w-16 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('currencyCode')}>Moneda</th>
                                                    <th className="px-4 py-3 w-24 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('price')}>Precio</th>
                                                    <th className="px-4 py-3 w-28 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('bliscoins')}>BlisCoins</th>
                                                    <th className="px-4 py-3 w-20 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('stock')}>Stock</th>
                                                    <th className="px-4 py-3 w-32 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => handleSort('status')}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            Estado
                                                            <div className={`transition-all ${sortConfig.key === 'status' ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                                                                {sortConfig.key === 'status' && sortConfig.direction === 'desc' ? <ChevronDown className="w-2.5 h-2.5 text-blis-red" /> : <ChevronUp className="w-2.5 h-2.5 text-blis-red" />}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 w-24 text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03]">
                                                {paginatedProducts.map((product) => (
                                                    <tr key={product.id} className={`group hover:bg-white/[0.04] transition-colors ${selectedProducts.includes(product.id) ? 'bg-blis-red/5' : ''}`}>
                                                        <td className="px-4 py-2 text-center align-middle cursor-pointer" onClick={(e) => toggleProductSelection(product.id, e)}>
                                                            <div className={`p-1 rounded transition-all ${selectedProducts.includes(product.id) ? 'text-blis-red' : 'text-gray-700'}`}>
                                                                {selectedProducts.includes(product.id) ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 align-middle">
                                                            {isBulkEditing ? (
                                                                <input
                                                                    value={product.sku}
                                                                    onChange={(e) => updateProductBulk(product.id, 'sku', e.target.value)}
                                                                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-gray-400 w-full outline-none focus:border-blis-red"
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-mono font-bold text-gray-500 group-hover:text-amber-500 transition-colors uppercase truncate block">{product.sku}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-middle truncate">
                                                            {isBulkEditing ? (
                                                                <input
                                                                    value={product.name}
                                                                    onChange={(e) => updateProductBulk(product.id, 'name', e.target.value)}
                                                                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-white w-full outline-none focus:border-blis-red"
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-bold text-white group-hover:text-blis-red transition-colors whitespace-nowrap overflow-hidden text-ellipsis block">{product.name}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-middle">
                                                            {isBulkEditing ? (
                                                                <select
                                                                    value={product.category}
                                                                    onChange={(e) => updateProductBulk(product.id, 'category', e.target.value)}
                                                                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-gray-300 w-full outline-none focus:border-blis-red"
                                                                >
                                                                    {contextCategories.map(c => <option key={c.id} value={c.name} className="bg-zinc-900">{c.name}</option>)}
                                                                </select>
                                                            ) : (
                                                                <span className="text-xs font-black text-gray-400 uppercase tracking-tighter truncate block">{product.category}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-middle">
                                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter">{product.currencyCode || selectedCurrency.code}</span>
                                                        </td>
                                                        <td className="px-4 py-2 align-middle">
                                                            {isBulkEditing ? (
                                                                <input
                                                                    type="number"
                                                                    value={product.price}
                                                                    onChange={(e) => updateProductBulk(product.id, 'price', parseFloat(e.target.value))}
                                                                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-emerald-500 w-full outline-none focus:border-emerald-500"
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-black text-emerald-500 whitespace-nowrap">
                                                                    {(() => {
                                                                        const curr = currencies.find(c => c.code === (product.currencyCode || selectedCurrency.code)) || selectedCurrency;
                                                                        return product.price.toFixed(2);
                                                                    })()}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-middle">
                                                            {isBulkEditing ? (
                                                                <input
                                                                    type="number"
                                                                    value={product.bliscoins}
                                                                    onChange={(e) => updateProductBulk(product.id, 'bliscoins', parseInt(e.target.value))}
                                                                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-amber-500 w-full outline-none focus:border-amber-500"
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-black text-amber-500 uppercase tracking-tighter">{product.bliscoins || '-'}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-middle">
                                                            {isBulkEditing ? (
                                                                <input
                                                                    type="number"
                                                                    value={product.stock}
                                                                    onChange={(e) => updateProductBulk(product.id, 'stock', parseInt(e.target.value))}
                                                                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 w-full outline-none focus:border-white/30"
                                                                />
                                                            ) : (
                                                                <span className={`text-xs font-black whitespace-nowrap ${product.stock === 0 ? 'text-red-500' : 'text-gray-300'}`}>{product.stock === -1 ? '∞' : product.stock}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-middle text-left">
                                                            {isBulkEditing ? (
                                                                <select
                                                                    value={product.status}
                                                                    onChange={(e) => updateProductBulk(product.id, 'status', e.target.value)}
                                                                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-sm text-gray-300 w-full outline-none focus:border-blis-red"
                                                                >
                                                                    {contextStatuses.map(s => <option key={s.id} value={s.name} className="bg-zinc-900">{s.name}</option>)}
                                                                </select>
                                                            ) : (
                                                                (() => {
                                                                    const statusObj = contextStatuses.find(s => s.name === product.status);
                                                                    const color = statusObj?.color || (product.status === 'Disponible' ? '#10b981' : product.status === 'Bajo Stock' ? '#f59e0b' : '#ef4444');
                                                                    return (
                                                                        <div className="flex items-center justify-start gap-1.5 whitespace-nowrap">
                                                                            <div
                                                                                className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_5px_currentColor]"
                                                                                style={{ backgroundColor: color, color: color }}
                                                                            />
                                                                            <span className="text-xs font-black uppercase tracking-tighter whitespace-nowrap" style={{ color: color }}>
                                                                                {product.status}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })()
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 align-middle text-center bg-white/[0.01]">
                                                            <div className="flex items-center justify-center gap-2 transition-opacity px-6">
                                                                <button onClick={() => setQrModal({ isOpen: true, items: [{ product: product, quantity: 1 }], type: 'qr' })} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Etiquetas"><BarcodeIcon className="w-4 h-4" /></button>
                                                                <button onClick={() => handleOpenModal(product)} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => setShowDeleteConfirm({ isOpen: true, productId: product.id })} className="p-1.5 text-gray-500 hover:text-red-500 transition-all" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 p-6 bg-white/[0.01]">
                                            {paginatedProducts.map((product) => (
                                                <motion.div
                                                    layout
                                                    key={product.id}
                                                    className={`group relative bg-zinc-950 border rounded-[2.5rem] overflow-hidden transition-all duration-500 flex flex-col h-full ${selectedProducts.includes(product.id) ? 'border-blis-red shadow-[0_0_30px_rgba(190,11,60,0.15)] bg-blis-red/[0.02]' : 'border-white/5 hover:border-white/10'}`}
                                                >
                                                    <button
                                                        onClick={(e) => toggleProductSelection(product.id, e)}
                                                        className={`absolute top-4 left-4 z-10 p-2 rounded-xl transition-all ${selectedProducts.includes(product.id) ? 'bg-blis-red text-white' : 'bg-black/40 text-gray-500'}`}
                                                    >
                                                        {selectedProducts.includes(product.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                    </button>

                                                    <div className="aspect-square relative overflow-hidden">
                                                        <img
                                                            src={product.image?.startsWith('http') ? product.image : `/images/${product.image}`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/111111/FFFFFF?text=' + product.name;
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent opacity-40" />
                                                    </div>
                                                    <div className="p-5 space-y-4 flex-1 flex flex-col">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-start gap-4">
                                                                <div className="space-y-1 flex-1 min-w-0">
                                                                    {isBulkEditing ? (
                                                                        <select
                                                                            value={product.category}
                                                                            onChange={(e) => updateProductBulk(product.id, 'category', e.target.value)}
                                                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black text-blis-red uppercase tracking-widest w-full outline-none"
                                                                        >
                                                                            {contextCategories.map(c => <option key={c.id} value={c.name} className="bg-zinc-900">{c.name}</option>)}
                                                                        </select>
                                                                    ) : (
                                                                        <p className="text-[10px] font-black text-blis-red uppercase tracking-widest">{product.category}</p>
                                                                    )}

                                                                    {isBulkEditing ? (
                                                                        <input
                                                                            value={product.name}
                                                                            onChange={(e) => updateProductBulk(product.id, 'name', e.target.value)}
                                                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-white w-full outline-none focus:border-blis-red"
                                                                        />
                                                                    ) : (
                                                                        <h3 className="text-white font-bold text-base leading-tight group-hover:text-blis-red transition-colors">{product.name}</h3>
                                                                    )}
                                                                </div>

                                                                {!isBulkEditing && (() => {
                                                                    const statusObj = contextStatuses.find(s => s.name === product.status);
                                                                    const color = statusObj?.color || (product.status === 'Disponible' ? '#10b981' : '#ef4444');
                                                                    return (
                                                                        <span
                                                                            className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/5 shrink-0"
                                                                            style={{ backgroundColor: `${color}15`, color: color }}
                                                                        >
                                                                            {product.status}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>

                                                            {!isBulkEditing && (
                                                                <div className="flex items-center gap-2">
                                                                    {product.bliscoins > 0 && isBlisCoinsEnabled ? (
                                                                        <div className="flex items-baseline gap-2">
                                                                            <span className="text-gray-500 font-bold text-xs uppercase tracking-tighter opacity-50 line-through">
                                                                                {product.price.toFixed(2)}
                                                                            </span>
                                                                            <span className="text-amber-500 font-black text-lg tracking-tighter leading-none uppercase">
                                                                                <span className="mr-0.5 text-[10px]">B</span>{product.bliscoins}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-emerald-500 font-black text-lg tracking-tighter leading-none">
                                                                            {product.price.toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {isBulkEditing && (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] text-gray-500 uppercase font-black">Precio</span>
                                                                    <input
                                                                        type="number"
                                                                        value={product.price}
                                                                        onChange={(e) => updateProductBulk(product.id, 'price', parseFloat(e.target.value))}
                                                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-emerald-500 w-full outline-none"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] text-gray-500 uppercase font-black">BlisCoins</span>
                                                                    <input
                                                                        type="number"
                                                                        value={product.bliscoins}
                                                                        onChange={(e) => updateProductBulk(product.id, 'bliscoins', parseInt(e.target.value))}
                                                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-amber-500 w-full outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                                            <div className="flex flex-col flex-1">
                                                                <span className="text-[10px] text-gray-500 uppercase font-black">Stock Actual</span>
                                                                {isBulkEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={product.stock}
                                                                        onChange={(e) => updateProductBulk(product.id, 'stock', parseInt(e.target.value))}
                                                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-black text-white w-full max-w-[80px] outline-none"
                                                                    />
                                                                ) : (
                                                                    <span className="text-white font-black tracking-tight text-xs">{product.stock === -1 ? <span className="text-xl leading-none">∞</span> : `${product.stock} Un.`}</span>
                                                                )}
                                                            </div>

                                                            {isBulkEditing ? (
                                                                <div className="flex flex-col flex-1 items-end">
                                                                    <span className="text-[9px] text-gray-500 uppercase font-black">Estado</span>
                                                                    <select
                                                                        value={product.status}
                                                                        onChange={(e) => updateProductBulk(product.id, 'status', e.target.value)}
                                                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black text-white w-full max-w-[100px] outline-none"
                                                                    >
                                                                        {contextStatuses.map(s => <option key={s.id} value={s.name} className="bg-zinc-900">{s.name}</option>)}
                                                                    </select>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-4 items-center justify-end">
                                                                    <button onClick={() => setQrModal({ isOpen: true, items: [{ product: product, quantity: 1 }], type: 'qr' })} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shadow-lg" title="Etiquetas"><BarcodeIcon className="w-4 h-4" /></button>
                                                                    <button onClick={() => handleOpenModal(product)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shadow-lg"><Edit2 className="w-4 h-4" /></button>
                                                                    <button onClick={() => setShowDeleteConfirm({ isOpen: true, productId: product.id })} className="p-2.5 rounded-xl bg-white/5 hover:bg-blis-red/20 text-gray-400 hover:text-blis-red transition-all shadow-lg"><Trash2 className="w-4 h-4" /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {filteredProducts.length === 0 && (
                                        <div className="p-32 text-center space-y-4">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Package className="w-10 h-10 text-gray-800" />
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">No hay resultados</h3>
                                            <p className="text-gray-600 max-w-xs mx-auto text-sm">Prueba ajustando los filtros o buscando otro término relacionado al catálogo.</p>
                                            <button onClick={() => { setSearchTerm(""); setCategoryFilters(["Todas"]) }} className="text-blis-red text-xs font-black uppercase tracking-widest hover:underline mt-4">Ver todos los productos</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Analytics Section - outside the grid container */}
                            <div className="mt-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Package className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Logística de Inventario</h2>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">Control de Existencias, Salud del Stock y Operaciones</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all group"
                                    >
                                        <span>{isAnalyticsOpen ? 'OCULTAR' : 'MOSTRAR'}</span>
                                        <ChevronUp className={`w-3 h-3 transition-transform duration-500 ${isAnalyticsOpen ? 'rotate-0' : 'rotate-180'}`} />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {isAnalyticsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className="space-y-4"
                                        >
                                            {/* Row 1: Quick Logistics Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[
                                                    { label: "Valor de Inventario", value: `${currencies.find(c => c.code === selectedCurrency.code)?.symbol || selectedCurrency.symbol}${inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: "Valor Total Real", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                                    { label: "Existencias Físicas", value: totalPhysicalItems.toLocaleString(), trend: "Unidades en Almacén", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
                                                    { label: "Artículos Críticos", value: (lowStockCount + outOfStockCount).toString(), trend: `${outOfStockCount} Agotados / ${lowStockCount} Bajos`, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
                                                    { label: "Rotación Mensual", value: "14.2%", trend: "Estimado Logístico", icon: RotateCw, color: "text-amber-500", bg: "bg-amber-500/10" }
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-zinc-950/50 border border-white/5 p-5 rounded-[2.5rem] flex flex-col justify-between">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                                                <stat.icon className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-2xl font-black text-white tracking-tighter">{stat.value}</h4>
                                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.trend}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Row 2: Warehouse Charts */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-2 bg-zinc-950/50 border border-white/5 p-6 rounded-[2.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Flujo de Operaciones</h3>
                                                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Actividad 24h</span>
                                                    </div>
                                                    <div className="h-40 flex items-end gap-1 px-2">
                                                        {[15, 20, 10, 5, 5, 10, 30, 60, 85, 95, 80, 70, 65, 75, 85, 90, 80, 60, 50, 45, 40, 35, 25, 20].map((h, i) => (
                                                            <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative group">
                                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500/50 to-purple-500/50 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                                                                {i % 4 === 0 && <span className="absolute -bottom-4 left-0 text-[8px] text-gray-600 font-bold">{i}h</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-8">Carga máxima en almacén: <span className="text-indigo-500">8:00 AM - 11:00 AM</span></p>
                                                </div>

                                                <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[2.5rem]">
                                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Stock por Categoría</h3>
                                                    <div className="space-y-4">
                                                        {topCategoriesByStock.length > 0 ? topCategoriesByStock.map((cat, i) => (
                                                            <div key={i} className="space-y-1.5">
                                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                                    <span className="text-gray-400">{cat.name}</span>
                                                                    <span className="text-white">{cat.stock.toLocaleString()} Un.</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${Math.min(100, (cat.stock / (totalPhysicalItems || 1)) * 100)}%` }}
                                                                        className="h-full bg-indigo-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div className="h-full flex items-center justify-center text-[10px] text-gray-600 font-black uppercase tracking-widest">No hay datos</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Row 3: Health & Logistics Details */}
                                            <div className={`grid grid-cols-1 md:grid-cols-2 ${settings.enablePerishables ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                                                <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[2.5rem]">
                                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Salud del Inventario</h3>
                                                    <div className="space-y-5">
                                                        {[
                                                            { label: "En Stock / Ilimitado", count: inventoryStatusData.disponible, color: "bg-emerald-500" },
                                                            { label: "Bajo Stock", count: inventoryStatusData.bajoStock, color: "bg-amber-500" },
                                                            { label: "Agotado", count: inventoryStatusData.agotado, color: "bg-rose-500" }
                                                        ].map((s, i) => (
                                                            <div key={i} className="flex flex-col gap-1.5">
                                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                                    <span className="text-gray-400">{s.label}</span>
                                                                    <span className="text-white">{s.count} artículos</span>
                                                                </div>
                                                                <div className="flex gap-1 h-1.5">
                                                                    {Array.from({ length: 12 }).map((_, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className={`flex-1 rounded-full ${idx < Math.round((s.count / (filteredProducts.length || 1)) * 12) ? s.color : 'bg-white/5'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[2.5rem]">
                                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Eficiencia de Reabasto</h3>
                                                    <div className="h-32 flex items-end gap-4 px-4 overflow-hidden">
                                                        {[85, 92, 78, 95, 88].map((v, i) => (
                                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                                <div className="w-full bg-white/5 rounded-t-xl relative group">
                                                                    <div className={`absolute bottom-0 left-0 right-0 bg-indigo-500/30 rounded-t-xl ${i === 3 ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : ''}`} style={{ height: `${v}%` }} />
                                                                    {i === 3 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-indigo-500 tracking-widest">{v}%</span>}
                                                                </div>
                                                                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest shrink-0">{["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"][i]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-6 text-center">Promedio semanal: <span className="text-indigo-500">89.6%</span></p>
                                                </div>

                                                <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[2.5rem]">
                                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">KPIs Logísticos</h3>
                                                    <div className="space-y-5">
                                                        {[
                                                            { label: "Tiempo de Entrega", value: "1.2 días", icon: Clock, color: "text-indigo-400" },
                                                            { label: "Precisión Picking", value: "99.8%", icon: CheckCircle2, color: "text-emerald-400" },
                                                            { label: "Devoluciones", value: "0.4%", icon: RotateCw, color: "text-rose-400" }
                                                        ].map((kpi, i) => (
                                                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                                                <div className="flex items-center gap-3">
                                                                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</span>
                                                                </div>
                                                                <span className="text-[10px] font-black text-white tracking-widest">{kpi.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-8 italic px-2">Cumplimiento del 98% de SLAs</p>
                                                </div>

                                                {settings.enablePerishables && (
                                                    <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full" />
                                                        <div className="flex justify-between items-center mb-6 relative z-10">
                                                            <div>
                                                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Control de Perecibles</h3>
                                                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Ingeniería de Vencimientos</p>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                                <Clock className="w-5 h-5 text-amber-500" />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6 relative z-10">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Críticos</span>
                                                                    <h4 className={`text-2xl font-black tracking-tighter ${perishableStats?.critical > 0 ? 'text-amber-500' : 'text-white'}`}>
                                                                        {perishableStats?.critical || 0}
                                                                    </h4>
                                                                </div>
                                                                <div className="space-y-1 text-right">
                                                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Vencidos</span>
                                                                    <h4 className={`text-2xl font-black tracking-tighter ${perishableStats?.expired > 0 ? 'text-rose-500' : 'text-white'}`}>
                                                                        {perishableStats?.expired || 0}
                                                                    </h4>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3 pt-2">
                                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                                    <span className="text-gray-400">Salud del Lote</span>
                                                                    <span className="text-emerald-500">
                                                                        {perishableStats?.total > 0
                                                                            ? `${Math.round(((perishableStats.total - (perishableStats.critical + perishableStats.expired)) / perishableStats.total) * 100)}%`
                                                                            : '100%'}
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-rose-500"
                                                                        style={{ width: `${(perishableStats?.expired / (perishableStats?.total || 1)) * 100}%` }}
                                                                    />
                                                                    <div
                                                                        className="h-full bg-amber-500"
                                                                        style={{ width: `${(perishableStats?.critical / (perishableStats?.total || 1)) * 100}%` }}
                                                                    />
                                                                    <div
                                                                        className="h-full bg-emerald-500"
                                                                        style={{ width: `${((perishableStats?.total - (perishableStats?.critical + perishableStats?.expired)) / (perishableStats?.total || 1)) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {perishableStats?.critical > 0 && (
                                                                <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between">
                                                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Acción Requerida</span>
                                                                    <button className="text-[8px] font-black text-white hover:text-amber-500 transition-colors uppercase tracking-widest flex items-center gap-1">
                                                                        VER LOTES <ChevronRight className="w-2.5 h-2.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Notification Toast */}
            <AnimatePresence>
                {
                    showToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`fixed bottom-10 left-1/2 -translate-x-1/2 border backdrop-blur-md px-6 py-4 rounded-2xl z-[300] flex items-center gap-3 ${toastType === 'deleted'
                                ? 'bg-red-500/20 border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                                }`}
                        >
                            {toastType === 'deleted' ? <Trash2 className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            <span className="text-sm font-black uppercase tracking-widest">
                                {toastType === 'deleted' ? "Artículo Eliminado" : "Cambios Guardados"}
                            </span>
                        </motion.div>
                    )
                }
            </AnimatePresence>

            {/* Premium Modals Section */}
            {
                typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {showDeleteConfirm.isOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-950 border border-red-500/20 rounded-[2.5rem] p-8 w-full max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center space-y-6 relative overflow-hidden ring-1 ring-white/10">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none" />
                                    <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center relative z-10 text-red-500 mb-4">
                                        <Trash2 className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-2 relative z-10">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                            {showDeleteConfirm.productId === 'bulk' ? `¿Borrar ${selectedProducts.length} Productos?` : '¿Eliminar Producto?'}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed mt-2 text-center">
                                            Esta acción es irreversible y los datos se borrarán permanentemente de los servidores de Blis Corp.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 relative z-10 w-full pt-4 border-t border-white/5">
                                        <button onClick={() => setShowDeleteConfirm({ isOpen: false, productId: -1 })} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black text-gray-300 uppercase tracking-widest transition-all border border-white/5">Cancelar</button>
                                        <button onClick={handleDelete} className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]">Eliminar</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

            {/* Mass Edit Modal */}
            {
                typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {isMassEditing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-[0_0_50px_rgba(255,255,255,0.05)] space-y-8 relative overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                            <Layers className="w-6 h-6 text-blis-red" /> Editar {selectedProducts.length} Productos
                                        </h3>
                                        <button onClick={() => setIsMassEditing(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cambiar Categoría</label>
                                            <select
                                                value={massEditData.category}
                                                onChange={(e) => setMassEditData(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-blis-red appearance-none"
                                            >
                                                <option value="" className="bg-zinc-900">Mantener actual</option>
                                                {categories.filter(c => c !== "Todas").map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cambiar Estado</label>
                                            <select
                                                value={massEditData.status}
                                                onChange={(e) => setMassEditData(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-blis-red appearance-none"
                                            >
                                                <option value="" className="bg-zinc-900">Mantener actual</option>
                                                {statusOptions.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-white/5">
                                        <button onClick={() => setIsMassEditing(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black text-gray-300 uppercase tracking-widest transition-all">Cancelar</button>
                                        <button onClick={handleMassEdit} className="flex-1 py-4 bg-blis-red text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blis-red/20 active:scale-95">Aplicar Cambios</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

            {/* QR/Barcode Scanner/Printer Modal */}
            {
                typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {qrModal.isOpen && (() => {
                            const currentType = qrModal.type === 'default' ? labelSettings.defaultType : qrModal.type;
                            const isHorizontal = labelSettings.layout === 'horizontal';
                            const isBarcode = currentType === 'barcode';

                            // Scannability Minimum Limits (in cm) based on format/type combo
                            const minHeight = isHorizontal
                                ? (isBarcode ? 2.0 : 1.0)
                                : (isBarcode ? 1.5 : 3.0);

                            const userHeight = overrideHeight ?? labelSettings.heightCm;
                            const labelHeight = Math.max(minHeight, userHeight); // Automatic Guard
                            const pxHeight = labelHeight * 37.8;

                            const paperSizes = {
                                A2: { name: 'A2', width: '420mm', height: '594mm', pxW: 1587, pxH: 2245 },
                                A3: { name: 'A3', width: '297mm', height: '420mm', pxW: 1122, pxH: 1587 },
                                A4: { name: 'A4', width: '210mm', height: '297mm', pxW: 794, pxH: 1122 },
                                A5: { name: 'A5', width: '148mm', height: '210mm', pxW: 559, pxH: 794 },
                            };

                            const selectedPaper = paperSizes[paperSize];

                            // Calculate info requirements
                            const hasInfo = (currentType !== 'web-qr') && (labelSettings.showName || labelSettings.showPrice || labelSettings.showSku || labelSettings.showCategory);
                            const infoElementsCount = [labelSettings.showName, labelSettings.showPrice, labelSettings.showSku, labelSettings.showCategory].filter(Boolean).length;

                            // Generate all labels for the sheet
                            const allLabelsInQueue = qrModal.items.flatMap(item =>
                                Array(item.quantity).fill(item.product)
                            );

                            // RESTORED: "Perfect" Proportional Label Width logic
                            // When height increases, width MUST increase proportionally (e.g. 2x, 2.5x)
                            const widthFactor = !hasInfo
                                ? (currentType === 'barcode' ? 1.8 : 1.0)
                                : isHorizontal
                                    ? (infoElementsCount <= 1 ? 1.6 : infoElementsCount === 2 ? 2.0 : 2.8)
                                    : (currentType === 'barcode' ? (1.5 + (4 - infoElementsCount) * 0.15) : (0.80 + (4 - infoElementsCount) * 0.05));

                            const labelWidth = pxHeight * widthFactor;

                            const gap_px = 3.78; // 1mm
                            const sheetW_px = selectedPaper.pxW - (7.56 * 2); // 2mm padding each side
                            const sheetH_px = selectedPaper.pxH - (7.56 * 2);

                            const labelsPerRow = Math.floor(sheetW_px / (labelWidth + gap_px));
                            const labelsPerCol = Math.floor(sheetH_px / (pxHeight + gap_px));
                            const visibleCapacity = (labelsPerRow * labelsPerCol) || 1;

                            return (
                                <motion.div id="print-portal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 print:!static print:!bg-transparent print:!p-0 print:!block print:!h-auto print:!w-auto">
                                    <style>
                                        {`
                                             @media print {
                                                 @page {
                                                     size: ${selectedPaper.width} ${selectedPaper.height};
                                                     margin: 0 !important;
                                                 }
                                                 html, body { 
                                                     margin: 0 !important; 
                                                     padding: 0 !important;
                                                     background: white !important;
                                                     height: auto !important;
                                                     overflow: visible !important;
                                                 }
                                                 body > *:not(#print-portal-overlay) {
                                                     display: none !important;
                                                 }
                                                 #print-portal-overlay {
                                                     position: absolute !important;
                                                     top: 0 !important;
                                                     left: 0 !important;
                                                     width: 100% !important;
                                                     height: auto !important;
                                                     display: block !important;
                                                     background: white !important;
                                                     z-index: 999999 !important;
                                                 }
                                                 #modal-root { display: block !important; }
                                                 .print-sheet { 
                                                     display: flex !important;
                                                     flex-wrap: wrap !important;
                                                     align-content: flex-start !important;
                                                     width: ${selectedPaper.width} !important;
                                                     min-height: ${selectedPaper.height} !important;
                                                     margin: 0 !important;
                                                     padding: 2mm !important;
                                                     background: white !important;
                                                     box-shadow: none !important;
                                                     transform: none !important;
                                                 }
                                             }
                                             body.exporting-png .label-cut-line { background-color: transparent !important; }
                                             body.exporting-png .label-cut-line > div { background-color: transparent !important; }
                                    `}
                                    </style>

                                    <motion.div
                                        initial={{ scale: 0.9, y: 30 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 30 }}
                                        id="modal-root"
                                        className="bg-zinc-950 border border-white/10 w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden print:!static print:!w-full print:!h-auto print:!rounded-none print:!border-none print:!shadow-none print:!bg-transparent print:!block print:!overflow-visible"
                                    >
                                        {/* Header */}
                                        <div className="p-8 border-b border-white/5 flex items-center justify-between print:hidden">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blis-red flex items-center justify-center rounded-xl shadow-lg ring-1 ring-white/20">
                                                    <BarcodeIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">Centro de Impresión Blis</h3>
                                                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Configuración de pliegos y etiquetas</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { setQrModal({ isOpen: false, items: [], type: 'default' }); setOverrideHeight(null); }}
                                                className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 transition-all"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row print:!block print:!overflow-visible">
                                            {/* Configuration Sidebar */}
                                            <div className="w-full md:w-80 border-r border-white/5 p-6 space-y-8 overflow-y-auto print:hidden font-inter">
                                                {/* Code Type Switcher */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Formato de Código</h4>
                                                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                                                        {(['qr', 'barcode', 'web-qr'] as const).map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => setQrModal(prev => ({ ...prev, type }))}
                                                                className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${currentType === type ? 'bg-blis-red text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                                            >
                                                                {type === 'qr' ? 'QR' : type === 'barcode' ? 'BARRAS' : 'WEB'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Label Content Toggles */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Contenido de Etiqueta</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { id: 'showName', label: 'Producto', active: labelSettings.showName },
                                                            { id: 'showSku', label: 'SKU', active: labelSettings.showSku },
                                                            { id: 'showCategory', label: 'Categoría', active: labelSettings.showCategory },
                                                            { id: 'showPrice', label: 'Precio', active: labelSettings.showPrice },
                                                        ].map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => {
                                                                    const key = item.id as any;
                                                                    const val = !labelSettings[key as keyof typeof labelSettings];
                                                                    const activeCount = [labelSettings.showName, labelSettings.showSku, labelSettings.showCategory, labelSettings.showPrice].filter(Boolean).length;
                                                                    if (!val && activeCount <= 1) return;
                                                                    updateLabelSettings({ [key]: val });
                                                                }}
                                                                className={`py-2 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all flex items-center justify-between ${item.active ? 'bg-white/10 border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent border-white/5 text-gray-600 hover:text-gray-400'}`}
                                                            >
                                                                {item.label}
                                                                {item.active && <Check className="w-3 h-3 text-emerald-500" />}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <div className="flex-1 space-y-2">
                                                            <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest px-1">Título</h4>
                                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                                                                <button onClick={() => updateLabelSettings({ titleLines: 1 })} className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${labelSettings.titleLines === 1 ? 'bg-white/20 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>1 Línea</button>
                                                                <button onClick={() => updateLabelSettings({ titleLines: 2 })} className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${labelSettings.titleLines === 2 ? 'bg-white/20 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>2 Líneas</button>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest px-1">Distribución</h4>
                                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                                                                <button onClick={() => updateLabelSettings({ layout: 'vertical' })} className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${labelSettings.layout === 'vertical' ? 'bg-white/20 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Vert.</button>
                                                                <button onClick={() => updateLabelSettings({ layout: 'horizontal' })} className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${labelSettings.layout === 'horizontal' ? 'bg-white/20 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Horiz.</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quantity List */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Cola de Impresión ({qrModal.items.length})</h4>
                                                    <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-2 scrollbar-hide">
                                                        {qrModal.items.map((item, idx) => (
                                                            <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-3 backdrop-blur-md">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-[9px] text-white font-bold truncate uppercase">{item.product.name}</p>
                                                                        <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">{item.product.sku}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => downloadLabelImage(idx, item.product)}
                                                                        className="p-2 bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-500 rounded-lg transition-all"
                                                                    >
                                                                        <Download className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-black/20 rounded-xl p-1 border border-white/5">
                                                                    <button
                                                                        onClick={() => {
                                                                            const newItems = [...qrModal.items];
                                                                            newItems[idx].quantity = Math.max(1, newItems[idx].quantity - 1);
                                                                            setQrModal(prev => ({ ...prev, items: newItems }));
                                                                        }}
                                                                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-[10px]"
                                                                    >-</button>
                                                                    <input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={(e) => {
                                                                            const val = parseInt(e.target.value) || 1;
                                                                            const newItems = [...qrModal.items];
                                                                            newItems[idx].quantity = Math.max(1, val);
                                                                            setQrModal(prev => ({ ...prev, items: newItems }));
                                                                        }}
                                                                        className="bg-transparent text-[10px] font-black text-blis-red w-full text-center outline-none"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            const newItems = [...qrModal.items];
                                                                            newItems[idx].quantity += 1;
                                                                            setQrModal(prev => ({ ...prev, items: newItems }));
                                                                        }}
                                                                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-[10px]"
                                                                    >+</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Layout Format Info */}
                                                <div className="flex gap-2">
                                                    <div className="flex-1 space-y-2">
                                                        <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest px-1">Hoja Impresión</h4>
                                                        <div className="relative">
                                                            <select
                                                                value={paperSize}
                                                                onChange={(e) => setPaperSize(e.target.value as any)}
                                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-0 cursor-pointer py-3 text-[10px] font-black uppercase text-white outline-none focus:border-white/20 transition-all appearance-none text-center backdrop-blur-md"
                                                            >
                                                                <option value="A2" className="bg-zinc-900">A2</option>
                                                                <option value="A3" className="bg-zinc-900">A3</option>
                                                                <option value="A4" className="bg-zinc-900">A4</option>
                                                                <option value="A5" className="bg-zinc-900">A5</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest px-1">Dimensiones Final</h4>
                                                        <div className="w-full flex justify-center items-center px-0 py-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
                                                            <span className="text-[10px] font-black text-white tracking-widest">
                                                                {(labelWidth / 37.8).toFixed(1)} <span className="opacity-50 text-[8px] lowercase mx-0.5">x</span> {(pxHeight / 37.8).toFixed(1)} <span className="text-[8px] text-gray-400 lowercase ml-0.5">cm</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Label Height Slider */}
                                                <div className="space-y-4 pt-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                            Ajustar Altura
                                                            {userHeight < minHeight && <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Min: {minHeight}cm</span>}
                                                        </h4>
                                                        <span className="text-[9px] font-black text-blis-red uppercase">{(pxHeight / 37.8).toFixed(1)} cm</span>
                                                    </div>
                                                    <input
                                                        type="range" min={minHeight} max="10" step="0.5"
                                                        value={labelHeight}
                                                        onChange={(e) => setOverrideHeight(parseFloat(e.target.value))}
                                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blis-red"
                                                    />
                                                </div>

                                                {/* Print Buttons Container */}
                                                <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                                                    <button
                                                        onClick={() => window.print()}
                                                        className="w-full py-4 bg-blis-red text-white rounded-2xl font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-all shadow-[0_15px_35px_rgba(239,68,68,0.25)] active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" /> IMPRIMIR (PDF)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Preview Area */}
                                            <div className="flex-1 bg-zinc-950 overflow-auto relative p-16 flex justify-start items-start print:p-0 print:bg-white print:!block print:!overflow-visible min-h-0 scrollbar-hide">
                                                {/* Zoom Controller Overlay - Fixed in viewport */}
                                                <div id="zoom-overlay" className="fixed bottom-12 right-12 z-[5000] bg-black/90 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 flex items-center gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] print:hidden transition-all hover:scale-105 active:scale-95 group ring-1 ring-white/10">
                                                    <div className="flex flex-col gap-1 pr-2 border-r border-white/10">
                                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">Zoom</span>
                                                        <span className="text-sm font-black text-blis-red leading-none">{Math.round(zoom * 100)}%</span>
                                                    </div>
                                                    <input
                                                        type="range" min="0.1" max="1.5" step="0.01"
                                                        value={zoom}
                                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                                        className="w-48 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blis-red hover:accent-red-500 transition-all"
                                                    />
                                                </div>

                                                {/* Rulers and Sheet Container */}
                                                <div className="relative inline-block print:!static print:!m-0 print:!p-0 print:!block print:!transform-none" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                                                    {/* Horizontal Ruler (marks every 5mm, labels every 10mm) */}
                                                    <div className="ruler absolute -top-14 left-0 right-0 h-10 flex border-b-2 border-white/20 bg-zinc-950/80 backdrop-blur-md print:hidden overflow-hidden">
                                                        {Array.from({ length: 140 }).map((_, i) => (
                                                            <div key={i} className={`shrink-0 border-l border-white/${i % 2 === 0 ? '40' : '10'} ${i % 2 === 0 ? 'h-full' : 'h-5'} relative`} style={{ width: '5mm' }}>
                                                                {i % 2 === 0 && <span className="absolute left-1.5 top-1.5 text-[10px] text-white/50 font-black">{i / 2}<span className="text-[7px] ml-0.5 opacity-40">cm</span></span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Vertical Ruler (marks every 5mm, labels every 10mm) */}
                                                    <div className="ruler absolute top-0 -left-14 bottom-0 w-10 border-r-2 border-white/20 bg-zinc-950/80 backdrop-blur-md print:hidden overflow-hidden flex flex-col">
                                                        {Array.from({ length: 180 }).map((_, i) => (
                                                            <div key={i} className={`shrink-0 border-t border-white/${i % 2 === 0 ? '40' : '10'} ${i % 2 === 0 ? 'w-full' : 'w-5'} relative`} style={{ height: '5mm' }}>
                                                                {i % 2 === 0 && <span className="absolute top-1.5 left-1 text-[10px] text-white/50 font-black -rotate-90 origin-top-left translate-y-2">{i / 2}<span className="text-[7px] ml-0.5 opacity-40">cm</span></span>}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div
                                                        className="print-sheet shadow-[0_0_120px_rgba(0,0,0,0.8)] transition-all duration-300 ring-1 ring-white/10"
                                                        style={{
                                                            width: selectedPaper.width,
                                                            height: selectedPaper.height,
                                                            minHeight: selectedPaper.height,
                                                            background: 'white',
                                                            padding: '2mm',
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: '1mm',
                                                            alignContent: 'flex-start',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    >
                                                        {(() => {
                                                            return allLabelsInQueue.slice(0, visibleCapacity).map((product, pIdx) => {
                                                                const isUltraMicro = labelHeight <= 2.2;
                                                                const isMicro = labelHeight < 3.2;
                                                                const isMacro = labelHeight >= 3.8;
                                                                const isMega = labelHeight >= 5.2;
                                                                const showDecoration = !isUltraMicro;

                                                                // NEW: Dynamic Multiplier Engine (Perfect Fluid Sizing)
                                                                const RENDER_SCALE = 4; // Anti-Browser-Limit Engine: render at 4x and scale down
                                                                const physicalW_cm = (labelWidth / 37.8) * RENDER_SCALE;
                                                                const physicalH_cm = labelHeight * RENDER_SCALE;

                                                                const isBarcode = currentType === 'barcode';

                                                                // Container Fractions (Crucial for proper height allocation)
                                                                const baseCodeFraction = isHorizontal
                                                                    ? (isBarcode ? 0.40 : Math.min(0.50, (1 / widthFactor) * 1.1)) // Only enough to form a square
                                                                    : (isBarcode ? 0.50 : 0.75); // Vertical: QR takes an enormous 75% baseline

                                                                // Dynamically give code more space if text elements are hidden
                                                                const codeFraction = (!isHorizontal && hasInfo)
                                                                    ? Math.min(isBarcode ? 0.70 : 0.90, baseCodeFraction + (4 - infoElementsCount) * 0.05)
                                                                    : baseCodeFraction;

                                                                const textH_cm = isHorizontal ? physicalH_cm : physicalH_cm * (1 - codeFraction);
                                                                const textW_cm = isHorizontal ? physicalW_cm * (1 - codeFraction) : physicalW_cm;

                                                                let totalWeight = 0.3; // base padding and gap overhead
                                                                if (labelSettings.showCategory) totalWeight += 0.5;
                                                                if (labelSettings.showName) totalWeight += (labelSettings.titleLines === 1 ? 0.9 : 1.6);
                                                                if (labelSettings.showSku) totalWeight += 0.5;
                                                                if (labelSettings.showPrice) totalWeight += 1.4;
                                                                totalWeight = Math.max(totalWeight, 1); // safe divisor

                                                                // Limit factors to leave realistic padding
                                                                const useableH = textH_cm * 0.95; // Allow text to grow up to 95% of available space
                                                                const useableW = textW_cm * 0.95;

                                                                const fitFactorH = useableH / totalWeight;
                                                                // For Vertical QR, relax the width limiter so fonts scale up and stick to the blanks
                                                                const widthDivisor = isHorizontal ? 9.2 : (isBarcode ? 12 : 10.5);
                                                                const fitFactorW = useableW / widthDivisor;
                                                                const fitFactor = Math.min(fitFactorH, fitFactorW);

                                                                const toPx = (cmVal: number) => `${(cmVal * 37.8).toFixed(2)}px`;

                                                                const fStyles = {
                                                                    category: { fontSize: toPx(fitFactor * 0.7), lineHeight: 1.1, color: '#000' },
                                                                    name: { fontSize: toPx(fitFactor * (labelSettings.titleLines === 1 ? 0.98 : 0.82)), lineHeight: 1.1, color: '#000' },
                                                                    sku: { fontSize: toPx(fitFactor * 0.7), lineHeight: 1.1, color: '#000' },
                                                                    price: { fontSize: toPx(fitFactor * 1.5), lineHeight: 0.95, color: '#000' },
                                                                    origPrice: { fontSize: toPx(fitFactor * 0.8), lineHeight: 1.1, color: '#000' },
                                                                    container: { padding: toPx(Math.min(textH_cm, textW_cm) * 0.08), gap: toPx(fitFactor * 0.15) }
                                                                };

                                                                // Full-width Barcode dimensions calculation (Calculated against container physical pixels)
                                                                const barcodeWidthMultiplier = Math.max(0.5, isHorizontal
                                                                    ? (physicalW_cm * codeFraction * 37.8) / 115
                                                                    : (physicalW_cm * 37.8) / 115
                                                                );
                                                                const barcodeHeightPixels = Math.max(10, isHorizontal
                                                                    ? physicalH_cm * 10
                                                                    : (physicalH_cm * codeFraction * 37.8) * 0.8
                                                                );

                                                                return (
                                                                    <div
                                                                        key={pIdx}
                                                                        className={`label-cut-line label-item-${qrModal.items.findIndex(it => it.product.id === product.id)} bg-white overflow-hidden border border-dashed border-gray-400 print:!border-gray-300 relative`}
                                                                        style={{
                                                                            height: `${(labelHeight * 10).toFixed(2)}mm`,
                                                                            width: `${(labelWidth / 3.78).toFixed(2)}mm`,
                                                                            boxSizing: 'border-box'
                                                                        }}
                                                                    >
                                                                        <div style={{
                                                                            width: `${100 * RENDER_SCALE}%`,
                                                                            height: `${100 * RENDER_SCALE}%`,
                                                                            transform: `scale(${1 / RENDER_SCALE})`,
                                                                            transformOrigin: 'top left',
                                                                            display: 'flex',
                                                                            flexDirection: isHorizontal ? 'row' : 'column',
                                                                            boxSizing: 'border-box',
                                                                            flexShrink: 0
                                                                        }}>
                                                                            {/* Code Section */}
                                                                            <div
                                                                                className={`flex items-center justify-center bg-transparent overflow-hidden ${isHorizontal ? (hasInfo ? 'border-r border-gray-200' : '') : (hasInfo ? 'border-b border-gray-200' : '')}`}
                                                                                style={hasInfo
                                                                                    ? (isHorizontal ? { width: `${codeFraction * 100}%`, height: '100%', padding: toPx(Math.min(physicalH_cm, physicalW_cm) * 0.02) }
                                                                                        : { width: '100%', height: `${codeFraction * 100}%`, padding: toPx(Math.min(physicalH_cm, physicalW_cm) * 0.02) })
                                                                                    : { width: '100%', height: '100%', padding: toPx(Math.min(physicalH_cm, physicalW_cm) * 0.02) }
                                                                                }
                                                                            >
                                                                                {currentType === 'qr' || currentType === 'web-qr' ? (
                                                                                    <QRCodeSVG
                                                                                        value={currentType === 'web-qr' ? `https://bliscorp.com/shop/product/${product.id}` : product.sku}
                                                                                        style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}
                                                                                        level="H"
                                                                                        marginSize={0}
                                                                                        bgColor="transparent"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="flex items-center justify-center w-full h-full max-w-full max-h-full">
                                                                                        <Barcode
                                                                                            value={product.sku}
                                                                                            width={barcodeWidthMultiplier}
                                                                                            height={barcodeHeightPixels}
                                                                                            displayValue={false}
                                                                                            background="transparent"
                                                                                            margin={0}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {/* Info Section */}
                                                                            {hasInfo && (
                                                                                <div style={fStyles.container} className={`flex flex-col justify-center ${isHorizontal ? 'text-left items-start' : 'text-center items-center'} flex-1 overflow-hidden min-w-0`}>
                                                                                    {labelSettings.showCategory && (
                                                                                        <p style={fStyles.category} className="font-black text-black uppercase tracking-widest m-0 flex-shrink-0">{product.category}</p>
                                                                                    )}
                                                                                    {labelSettings.showName && (
                                                                                        <h4 style={fStyles.name} className={`text-black font-black uppercase tracking-tight m-0 ${labelSettings.titleLines === 1 ? 'line-clamp-1' : 'line-clamp-2'} flex-shrink-0`}>{product.name}</h4>
                                                                                    )}
                                                                                    {(labelSettings.showSku || labelSettings.showPrice) && (
                                                                                        <div className="flex flex-col gap-[0.1em] leading-tight flex-shrink-0" style={{ alignItems: isHorizontal ? 'flex-start' : 'center' }}>
                                                                                            {labelSettings.showSku && (
                                                                                                <span style={fStyles.sku} className="font-black text-black uppercase tracking-widest">{product.sku}</span>
                                                                                            )}
                                                                                            {labelSettings.showPrice && (
                                                                                                <div className="flex items-center gap-[0.5em] leading-none pt-[0.2em]">
                                                                                                    {(product.originalPrice > product.price) && (
                                                                                                        <span style={fStyles.origPrice} className="text-black line-through font-bold">{selectedCurrency.symbol}{product.originalPrice?.toFixed(1)}</span>
                                                                                                    )}
                                                                                                    <span style={fStyles.price} className="font-black text-black">{selectedCurrency.symbol}{product.price?.toFixed(2)}</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>,
                    document.body
                )
            }
        </>
    );
}
