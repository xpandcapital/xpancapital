/** 
 * ApiSunat Integration Library for Blis Corp
 * Based on: https://docs.apisunat.pe/integracion/facturacion-electronica/factura/factura-simple
 */

export interface ApiSunatItem {
    unidad_de_medida: string; // 'NIU' for products, 'ZZ' for services
    descripcion: string;
    cantidad: string;
    valor_unitario: string;
    precio_unitario?: string;
    porcentaje_igv: string;
    codigo_tipo_afectacion_igv: string; // '10' for gravado, '20' for exonerado, etc.
    nombre_tributo: string; // 'IGV'
}

export interface ApiSunatDocument {
    documento: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
    serie: string;
    numero: number;
    fecha_de_emision: string;
    moneda: 'PEN' | 'USD';
    tipo_operacion: string; // '0101'
    cliente_tipo_de_documento: '1' | '6' | '0'; // 1=DNI, 6=RUC, 0=DOC.TRIB.NO.DOM.SIN.RUC
    cliente_numero_de_documento: string;
    cliente_denominacion: string;
    cliente_direccion?: string;
    items: ApiSunatItem[];
    total: string;
}

/**
 * Maps our CartItem to ApiSunatItem
 * Assuming prices are INCLUSIVE of IGV (18%)
 */
export const mapCartToApiSunatItems = (items: any[]): ApiSunatItem[] => {
    return items.map(item => {
        const totalItemPrice = item.price; // Inclusive
        const valorUnitario = totalItemPrice / 1.18; // Base

        return {
            unidad_de_medida: item.category === 'cursos' ? 'ZZ' : 'NIU',
            descripcion: item.name,
            cantidad: item.quantity.toString(),
            valor_unitario: valorUnitario.toFixed(6),
            porcentaje_igv: "18",
            codigo_tipo_afectacion_igv: "10",
            nombre_tributo: "IGV"
        };
    });
};

/**
 * Sends the document to SUNAT via our proxy
 */
export const sendToApiSunat = async (doc: ApiSunatDocument, token: string, env: 'sandbox' | 'app' = 'sandbox') => {
    const baseUrl = env === 'sandbox' ? 'https://sandbox.apisunat.pe' : 'https://app.apisunat.pe';

    try {
        const response = await fetch(`${baseUrl}/api/v3/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doc)
        });

        return await response.json();
    } catch (error) {
        return { success: false, message: 'Error de red al conectar con ApiSunat' };
    }
};
