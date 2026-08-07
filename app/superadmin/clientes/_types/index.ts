export interface DbProfile {
    id: string;
    empresa_id: string;
    email: string;
    nombre: string | null;
    apellido: string | null;
    avatar_url: string | null;
    telefono: string | null;
    rol: string;
    xpand_coins: number;
    total_compras: number;
    total_gastado_usd: number;
    total_referidos: number;
    creado_en: string;
    pais: string | null;
    region: string | null;
    ciudad: string | null;
    tipo_cuenta: string;
    empresa_nombre: string | null;
    empresa_ruc: string | null;
    empresa_rep_legal: string | null;
    tipo_documento: string | null;
    numero_documento: string | null;
    fecha_nacimiento: string | null;
    estado_civil: string | null;
    profesion: string | null;
    educacion: string | null;
    verificado: boolean;
    verificado_en: string | null;
    nivel_id: string | null;
    coins_totales_ganados: number;
    coins_totales_gastados: number;
    coins_expiran: string | null;
    ha_comprado: boolean;
    recibir_newsletter: boolean;
    recibir_push: boolean;
    idioma: string;
    tema: string;
    courier_preferido: string;
    codigo_referido: string | null;
    referido_por: string | null;
    notas_internas: string | null;
    es_caso_dificil: boolean;
    cumpleanos_auto_regalo: boolean;
    recordatorio_inactividad: boolean;
    cuenta_congelada: boolean;
    cuenta_fusionada_con: string | null;
    ultimo_login: string | null;
    addresses: DbAddress[];
}

export interface DbAddress {
    id: string;
    tipo: string;
    etiqueta: string;
    direccion: string;
    ciudad: string;
    region: string | null;
    es_principal: boolean;
    acceso_dificil: boolean;
}

export interface Address {
    id: string;
    type: 'Envio' | 'Facturacion' | 'Oficina';
    label: string;
    address: string;
    city: string;
}

export interface AuditLog {
    id: string;
    date: string;
    action: string;
    user: string;
    details: string;
}

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'Ganancia' | 'Gasto' | 'Ajuste';
    description: string;
    reason?: string;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    date: string;
    total: number;
    status: 'Pagado' | 'Pendiente' | 'Cancelado';
    items: number;
    type: 'Venta' | 'Cotizacion';
    products?: OrderItem[];
}

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    role: 'Cliente' | 'Admin' | 'Moderador' | 'Staff';
    xpandCoins: number;
    purchases: number;
    income: number;
    lastActive: string;
    status: string;
    joined: string;
    birthday: string;
    phone: string;
    tier: string;
    country: string;
    region: string;
    documentType: 'DNI' | 'RUC' | 'Cedula' | 'Pasaporte';
    dni: string;
    maritalStatus?: string;
    profession?: string;
    education?: string;
    condition?: string;
    address?: string;
    city?: string;
    isCompany: boolean;
    companyName: string;
    legalRep: string;
    addresses: Address[];
    auditLogs: AuditLog[];
    internalNotes: string;
    isNewsletterSubscribed: boolean;
    isPushEnabled: boolean;
    isAccountFrozen: boolean;
    isFrozen: boolean;
    isVIP: boolean;
    emailVerified: boolean;
    creditLimit: number;
    transactions: Transaction[];
    orders: Order[];
    abandonedCart: { items: number; total: number; date: string } | null;
    coinsExpiration: string;
    academicProgress: AcademicCourse[];
    certificates: Certificate[];
    privateEvents: PrivateEvent[];
    managedEmployees?: ManagedEmployee[];
    aiTags: string[];
    heatMap: HeatMapEntry[];
    npsScore: number;
    churnRisk: 'low' | 'medium' | 'high';
    recommendedProducts: RecommendedProduct[];
    supportTickets: SupportTicket[];
    courierPreference: 'PickUp' | 'Home' | 'Office';
    isDifficultAccess: boolean;
    restockAlerts: string[];
    referralCount: number;
    referrals: Referral[];
    isBirthdayAutoGift: boolean;
    inactivityReminderSent: boolean;
    lastLoginDate: string;
    isAccountMerged?: boolean;
    mergedWithId?: string;
    plan?: string;
    diasRestantes?: number | null;
}

export interface AcademicCourse {
    id: string;
    courseId: string;
    course: string;
    slug: string;
    imagen: string | null;
    progress: number;
    grade?: number;
    leccionesCompletadas: number;
    totalLecciones: number;
    attempts: number;
    maxAttempts: number;
    examStatus: 'open' | 'failed_blocked' | 'passed';
    ultimoAcceso: string | null;
    matriculado: boolean;
}

export interface Certificate {
    id: string;
    name: string;
    date: string;
}

export interface PrivateEvent {
    id: string;
    name: string;
    date: string;
    access: boolean;
}

export interface ManagedEmployee {
    id: string;
    name: string;
    role: string;
    joined: string;
}

export interface HeatMapEntry {
    page: string;
    visits: number;
    section: 'Blog' | 'Tienda';
}

export interface RecommendedProduct {
    id: string;
    name: string;
    match: number;
}

export interface SupportTicket {
    id: string;
    subject: string;
    status: 'open' | 'closed';
}

export interface Referral {
    id: string;
    name: string;
    bonus: number;
    avatarColor?: string;
    lastPurchase?: { name: string; price: number };
    commissionCash?: number;
    commissionBC?: number;
    commissionPercent?: number;
}

export type ClientTab = 'profile' | 'economy' | 'sales' | 'referrals' | 'comms' | 'addresses' | 'academia' | 'ai_insights' | 'automations' | 'history' | 'gamificacion';
