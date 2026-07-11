"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, History,
    CheckCircle2, ClipboardList,
    ArrowRightLeft
} from 'lucide-react';
import { usePOS } from './_hooks';
import { stripHtml } from '@/lib/strip-html';
import { SearchBar } from './SearchBar';
import { ProductGrid } from './ProductGrid';
import { CartPanel } from './CartPanel';
import { CheckoutModal } from './CheckoutModal';
import { mapCartToEcuadorInvoice } from '@/lib/ecuador-apis';
import { CartItem, Transaction } from '@/context/SalesContext';

export const POSManager = () => {
    const pos = usePOS();

    if ('error' in pos) {
        return <div className="p-10 text-center font-black uppercase text-blis-red">Error: {pos.error}</div>;
    }

    const {
        cart, addToCart, removeFromCart, updateQuantity, updateItemDiscount,
        total, subtotal, tax,
        customer, setCustomer, transactionType, setTransactionType,
        documentType, setDocumentType, history, saveTransaction, loadQuote,
        currency, taxName, taxRate, country,
        searchQuery, setSearchQuery, filteredSearchProducts,
        isCheckoutOpen, setIsCheckoutOpen, view, setView,
        dniSearch, setDniSearch, isSearchingCustomer,
        isCustomerExpanded, setIsCustomerExpanded,
        repDniSearch, setRepDniSearch, isSearchingRep,
        paymentMethod, setPaymentMethod,
        receivedAmount, setReceivedAmount,
        isIssuingInvoice, setIsIssuingInvoice,
        invoiceResult, setInvoiceResult,
        emitElectronicInvoice, setEmitElectronicInvoice,
        handleQuickAdd, handleCustomerSearch,
        handleForceRefreshCustomer, handleRepSearch,
        updateCustomerFields, searchRef, docLabels, products,
        globalDiscountAmount, setGlobalDiscountAmount,
        globalDiscountType, setGlobalDiscountType,
        couponCode, setCouponCode, shippingCost, setShippingCost,
    } = pos as any;

    const handleFinalize = async () => {
        if (total <= 0) { alert('El total debe ser mayor a 0'); return; }
        if (receivedAmount && parseFloat(receivedAmount) < total) { alert('Monto insuficiente'); return; }

        if (emitElectronicInvoice) {
            setIsIssuingInvoice(true);
            if (country === 'PE') {
                const token = localStorage.getItem('apisunat_token');
                const env = localStorage.getItem('apisunat_env') || 'sandbox';
                if (!token) { alert('Falta Token'); setIsIssuingInvoice(false); return; }
                const mappedItems = (cart || []).map((item: CartItem) => ({ unidad_de_medida: item.category === 'cursos' ? 'ZZ' : 'NIU', descripcion: item.name, cantidad: item.quantity.toString(), valor_unitario: (item.price / (1 + (taxRate / 100))).toFixed(6), porcentaje_igv: taxRate.toString(), codigo_tipo_afectacion_igv: "10", nombre_tributo: taxName }));
                const sunatDoc = { documento: documentType, serie: documentType === 'factura' ? (localStorage.getItem('apisunat_serie_f') || 'F001') : (localStorage.getItem('apisunat_serie_b') || 'B001'), numero: Math.floor(Math.random() * 9999), fecha_de_emision: new Date().toISOString().split('T')[0], cliente_tipo_de_documento: documentType === 'factura' ? '6' : '1', cliente_numero_de_documento: customer?.id || "00000000", cliente_denominacion: customer?.name || "CLIENTE GENERAL", items: mappedItems, total: (total || 0).toFixed(2) };
                try {
                    const res = await fetch('/api/issue-invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document: sunatDoc, token, env }) });
                    if (res.ok) alert('✅ SUNAT OK'); else alert('❌ Error SUNAT');
                } catch (e) {}
            } else if (country === 'EC') {
                const token = localStorage.getItem('apiconsult_token');
                const env = localStorage.getItem('apiconsult_env') || 'pruebas';
                const p12 = localStorage.getItem('apiconsult_p12_base64');
                const password = localStorage.getItem('apiconsult_p12');
                if (!token || !p12) { alert('Faltan credenciales EC'); setIsIssuingInvoice(false); return; }
                const ecuadorDoc = mapCartToEcuadorInvoice(cart, customer, total, subtotal, tax, taxRate, { env, ruc: localStorage.getItem('blis_store_ruc'), razonSocial: localStorage.getItem('blis_store_name'), address: localStorage.getItem('blis_store_address') });
                try {
                    const res = await fetch('/api/ecuador-api', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-apiconsult-token': token }, body: JSON.stringify({ p12, password, env: env === 'produccion' ? '2' : '1', comprobante: ecuadorDoc }) });
                    const result = await res.json();
                    if (res.ok) { setInvoiceResult({ success: true, msg: 'SRI Aprobado', detail: result.claveAcceso || result.authorizationCode }); saveTransaction(); return; }
                } catch (e) {}
            }
            setIsIssuingInvoice(false);
        }
        saveTransaction();
        setInvoiceResult({ success: true, msg: 'Venta registrada.' });
        setReceivedAmount('');
        setEmitElectronicInvoice(false);
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row lg:h-full flex-1 w-full lg:overflow-hidden bg-black text-white font-sans">
                <div className="w-full lg:flex-1 flex flex-col border-r border-white/5 lg:overflow-hidden h-auto lg:h-full">
                    <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/5 bg-zinc-950/20">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Terminal Activa</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('pos')}
                                className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-3 ${view === 'pos' ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Terminal</span>
                            </button>
                            <button
                                onClick={() => setView('history')}
                                className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-3 ${view === 'history' ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
                            >
                                <History className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Reportes</span>
                            </button>
                        </div>
                    </div>

                    {view === 'pos' ? (
                        <div className="lg:flex-1 flex flex-col p-4 lg:p-6 space-y-4 lg:space-y-6 lg:overflow-hidden h-auto lg:h-full">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex bg-zinc-900/50 p-1 rounded-xl lg:rounded-2xl border border-white/5 h-10 lg:h-14">
                                    <button
                                        onClick={() => setTransactionType('venta')}
                                        className={`px-4 lg:px-8 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${transactionType === 'venta' ? 'bg-zinc-800 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        VENTA
                                    </button>
                                    <button
                                        onClick={() => setTransactionType('cotizacion')}
                                        className={`px-4 lg:px-8 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${transactionType === 'cotizacion' ? 'bg-zinc-800 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        COTIZA
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    {['ticket', 'boleta', 'factura'].map(doc => (
                                        <button
                                            key={doc}
                                            onClick={() => setDocumentType(doc as any)}
                                            className={`px-3 lg:px-6 py-2 lg:py-4 rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest border transition-all ${documentType === doc
                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                                : 'bg-zinc-900/50 border-white/5 text-gray-500 hover:border-white/20'}`}
                                        >
                                            {doc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <SearchBar
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                filteredSearchProducts={filteredSearchProducts}
                                handleQuickAdd={handleQuickAdd}
                                currency={currency}
                                searchRef={searchRef}
                                transactionType={transactionType}
                                total={total}
                            />

                            <ProductGrid
                                cart={cart}
                                updateQuantity={updateQuantity}
                                updateItemDiscount={updateItemDiscount}
                                removeFromCart={removeFromCart}
                                currency={currency}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col p-8 space-y-8 overflow-y-auto">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Historial de Actividad</h2>
                            <div className="space-y-4">
                                {(history || []).map((tx: Transaction) => (
                                    <div key={tx.id} className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-zinc-900/50 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'venta' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {tx.type === 'venta' ? <CheckCircle2 className="w-7 h-7" /> : <ClipboardList className="w-7 h-7" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">{(tx.date || "").split('T')[0]} - {tx.id}</div>
                                                <div className="text-lg font-black uppercase tracking-tighter">{stripHtml(tx.customer?.name) || 'Venta de Pasillo'}</div>
                                                <div className="flex gap-4 mt-1">
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${tx.type === 'venta' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>{tx.type}</span>
                                                    <span className="text-[9px] font-black uppercase border border-white/10 px-3 py-1 rounded-full text-gray-400">{tx.docType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black mb-2">{currency}{(tx.total || 0).toLocaleString()}</div>
                                            {tx.type === 'cotizacion' && (
                                                <button
                                                    onClick={() => {
                                                        loadQuote(tx.id);
                                                        setView('pos');
                                                    }}
                                                    className="text-[10px] font-black text-blis-red uppercase tracking-widest hover:underline flex items-center gap-2"
                                                >
                                                    CONVERTIR A VENTA <ArrowRightLeft className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <CartPanel
                    customer={customer}
                    country={country}
                    docLabels={docLabels}
                    dniSearch={dniSearch}
                    setDniSearch={setDniSearch}
                    isSearchingCustomer={isSearchingCustomer}
                    isCustomerExpanded={isCustomerExpanded}
                    setIsCustomerExpanded={setIsCustomerExpanded}
                    repDniSearch={repDniSearch}
                    setRepDniSearch={setRepDniSearch}
                    isSearchingRep={isSearchingRep}
                    handleCustomerSearch={handleCustomerSearch}
                    handleForceRefreshCustomer={handleForceRefreshCustomer}
                    handleRepSearch={handleRepSearch}
                    updateCustomerFields={updateCustomerFields}
                    setCustomer={setCustomer}
                    cart={cart}
                    total={total}
                    subtotal={subtotal}
                    tax={tax}
                    currency={currency}
                    taxName={taxName}
                    taxRate={taxRate}
                    transactionType={transactionType}
                    documentType={documentType}
                    globalDiscountAmount={globalDiscountAmount}
                    setGlobalDiscountAmount={setGlobalDiscountAmount}
                    globalDiscountType={globalDiscountType}
                    setGlobalDiscountType={setGlobalDiscountType}
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    shippingCost={shippingCost}
                    setShippingCost={setShippingCost}
                    saveTransaction={saveTransaction}
                    preCheckout={() => setIsCheckoutOpen(true)}
                    products={products}
                    handleQuickAdd={handleQuickAdd}
                />
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                customer={customer}
                total={total}
                documentType={documentType}
                currency={currency}
                country={country}
                taxRate={taxRate}
                cart={cart}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                receivedAmount={receivedAmount}
                setReceivedAmount={setReceivedAmount}
                isIssuingInvoice={isIssuingInvoice}
                emitElectronicInvoice={emitElectronicInvoice}
                setEmitElectronicInvoice={setEmitElectronicInvoice}
                invoiceResult={invoiceResult}
                setInvoiceResult={setInvoiceResult}
                onFinalize={handleFinalize}
            />

            <div className="hidden print:block fixed inset-0 bg-white font-mono text-black text-[10px] p-4 leading-relaxed tracking-tight z-[9999999] overflow-visible break-inside-avoid">
                <div className="w-[80mm] mx-auto break-inside-avoid">
                    <div className="text-center font-black mb-1 leading-none text-xl">{typeof window !== 'undefined' ? stripHtml(localStorage.getItem('blis_store_name')) || 'Xpand Capital' : 'Xpand Capital'}</div>
                    <div className="text-center text-[7px] mb-0.5 leading-none">RUC: {typeof window !== 'undefined' ? stripHtml(localStorage.getItem('blis_store_ruc')) || '20000000001' : '20000000001'}</div>
                    <div className="text-center text-[7px] mb-2 leading-tight uppercase max-w-[80%] mx-auto">{typeof window !== 'undefined' ? stripHtml(localStorage.getItem('blis_store_address')) || 'LIMA - PERÚ' : 'LIMA - PERÚ'}</div>
                    <div className="border-t border-dashed border-black my-2"></div>
                    <div className="text-center font-black text-sm uppercase leading-none tracking-widest">{docLabels.ruc} / {docLabels.dni} - ELECTRÓNICA</div>
                    <div className="text-center text-[8px] mt-0.5 leading-none">{documentType === 'factura' ? 'FACTURA' : (documentType === 'boleta' ? 'BOLETA' : 'TICKET COMPROBANTE')}</div>
                    <div className="border-t border-dashed border-black my-2"></div>

                    <div className="space-y-0.5 mt-2">
                        <div className="flex justify-between">
                            <span className="font-bold">FECHA:</span>
                            <span>{new Date().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">CLIENTE:</span>
                            <span className="text-right ml-2 line-clamp-1">{stripHtml(customer?.name) || 'Venta General'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">{(customer?.id?.length || 0) > 8 ? docLabels.ruc : docLabels.dni}:</span>
                            <span>{customer?.id || '00000000'}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-black my-2"></div>

                    <div className="text-[9px] mb-1 font-bold">DESCRIPCIÓN</div>
                    <div className="space-y-2 mt-1">
                        {(cart || []).map((item: CartItem, idx: number) => (
                            <div key={idx} className="flex justify-between items-start leading-tight">
                                <div className="flex-1 pr-2">
                                    <div className="font-bold uppercase break-words line-clamp-2">{stripHtml(item.name)}</div>
                                    <div className="text-[8px] text-gray-500">
                                        {item.quantity} x {currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        {item.discount && item.discount > 0 && ` (-${item.discount}${item.discountType === 'percent' ? '%' : ''})`}
                                    </div>
                                </div>
                                <div className="text-right shrink-0 mt-0.5 font-bold">
                                    {currency}{((item.price * item.quantity) - (item.discountType === 'percent' ? (item.price * item.quantity * (item.discount || 0) / 100) : (item.discount || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-black my-2"></div>

                    <div className="space-y-1 mt-2 text-[10px]">
                        <div className="flex justify-between">
                            <span>SUBTOTAL:</span>
                            <span>{currency}{(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{taxName || 'IGV'} ({taxRate || 18}%):</span>
                            <span>{currency}{(tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {globalDiscountAmount > 0 && (
                            <div className="flex justify-between font-bold">
                                <span>DESCUENTO:</span>
                                <span>-{currency}{(globalDiscountType === 'percent' ? (subtotal * (1 + taxRate / 100) * globalDiscountAmount / 100) : globalDiscountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-black text-sm pt-1 mt-1 border-t border-black">
                            <span>TOTAL:</span>
                            <span>{currency}{(total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {receivedAmount && parseFloat(receivedAmount) > 0 && (
                            <>
                                <div className="flex justify-between text-[9px] mt-1 pt-1 border-t border-dashed border-black">
                                    <span>RECIBIDO:</span>
                                    <span>{currency}{parseFloat(receivedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                    <span>CAMBIO:</span>
                                    <span>{currency}{Math.max(0, parseFloat(receivedAmount) - (total || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="text-center mt-6 text-[8px] font-bold">
                        <div>GRACIAS POR TU COMPRA</div>
                        <div className="mt-1">Generado por Xpand Capital</div>
                    </div>
                </div>
            </div>
        </>
    );
};

