/** 
 * Ecuador SRI Integration via ApiConsult (Zampisoft)
 */

export interface EcuadorInvoiceDetail {
    codigoPrincipal: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    precioTotalSinImpuesto: number;
    impuestos: {
        codigo: string; // 2 for IVA
        codigoPorcentaje: string; // 2 for 12%, 3 for 14%, 4 for 15%, 0 for 0%
        tarifa: number;
        baseImponible: number;
        valor: number;
    }[];
}

export interface EcuadorInvoice {
    infoTributaria: {
        ambiente: string; // '1' pruebas, '2' produccion
        tipoEmision: string; // '1' normal
        razonSocial: string;
        nombreComercial?: string;
        ruc: string;
        codDoc: string; // '01' Factura, '04' Nota Credito, '06' Guia Remision, '07' Comprobante Retencion
        estab: string;
        ptoEmi: string;
        secuencial: string;
        dirMatriz: string;
    };
    infoFactura: {
        fechaEmision: string;
        dirEstablecimiento?: string;
        obligadoContabilidad: string; // 'SI' / 'NO'
        tipoIdentificacionComprador: string; // '04' RUC, '05' Cedula, '06' Pasaporte, '07' Consumidor Final, '08' ID Exterior
        razonSocialComprador: string;
        identificacionComprador: string;
        direccionComprador?: string;
        totalSinImpuestos: number;
        totalDescuento: number;
        totalConImpuestos: {
            codigo: string;
            codigoPorcentaje: string;
            baseImponible: number;
            valor: number;
        }[];
        propina: number;
        importeTotal: number;
        moneda: string; // 'DOLAR'
        pagos: {
            formaPago: string; // '01' Sin utilizacion del sistema financiero, '20' Otros con utilizacion del sistema financiero
            total: number;
        }[];
    };
    detalles: EcuadorInvoiceDetail[];
}

export const mapCartToEcuadorInvoice = (
    cart: any[],
    customer: any,
    total: number,
    subtotal: number,
    tax: number,
    taxRate: number,
    issuerData: any
): EcuadorInvoice => {
    
    // Mapping identification type for Ecuador
    let idType = '05'; // Default Cédula
    if (customer?.id?.length === 13) idType = '04'; // RUC
    if (customer?.id === '9999999999999') idType = '07'; // Consumidor Final

    const vatCode = taxRate === 15 ? '4' : (taxRate === 0 ? '0' : '2'); // Simple mapping

    const detalles: EcuadorInvoiceDetail[] = cart.map(item => {
        const itemSubtotal = (item.price * item.quantity) / (1 + (taxRate / 100));
        const itemTax = (item.price * item.quantity) - itemSubtotal;
        
        return {
            codigoPrincipal: item.sku || item.id.substring(0, 8),
            descripcion: item.name,
            cantidad: item.quantity,
            precioUnitario: item.price / (1 + (taxRate / 100)),
            descuento: 0,
            precioTotalSinImpuesto: itemSubtotal,
            impuestos: [{
                codigo: '2',
                codigoPorcentaje: vatCode,
                tarifa: taxRate,
                baseImponible: itemSubtotal,
                valor: itemTax
            }]
        };
    });

    return {
        infoTributaria: {
            ambiente: issuerData.env === 'produccion' ? '2' : '1',
            tipoEmision: '1',
            razonSocial: issuerData.razonSocial || 'BLIS CORP ECUADOR S.A.S.',
            ruc: issuerData.ruc || '1790000000001',
            codDoc: '01',
            estab: issuerData.estab || '001',
            ptoEmi: issuerData.ptoEmi || '001',
            secuencial: Math.floor(Math.random() * 999999999).toString().padStart(9, '0'),
            dirMatriz: issuerData.address || 'Quito, Ecuador'
        },
        infoFactura: {
            fechaEmision: new Date().toLocaleDateString('es-EC').replace(/\//g, '-'),
            obligadoContabilidad: 'NO',
            tipoIdentificacionComprador: idType,
            razonSocialComprador: customer?.name || 'CONSUMIDOR FINAL',
            identificacionComprador: customer?.id || '9999999999999',
            direccionComprador: customer?.address || 'Quito',
            totalSinImpuestos: parseFloat(subtotal.toFixed(2)),
            totalDescuento: 0,
            totalConImpuestos: [{
                codigo: '2',
                codigoPorcentaje: vatCode,
                baseImponible: parseFloat(subtotal.toFixed(2)),
                valor: parseFloat(tax.toFixed(2))
            }],
            propina: 0,
            importeTotal: parseFloat(total.toFixed(2)),
            moneda: 'DOLAR',
            pagos: [{
                formaPago: '20',
                total: parseFloat(total.toFixed(2))
            }]
        },
        detalles
    };
};
