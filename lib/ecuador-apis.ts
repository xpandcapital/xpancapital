/**
 * Ecuador APIs Utility (ApiConsult / ZampiSoft)
 * Captures ALL available fields from the API for Cédula and RUC lookups.
 */

// Driver's license record
export interface LicenciaConducir {
    tipo?: string;          // B, C, etc.
    numero?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    puntos?: number;
    estado?: string;
    infracciones?: Array<{
        fecha?: string;
        tipo?: string;
        descripcion?: string;
        multa?: string;
        estado?: string;
    }>;
}

export interface EcuadorCustomerData {
    success: boolean;
    name: string;
    id: string; // Cédula o RUC
    type: 'natural' | 'juridica';
    message?: string;

    // — Dirección —
    address?: string;           // calleDomicilio + numeracionDomicilio
    houseNumber?: string;       // numeracionDomicilio
    department?: string;        // Provincia
    province?: string;          // Cantón
    district?: string;          // Parroquia
    birthPlace?: string;        // lugarNacimiento

    // — Biográfico —
    birthDate?: string;
    gender?: string;            // HOMBRE / MUJER
    nationality?: string;
    bloodType?: string;

    // — Estado civil y familia —
    maritalStatus?: string;     // SOLTERO, CASADO, DIVORCIADO, VIUDO, UNION LIBRE
    spouseName?: string;
    motherName?: string;
    fatherName?: string;

    // — Educación y trabajo —
    education?: string;         // SUPERIOR, SECUNDARIA, etc.
    profession?: string;

    // — Cédula / Registro Civil —
    conditionCedulado?: string; // CIUDADANO, RESIDENTE, etc.
    cedulaDate?: string;        // Fecha de última cedulación
    deathDate?: string;         // fechaInscripcionDefuncion (si aplica)

    // — Licencia de conducir —
    licencia?: LicenciaConducir;

    // — Discapacidad CONADIS —
    disability?: string;
    disabilityType?: string;
    disabilityPct?: number;
    conadisCard?: string;

    // — Contacto —
    phone?: string;
    cellphone?: string;
    email?: string;

    // — Estado tributario (para RUC) —
    status?: string;
    condition?: string;
}

const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const individualToken = localStorage.getItem('apiconsult_token');
    if (individualToken) {
        return { 'x-apiconsult-token': individualToken };
    }
    return {};
};

/**
 * Helper: builds full street address combining street + house number
 */
const buildAddress = (street: string, houseNum?: string): string => {
    const s = (street || '').trim();
    const n = (houseNum || '').trim();
    if (!s) return '';
    if (!n || n === '00' || n === '0') return s;
    return `${s} N° ${n}`;
};

/**
 * Helper: parse "PROVINCIA/CANTON/PARROQUIA" location strings
 */
const parseLugar = (lugar: string): { dep: string; prov: string; dist: string } => {
    const parts = lugar.split('/').map((p: string) => p.trim());
    return {
        dep: parts[0] || '',
        prov: parts[1] || '',
        dist: parts[2] || '',
    };
};

/**
 * Helper: parse driver license object from API response
 */
const parseLicencia = (data: any): LicenciaConducir | undefined => {
    // Try different possible structures
    const lic = data.licencia || data.licenciaConduccion || data.licenciaConducir;
    if (!lic) return undefined;

    const infracciones = (lic.infracciones || lic.infractions || []).map((inf: any) => ({
        fecha: inf.fecha || inf.date || '',
        tipo: inf.tipo || inf.type || '',
        descripcion: inf.descripcion || inf.description || '',
        multa: inf.multa || inf.valor || '',
        estado: inf.estado || inf.status || '',
    }));

    return {
        tipo: lic.tipo || lic.categoria || lic.type || '',
        numero: lic.numero || lic.number || '',
        fechaDesde: lic.fechaDesde || lic.fechaEmision || lic.from || '',
        fechaHasta: lic.fechaHasta || lic.fechaVencimiento || lic.until || '',
        puntos: lic.puntos !== undefined ? Number(lic.puntos) : undefined,
        estado: lic.estado || lic.status || '',
        infracciones: infracciones.length > 0 ? infracciones : undefined,
    };
};

export const fetchEcuadorData = async (id: string, extended = true): Promise<EcuadorCustomerData> => {
    const isRuc = id.length === 13;
    const isCedula = id.length === 10;

    if (!isCedula && !isRuc) {
        throw new Error('Identificación inválida (Cédula 10 dígitos, RUC 13 dígitos)');
    }
    
    // MOCK for user request #1 (1790000000001)
    if (id === '1790000000001') {
        return {
            success: true,
            id: '1790000000001',
            type: 'juridica',
            name: 'XPAND PRUEBA S.A.S.',
            address: 'Urb. Cotopaxi',
            department: 'Cotopaxi',
            province: 'Cotopaxi',
            district: 'Latacunga',
            status: 'ACTIVO',
            condition: 'HABIDO',
            phone: '0939011068',
            email: 'kevin.valdez.dlc@gmail.com'
        };
    }
    try {
        const response = await fetch(`/api/ecuador-api?id=${id}${isCedula && extended ? '&full=true' : ''}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        // ── RUC / EMPRESA ────────────────────────────────────────────────────
        if (isRuc && (data.razonSocial || data.nombreComercial)) {
            const name = data.razonSocial || data.nombreComercial || '';
            const status = data.estadoContribuyenteRuc || data.estado || '';
            const condition = data.actividadEconomicaPrincipal || data.actividad || '';

            const establecimientos = data.establecimientos || [];
            const matriz = establecimientos.find((e: any) => e.matriz === 'SI') || establecimientos[0];
            let address = '';
            let department = '', province = '', district = '';

            if (matriz) {
                address = buildAddress(
                    matriz.direccionCompleta || matriz.calle || '',
                    matriz.numeroCasa || matriz.numero || ''
                );
                if (matriz.direccionCompleta) {
                    const loc = parseLugar(matriz.direccionCompleta);
                    department = loc.dep; province = loc.prov; district = loc.dist;
                }
                if (matriz.provincia) department = matriz.provincia;
                if (matriz.canton) province = matriz.canton;
                if (matriz.parroquia) district = matriz.parroquia;
            }

            if (!name) throw new Error(data.error || data.message || 'No se encontraron datos');

            return { success: true, name, id, type: 'juridica', address, department, province, district, status, condition };
        }

        // ── CÉDULA / PERSONA NATURAL ─────────────────────────────────────────
        // The API may return data flat at root, or nested under data.persona
        const d = (isCedula && data.nombre) ? data
            : (data.persona || data.datos || data);

        const name = d.nombre || d.name || '';
        if (!name) {
            throw new Error(data.error || data.message || 'No se encontraron datos');
        }

        // Address
        const houseNumber = (d.numeracionDomicilio || d.numeroCasa || '').trim();
        const streetRaw = d.calleDomicilio || d.calle || d.direccion || '';
        const address = buildAddress(streetRaw, houseNumber);

        // Location
        let department = '', province = '', district = '';
        const domicilio = d.lugarDomicilio || d.domicilio || '';
        if (domicilio) {
            const loc = parseLugar(domicilio);
            department = loc.dep; province = loc.prov; district = loc.dist;
        }
        // Override with explicit fields if available
        if (d.provincia) department = d.provincia;
        if (d.canton || d.cantón) province = d.canton || d.cantón;
        if (d.parroquia) district = d.parroquia;

        // Birthplace
        const birthPlaceRaw = d.lugarNacimiento || d.lugarDeNacimiento || '';
        const birthPlace = birthPlaceRaw ? birthPlaceRaw.replace(/\//g, ' / ') : '';

        // Death — only capture if clearly not empty
        const deathRaw = (d.fechaInscripcionDefuncion || d.fechaDefuncion || '').trim();
        const deathDate = deathRaw && deathRaw !== ' ' && deathRaw.length > 2 ? deathRaw : undefined;

        // Disability
        const conadisCard = (d.carnetConadis || '').trim() || undefined;
        const disabilityRaw = (d.discapacidad || d.tipoDiscapacidad || '').trim();
        const disability = disabilityRaw || undefined;
        const disabilityType = (d.tipoDiscapacidad || '').trim() || undefined;
        const disabilityPct = d.porcentajeDiscapacidad
            ? parseFloat(d.porcentajeDiscapacidad)
            : undefined;

        return {
            success: true,
            name,
            id,
            type: 'natural',
            // Address
            address,
            houseNumber: houseNumber || undefined,
            department,
            province,
            district,
            birthPlace,
            // Bio
            birthDate: d.fechaNacimiento || d.birthDate || '',
            gender: (d.genero || d.sexo || '').trim(),
            nationality: (d.nacionalidad || '').trim(),
            bloodType: (d.tipoSangre || d.sangre || d.grupoSanguineo || '').trim(),
            // Civil
            maritalStatus: (d.estadoCivil || '').trim(),
            spouseName: (d.conyuge || d.nombreConyuge || d.esposo || d.esposa || '').trim(),
            motherName: (d.nombreMadre || d.madre || '').trim(),
            fatherName: (d.nombrePadre || d.padre || '').trim(),
            // Education
            education: (d.instruccion || d.nivelEducacion || '').trim(),
            profession: (d.profesion || d.ocupacion || '').trim(),
            // Registro Civil
            conditionCedulado: (d.condicionCedulado || '').trim(),
            cedulaDate: (d.fechaCedulacion || d.fechaExpedicion || '').trim(),
            deathDate,
            // License
            licencia: parseLicencia(d),
            // Disability
            disability,
            disabilityType,
            disabilityPct,
            conadisCard,
            // Contact
            phone: (d.telefono || '').trim(),
            cellphone: (d.celular || '').trim(),
            email: (d.email || d.correo || '').trim(),
        };

    } catch (error: any) {
        return {
            success: false,
            name: '',
            id: id,
            message: error.message,
            type: isCedula ? 'natural' : 'juridica'
        };
    }
};

export const fetchWhatsAppStatus = async (phone: string): Promise<{ success: boolean; hasWhatsApp?: boolean; message?: string }> => {
  if (!phone || phone.length < 7) return { success: false, message: 'Teléfono inválido' }

  try {
    const clean = phone.replace(/[^0-9]/g, '')
    const token = typeof window !== 'undefined' ? localStorage.getItem('apiconsult_token') : ''
    const res = await fetch(`/api/ecuador-api?type=whatsapp&id=${clean}`, {
      headers: { 'x-apiconsult-token': token || '' },
    })
    const data = await res.json()
    if (!data.success) {
      return { success: false, message: data.message || 'Error al verificar WhatsApp' }
    }
    return { success: true, hasWhatsApp: data.data?.hasWhatsapp || data.data?.has_whatsapp || data.data?.active || false }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export const mapCartToEcuadorInvoice = (cart: any[], customer: any, total: number, subtotal: number, tax: number, taxRate: number, storeInfo: any) => {
    return {
        infoTributaria: {
            ambiente: storeInfo.env === 'produccion' ? '2' : '1',
            tipoEmision: '1',
            razonSocial: storeInfo.razonSocial || 'XPAND CORP',
            nombreComercial: storeInfo.razonSocial || 'XPAND CORP',
            ruc: storeInfo.ruc || '0000000000001',
            codDoc: '01',
            estab: '001',
            ptoEmi: '001',
            secuencial: Math.floor(Math.random() * 999999999).toString().padStart(9, '0'),
            dirMatriz: storeInfo.address || 'Quito, Ecuador'
        },
        infoFactura: {
            fechaEmision: new Date().toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/'),
            dirEstablecimiento: storeInfo.address || 'Quito, Ecuador',
            obligadoContabilidad: 'NO',
            tipoIdentificacionComprador: customer?.id?.length === 13 ? '04' : (customer?.id?.length === 10 ? '05' : '07'),
            razonSocialComprador: customer?.name || 'CONSUMIDOR FINAL',
            identificacionComprador: customer?.id || '9999999999999',
            totalSinImpuestos: subtotal.toFixed(2),
            totalDescuento: '0.00',
            totalConImpuestos: [
                {
                    codigo: '2',
                    codigoPorcentaje: taxRate === 15 ? '4' : (taxRate === 12 ? '2' : '0'),
                    baseImponible: subtotal.toFixed(2),
                    valor: tax.toFixed(2)
                }
            ],
            propina: '0.00',
            importeTotal: total.toFixed(2),
            moneda: 'DOLAR',
            pagos: [
                {
                    formaPago: '01',
                    total: total.toFixed(2)
                }
            ]
        },
        detalles: (cart || []).map(item => ({
            codigoPrincipal: item.id.toString(),
            descripcion: item.name,
            cantidad: Number(item.quantity).toFixed(2),
            precioUnitario: Number(item.price).toFixed(6),
            descuento: '0.00',
            precioTotalSinImpuesto: (item.price * item.quantity).toFixed(2),
            impuestos: [
                {
                    codigo: '2',
                    codigoPorcentaje: taxRate === 15 ? '4' : (taxRate === 12 ? '2' : '0'),
                    tarifa: taxRate.toString(),
                    baseImponible: (item.price * item.quantity).toFixed(2),
                    valor: ((item.price * item.quantity) * (taxRate / 100)).toFixed(2)
                }
            ]
        }))
    };
};

