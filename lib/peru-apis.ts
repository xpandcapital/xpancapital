/**
 * Peru APIs Utility
 * Centered logic for DNI (RENIEC) and RUC (SUNAT) lookups.
 * Using a flexible structure for easy token management.
 */

export interface PeruCustomerData {
    success: boolean;
    name: string;
    dni?: string;
    ruc?: string;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
    country?: string;
    status?: string;
    condition?: string;
    firstName?: string;
    lastName?: string;
    education?: string;
    profession?: string;
    maritalStatus?: string;
    birthDate?: string;
    lastUpdate?: string; // SÓLO PARA EMPRESAS (SUNAT)
    type: 'natural' | 'juridica';
    message?: string;
}

const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};

    // 1. Intentar desde blis_ai_config (objeto central)
    const configStr = localStorage.getItem('blis_ai_config');
    if (configStr) {
        try {
            const config = JSON.parse(configStr);
            if (config.PERU_API_TOKEN) {
                return { 'x-peru-api-token': config.PERU_API_TOKEN };
            }
        } catch (e) { }
    }

    // 2. Intentar desde llave individual
    const individualToken = localStorage.getItem('peru_api_token');
    if (individualToken) {
        return { 'x-peru-api-token': individualToken };
    }

    return {};
};

export const fetchDniData = async (dni: string): Promise<PeruCustomerData> => {
    if (dni.length !== 8) throw new Error('DNI debe tener 8 dígitos');

    // MOCK para pruebas de diseño/dashboard
    if (dni === '00000000') {
        return {
            success: true,
            name: 'CARLOS ENRIQUE PEREZ GOMEZ',
            firstName: 'CARLOS ENRIQUE',
            lastName: 'PEREZ GOMEZ',
            dni: '00000000',
            address: 'Av. Paseo de la República 123',
            district: 'SANTIAGO DE SURCO',
            province: 'LIMA',
            department: 'LIMA',
            birthDate: '1990-05-12',
            maritalStatus: 'SOLTERO',
            profession: 'INGENIERO DE SISTEMAS',
            education: 'SUPERIOR COMPLETA',
            type: 'natural'
        };
    }

    try {
        const response = await fetch(`/api/peru-api?type=dni&id=${dni}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const result = data.data || data;
        const isSuccessful = data.code === "200" || data.success === true || (result.cliente || result.nombre || result.nombres);

        if (!isSuccessful) {
            throw new Error(data.message || 'Error al consultar DNI');
        }

        return {
            success: true,
            name: result.nombre_completo || result.cliente || result.nombre || ((result.nombres || '') + ' ' + (result.apellido_paterno || '') + ' ' + (result.apellido_materno || '')).trim(),
            firstName: result.nombres || '',
            lastName: ((result.apellido_paterno || '') + ' ' + (result.apellido_materno || '')).trim(),
            dni: dni,
            address: result.direccion || '',
            department: result.departamento || '',
            province: result.provincia || '',
            district: result.distrito || '',
            country: 'PERÚ',
            type: 'natural',
            birthDate: result.fecha_nacimiento || result.nacimiento || '',
            lastUpdate: result.fecha_actualizacion || '',
            education: result.nivel_instruccion || result.estudios || '',
            profession: result.profesion || result.ocupacion || '',
            maritalStatus: result.estado_civil || result.estadoCivil || '',
            condition: result.condicion || '',
            status: result.estado || ''
        };
    } catch (error: any) {
        return {
            success: false,
            name: '',
            message: error.message,
            type: 'natural'
        };
    }
};

export const fetchRucData = async (ruc: string): Promise<PeruCustomerData> => {
    if (ruc.length !== 11) throw new Error('RUC debe tener 11 dígitos');

    // MOCK para pruebas SUNAT
    if (ruc === '10000000001') {
        return {
            success: true,
            name: 'BLIS CORP PERU S.A.C.',
            ruc: '10000000001',
            address: 'Calle Los Negocios 456, San Isidro',
            department: 'LIMA',
            province: 'LIMA',
            district: 'SAN ISIDRO',
            status: 'ACTIVO',
            condition: 'HABIDO',
            type: 'juridica'
        };
    }

    try {
        const response = await fetch(`/api/peru-api?type=ruc&id=${ruc}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const result = data.data || data;
        const isSuccessful = data.code === "200" || data.success === true || (result.razon_social || result.nombre_o_razon_social);

        if (!isSuccessful) {
            throw new Error(data.message || 'Error al consultar RUC');
        }

        return {
            success: true,
            name: result.razon_social || result.nombre_o_razon_social || result.nombre,
            ruc: ruc,
            address: result.direccion || '',
            department: result.departamento || '',
            province: result.provincia || '',
            district: result.distrito || '',
            country: 'PERÚ',
            status: result.condicion || result.estado_contribuyente || '',
            condition: result.estado || result.condicion_contribuyente || '',
            birthDate: result.fecha_inscripcion || result.fecha_inicio_actividades || '',
            lastUpdate: result.fecha_actualizacion || '',
            type: 'juridica'
        };
    } catch (error: any) {
        return {
            success: false,
            name: '',
            message: error.message,
            type: 'juridica'
        };
    }
};
export const fetchExchangeRate = async (): Promise<{ success: boolean; buy: number; sell: number; message?: string }> => {
    try {
        const response = await fetch(`/api/peru-api?type=tipo_cambio`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        // Handle common formats for exchange rates
        const result = data.data || data;

        if (!result.compra || !result.venta) {
            // Fallback if the API doesn't return what we expect or is down
            // We return a safe default but indicate failure if needed
            return {
                success: false,
                buy: 3.75,
                sell: 3.80,
                message: 'No se pudo obtener el TC oficial'
            };
        }

        return {
            success: true,
            buy: parseFloat(result.compra),
            sell: parseFloat(result.venta)
        };
    } catch (error: any) {
        return { success: false, buy: 3.75, sell: 3.80, message: error.message };
    }
};
