import type { DbProfile, DbAddress, Client, Address } from '../_types';

export function mapDbToClient(profile: DbProfile): Client {
    const tierMap: Record<string, string> = {
        'platinum': 'Platinum Member',
        'gold': 'Gold Member',
        'silver': 'Silver Member',
        'bronze': 'Bronze Member'
    };
    const docTypeMap: Record<string, Client['documentType']> = {
        'DNI': 'DNI',
        'RUC': 'RUC',
        'Cedula': 'Cedula',
        'Pasaporte': 'Pasaporte',
        'CE': 'Pasaporte',
        'RUT': 'RUC',
        'CURP': 'Pasaporte',
        'RFC': 'RUC',
        'NIT': 'RUC',
        'TI': 'Cedula',
        'CC': 'Cedula',
        'CPF': 'Pasaporte',
        'CI': 'Cedula'
    };
    const docType = docTypeMap[profile.tipo_documento || 'DNI'] || 'DNI';
    let status = 'Socio';
    if (profile.verificado) status = 'Verificado';
    else if (profile.ha_comprado) status = 'Premium';
    const roleMap: Record<string, Client['role']> = {
        'usuario': 'Cliente',
        'cliente': 'Cliente',
        'editor': 'Staff',
        'admin': 'Admin',
        'superadmin': 'Admin'
    };

    return {
        id: profile.id,
        firstName: profile.nombre || '',
        lastName: profile.apellido || '',
        email: profile.email,
        avatar: (profile.nombre?.charAt(0) || profile.email.charAt(0)).toUpperCase(),
        role: roleMap[profile.rol] || 'Cliente',
        xpandCoins: profile.xpand_coins || 0,
        purchases: profile.total_compras || 0,
        income: Number(profile.total_gastado_usd) || 0,
        lastActive: profile.ultimo_login ? `Hace ${Math.floor((Date.now() - new Date(profile.ultimo_login).getTime()) / 3600000)} horas` : 'Nunca',
        status,
        joined: new Date(profile.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        birthday: profile.fecha_nacimiento || '',
        phone: profile.telefono || '',
        tier: profile.nivel_id ? (tierMap[profile.nivel_id] || 'Bronze Member') : 'Bronze Member',
        country: profile.pais || 'PE',
        region: profile.region || '',
        documentType: docType,
        dni: profile.numero_documento || '',
        maritalStatus: profile.estado_civil || '',
        profession: profile.profesion || '',
        education: profile.educacion || '',
        condition: '',
        address: '',
        city: profile.ciudad || '',
        isCompany: profile.tipo_cuenta === 'empresa',
        companyName: profile.empresa_nombre || '',
        legalRep: profile.empresa_rep_legal || '',
        addresses: (profile.addresses || []).map((addr: DbAddress) => ({
            id: addr.id,
            type: addr.tipo === 'envio' ? 'Envio' : addr.tipo === 'facturacion' ? 'Facturacion' : 'Oficina',
            label: addr.etiqueta || '',
            address: addr.direccion,
            city: addr.ciudad
        })),
        auditLogs: [],
        internalNotes: profile.notas_internas || '',
        isNewsletterSubscribed: profile.recibir_newsletter ?? true,
        isPushEnabled: profile.recibir_push ?? true,
        isAccountFrozen: profile.cuenta_congelada ?? false,
        isFrozen: profile.cuenta_congelada ?? false,
        isVIP: false,
        emailVerified: profile.verificado ?? false,
        creditLimit: 500,
        transactions: [],
        orders: [],
        abandonedCart: null,
        coinsExpiration: profile.coins_expiran || '2024-12-31',
        academicProgress: [],
        certificates: [],
        privateEvents: [],
        managedEmployees: [],
        aiTags: [],
        heatMap: [],
        npsScore: 8,
        churnRisk: 'low',
        recommendedProducts: [],
        supportTickets: [],
        courierPreference: (profile.courier_preferido?.charAt(0).toUpperCase() + profile.courier_preferido?.slice(1)) as Client['courierPreference'] || 'Home',
        isDifficultAccess: false,
        restockAlerts: [],
        referralCount: profile.total_referidos || 0,
        referrals: [],
        isBirthdayAutoGift: profile.cumpleanos_auto_regalo ?? true,
        inactivityReminderSent: profile.recordatorio_inactividad ?? false,
        lastLoginDate: profile.ultimo_login || ''
    };
}
