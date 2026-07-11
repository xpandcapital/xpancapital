# Xpand Capital - Arquitectura del Sistema

> **Versión:** 1.0  
> **Última actualización:** 2026-04-08  
> **Estado:** Documentación Oficial

---

## Visión General

**Xpand Capital** es una plataforma SaaS multi-tenant para gestión inmobiliaria con módulos integrados de e-commerce, marketing y educación digital.

### Módulos Principales

| Módulo | Descripción | Ruta Principal |
|--------|-------------|----------------|
| **Inmobiliario** | Gestión de proyectos, lotes, propietarios y pagos | `/superadmin/gestion-lotes/` |
| **E-Commerce** | Tienda de productos digitales y físicos | `/tienda/` |
| **Marketing** | Campañas, leads y templates de landing | `/superadmin/campanas/` |
| **Educación** | Cursos y certificaciones | `/miembros/academia/` |
| **Comunidad** | Social Hub y Live Events | `/miembros/comunidad/` |
| **Trading** | Herramienta interna de trading | `/superadmin/trading/` |

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Browser)                               │
│                    Next.js 14 - App Router - React 18                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER SIDE                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   API Routes    │  │  Server Actions │  │  Middleware     │              │
│  │   /api/*        │  │  (forms)        │  │  (auth/tenant)  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Supabase      │  │  Repositories  │  │  Services      │              │
│  │   (PostgreSQL)  │  │  (lib/repo)    │  │  (lib/services)│              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Notion    │  │   Binance   │  │  Nodemailer │  │  Puppeteer  │         │
│  │   (Sync)    │  │   (Trading) │  │  (Email)    │  │  (PDF)      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenancy

### Estructura de Empresas

```typescript
Empresa {
  id: UUID
  slug: string          // Subdominio o identificador
  nombre: string
  
  // Branding
  logo_url: string
  color_primario: string
  color_secundario: string
  
  // Aislamiento de datos
  └── Todos los registros tienen empresa_id
}
```

### Aislamiento de Datos

- **Row Level Security (RLS)** en Supabase
- **Middleware** inyecta `empresa_id` en cada request
- **Context** provee empresa actual a componentes

---

## Flujo de Datos

### 1. Captura de Leads

```
Landing Page (Template)
     │
     ▼
Formulario (Capture Form)
     │
     ▼
POST /api/leads
     │
     ├── Lead guardado en Supabase
     │
     ├── Trigger: notificar_nuevo_lead()
     │
     ├── Email a emails_notificacion[]
     │
     ├── WhatsApp (si configurado)
     │
     └── Notion Sync (si activado)
```

### 2. Venta de Lote

```
Lead interesado
     │
     ▼
Asesor crea/actualiza Lote
     │
     ├── Estado: Disponible → Reservado
     │
     ├── Registra arras (pago inicial parcial)
     │
     └── Asigna cliente
     │
     ▼
Cliente firma contrato
     │
     ├── Sube PDF a Lote
     │
     ├── Estado: Reservado → Vendido
     │
     └── Registra pagos (JSONB tipado)
     │
     ▼
Cliente abona mensualmente
     │
     ├── Sistema registra cuotas
     │
     ├── Calcula Saldo Final
     │
     └── Alertas automáticas si mora >5 días
```

### 3. Sistema de Pagos

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTRUCTURA DE PAGOS                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PRECIO TOTAL DEL LOTE                                      │
│  │                                                          │
│  ├── Inicial Esperado                                       │
│  │   └── Pagos Iniciales (arras)                           │
│  │       ├── Pago 1│
│  │       ├── Pago 2                                         │
│  │       └── ...                                            │
│  │                                                          │
│  ├── Cuotas Mensuales                                       │
│  │   ├── Enero 2024 → CUOTA_REGULAR                         │
│  │   ├── Febrero 2024 → CUOTA_REGULAR                       │
│  │   └── ...                                                ││
│  └── Abonos Extraordinarios                                 │
│      ├── "Abono extra enero" → ABONO_EXTRAORDINARIO        │
│      └── "Transferencia familiar" → ABONO_EXTRAORDINARIO   │
│                                                              │
│  SALDO FINAL = PRECIO TOTAL- TODOS LOS PAGOS   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Roles y Permisos

### Matriz de Permisos

| Recurso | SuperAdmin | Socio Proyecto | Asesor | Socio | Propietario |
|---------|-----------|----------------|--------|-------|-------------|
| Ver todos los proyectos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver proyectos asignados | ✅ | ✅ | ✅ | ❌ | ❌ |
| Editar precios | ✅ | ✅ (con log) | ❌ | ❌ | ❌ |
| Ver API Keys | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver sus clientes | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver sus lotes | ✅ | ✅ | ❌ | ❌ | ✅ |
| Ver log auditoría | ✅ | ✅ | ❌ | ❌ | ❌ |

### Tipos de Usuario

```typescript
type TipoUsuario = 
  | 'superadmin'      // Acceso total
  | 'socio_proyecto'  // Gestiona proyectos (Franklin)
  | 'asesor'          // Ve sus clientes asignados
  | 'socio'           // Compró productos digitales
  | 'propietario'     // Compró lotes
  | 'empleado'        // Personal interno
```

---

## Módulo de Inmobiliario

### Diagrama Entidad-Relación

```
EMPRESA
  │
  ├── PROJECT (Proyectos Inmobiliarios)
  │     │
  │     ├── id: TEXT (montebello, villa-victoria)
  │     ├── nombre: string
  │     ├── status: 'EN PLANOS' | 'PREVENTA' | ...
  │     └── notion_database_id (sincronización)
  │
  └── ADVISORS (Asesores/Agentes)
        │
        ├── id: UUID
        ├── nombre: string
        └── commission_type: 'percentage' | 'fixed'
              │
              ▼
        PROJECT_LOTS (Lotes)
              │
              ├── id: UUID
              ├── project_id: TEXT
              ├── estado: 'Disponible' | 'Reservado' | 'Vendido' | 'Desistido'
              │
              ├── PAYMENTS (JSONB[])
              │     ├── tipo: 'CUOTA_REGULAR' | 'ABONO_EXTRAORDINARIO'
              │     ├── monto: number
              │     └── fecha: Date
              │
              ├── OWNERS (JSONB[])
              │     ├── nombre: string
              │     ├── documento: string
              │     └── email: string
              │
              └── ADVISOR_ID (Asesor asignado)
```

### Máquina de Estados de Lote

```
┌─────────────┐
│ DISPONIBLE  │
└──────┬──────┘
       │ Arras (monto pequeño)
       ▼
┌─────────────┐
│  RESERVADO  │
└──────┬──────┘
       │
       ├──────────────────────┐
       │ Firma + Inicial       │ Desiste
       ▼                      ▼
┌─────────────┐      ┌─────────────┐
│   VENDIDO   │      │ DISPONIBLE  │
└──────┬──────┘      └─────────────┘
       │
       │ Pierde lote (+30 días)
       ▼
┌─────────────┐
│  DESISTIDO  │
└─────────────┘
       │
       │ Transferencia a otro lote
       ▼
   (Nuevo Lote)
```

### Alertas de Mora

| Días | Estado | Acciones |
|------|--------|----------|
| 0-4 | 🟢 Normal | Ninguna |
| 5-29| 🟡 Gris | Notificación cliente + Tarea asesor |
| 30+ | 🔴 Rojo | Alerta rescisión a SuperAdmin y Socio Proyecto |

---

## Módulo de E-Commerce

### Tipos de Productos

```typescript
type TipoProducto = 
  | 'digital'    // eBook, PDF, descarga
  | 'fisico'     // Producto físico con envío
  | 'servicio'   // Asesoría, consultoría│
  | 'suscripcion' // Membresía recurrente
```

### Flujo de Compra

```
Cliente en Tienda
     │
     ▼
Añade al Carrito (localStorage)
     │
     ▼
Checkout
     │
     ├── Si no autenticado → Login/Registro
     │
     ├── Selecciona método de pago
     │   ├── BlisCoins
     │   ├── Stripe
     │   └── PayPal
     │
     ▼
Procesa Pago
     │
     ├── Si éxito → Crea orden
     │   ├── Descuenta stock (si físico)
     │   ├── Asigna producto (si digital)
     │   └── Otorga BlisCoins (si aplica)
     │
     └── Envía email de confirmación
```

---

## Módulo de Marketing

### Templates y Landing Pages

```
TEMPLATE
  │
  ├── tipo: 'landing' | 'blog' | 'funnel'
  │
  ├── es_principal: boolean
  │   └── Solo UNO puede ser true por tipo
  │
  ├── slug: string
  │   └── URL pública: /blog/[slug] o /funnel/[slug]
  │
  └── secciones: JSONB
        ├── captureHero (formulario de leads)
        └── ...más secciones
```

### Sistema de Leads

```
LEAD
  │
  ├── campana_id (Campaña de origen)
  │
  ├── asesor_id (Asesor asignado)
  │
  ├── origen: 'formulario' | 'manual' | 'importacion'
  │
  ├── estado: 'nuevo' | 'contactado' | 'calificado' | 'convertido' | 'perdido'
  │
  └── Datos en JSONB (campos dinámicos)
```

---

## Módulo de Comunidad

### Social Hub

```
Features:
├── Feed de publicaciones
├── Grupos privados por proyecto
├── Eventos en vivo
└── Sistema de mensajería
```

### Live Events

```
LIVE_EVENT
  │
  ├── stream_url (HLS/RTMP)
  │
  ├── sala_externa_url (Meet/Zoom)
  │
  ├── chat_habilitado: boolean
  │   └── Chat propio de Xpand Capital
  ││
  └── BlisCoins automáticos
        └── 1 BlisCoin por minuto de visualización
              └── Sistema de Heartbeat (pulso cada60s)
```

---

## Sistema de BlisCoins

### Ganancia de BlisCoins

| Acción | BlisCoins |
|--------|-----------|
| Lectura de artículo completo | +5 |
| Completar curso | +50 |
| Registrar referido | +100 |
| Asistir a evento en vivo | +1/minuto |
| Comprar producto | Variable |

### Uso de BlisCoins

| Uso | BlisCoins |
|-----|-----------|
| Comprar eBook | Variable |
| Descuento en cursos | Variable |
| Productos exclusivos | Variable |

---

## Seguridad

### API Keys Encriptadas

```typescript
// Tabla: integraciones
{
  tipo: 'binance' | 'sendgrid' | 'twilio' | 'other'
  config: {
    api_key_encrypted: string  // AES-256
    api_secret_encrypted: string
  }
}

// Solo SuperAdmin puede ver/descifrar
```

### Log de Auditoría

```typescript
// Todo cambio importante genera registro
{
  usuario_id: UUID,
  accion: 'editar_precio' | 'cambiar_estado' | 'crear_lote',
  valor_antes: JSON,
  valor_despues: JSON,
  ip: string,
  user_agent: string,
  creado_en: Date
}
```

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Estado | React Query, URL State, Custom Hooks |
| Backend | Next.js API Routes, Server Actions |
| Base de Datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage |
| Tiempo Real | Supabase Realtime |
| Email | Nodemailer |
| PDF | React-PDF |
| Scraping | Puppeteer |
| Trading | Binance API |

---

## Patrones de Diseño

### Repository Pattern

```typescript
// lib/repositories/lote.repository.ts
interface LoteRepository {
  findById(id: string): Promise<Lote>
  findByProject(projectId: string): Promise<Lote[]>
  save(lote: Lote): Promise<void>
  update(id: string, updates: Partial<Lote>): Promise<void>
}
```

### Service Layer

```typescript
// lib/services/pago-calculator.service.ts
class PagoCalculatorService {
  calcularSaldoFinal(lote: Lote): SaldoFinal
  clasificarPagos(pagos: any[]): HistorialPago[]
  generarAlertaMora(lote: Lote): AlertaMora | null
}
```

### Custom Hooks

```typescript
// lib/hooks/useProducts.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsRepo.findAll(filters)
  })
}
```

---

## Convenciones de Código

Ver [CONVENTIONS.md](./CONVENTIONS.md) para detalles completos.

### Límites de Líneas

| Tipo de Archivo | Soft Limit | Hard Limit |
|-----------------|------------|------------|
| Componente React | 300 líneas | 500 líneas |
| Custom Hook | 150 líneas | 250 líneas |
| Utilidad | 200 líneas | 400 líneas |

### Estructura de Módulos

```
modulo/
├── page.tsx           (< 150 líneas)
├── _components/
│   ├── ComponentA/
│   └── ComponentB/
├── _hooks/
│   └── useModulo.ts
├── _types/
│   └── types.ts
└── _utils/
    └── helpers.ts
```

---

## URLs y Rutas

### Públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing principal |
| `/blog` | Blog |
| `/blog/[slug]` | Artículo individual |
| `/tienda` | Tienda |
| `/tienda/producto/[id]` | Producto individual |
| `/formulario/[slug]` | Formulario de captura |
| `/embudo/[slug]` | Funnel de ventas |
| `/gracias` | Página de agradecimiento |

### Autenticadas (Miembros)

| Ruta | Descripción |
|------|-------------|
| `/miembros/dashboard` | Resumen general |
| `/miembros/propiedades` | Mis propiedades |
| `/miembros/propiedades/[id]` | Detalle de lote |
| `/miembros/comunidad` | Social Hub |
| `/miembros/comunidad/eventos/[id]` | Live Event |
| `/miembros/academia` | Mis cursos |
| `/miembros/perfil` | Mi perfil |
| `/miembros/facturacion` | Mis facturas |

### Administrativas (SuperAdmin)

| Ruta | Descripción |
|------|-------------|
| `/superadmin/dashboard` | Dashboard principal |
| `/superadmin/proyectos` | Gestión de proyectos |
| `/superadmin/gestion-lotes` | Gestión de lotes |
| `/superadmin/productos` | Gestión de productos |
| `/superadmin/leads` | Gestión de leads |
| `/superadmin/campanas` | Gestión de campañas |
| `/superadmin/usuarios` | Gestión de usuarios |
| `/superadmin/api-nube` | Gestión de API Keys |
| `/superadmin/trading` | Herramienta de trading |

---

## Próximos Pasos

1. **FASE 1:** Refactorización de módulo productos
2. **FASE 2:** Motor financiero y alertas de mora
3. **FASE 3:** Generador de contratos y seguridad
4. **FASE 4:** Experiencia unificada del miembro

---

**Mantenido por:** Xpand Capital Development Team  
**Próxima revisión:** 2026-07-08
