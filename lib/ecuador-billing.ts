// Types ────────────────────────────────────────────────────────────────────────
export interface CartItemBilling {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
}

export interface CustomerBilling {
  id?: string | null;
  name?: string | null;
  address?: string | null;
}

export interface IssuerData {
  env: 'pruebas' | 'produccion';
  razonSocial?: string;
  ruc?: string;
  estab?: string;
  ptoEmi?: string;
  address?: string;
}

export interface EcuadorInvoiceDetail {
  codigoPrincipal: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  precioTotalSinImpuesto: number;
  impuestos: {
    codigo: string;
    codigoPorcentaje: string;
    tarifa: number;
    baseImponible: number;
    valor: number;
  }[];
}

export interface EcuadorInvoice {
  infoTributaria: {
    ambiente: string;
    tipoEmision: string;
    razonSocial: string;
    nombreComercial?: string;
    ruc: string;
    codDoc: string;
    estab: string;
    ptoEmi: string;
    secuencial: string;
    dirMatriz: string;
  };
  infoFactura: {
    fechaEmision: string;
    dirEstablecimiento?: string;
    obligadoContabilidad: string;
    tipoIdentificacionComprador: string;
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
    moneda: string;
    pagos: {
      formaPago: string;
      total: number;
    }[];
  };
  detalles: EcuadorInvoiceDetail[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

export const mapCartToEcuadorInvoice = (
  cart: CartItemBilling[],
  customer: CustomerBilling,
  total: number,
  subtotal: number,
  tax: number,
  taxRate: number,
  issuerData: IssuerData
): EcuadorInvoice => {

  let idType = '05';
  if (customer?.id?.length === 13) idType = '04';
  if (customer?.id === '9999999999999') idType = '07';

  const vatCode = taxRate === 15 ? '4' : (taxRate === 0 ? '0' : '2');

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
