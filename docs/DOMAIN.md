# BLIS CORP - Diccionario de Dominio

> **Versión:** 1.0  
> **Última actualización:** 2026-04-08  
> **Estado:** Documentación Oficial

---

## Glosario de Términos

### Entidades Principales

| Término | Definición |
|---------|------------|
| **Empresa** | Entidad multi-tenant. Cada empresa tiene su propio branding, dominio y datos completamente aislados de otras empresas. |
| **SuperAdmin** | Usuario con acceso total a TODAS las empresas y funciones del sistema. Puede ver API Keys encriptadas. |
| **Socio de Proyecto** | Usuario que puede gestionar proyectos y editar precios dentro de una empresa. Todos los cambios quedan registrados en el Log de Auditoría. Ejemplo: Franklin. |
| **Asesor** | Usuario que solo puede ver sus clientes asignados y descargar sus documentos. No puede editar precios ni ver API Keys. |
| **Socio** | Cliente que compró productos digitales (eBooks, cursos, asesorías). Tiene cuenta para descargar sus productos. |
| **Propietario** | Cliente que compró lotes inmobiliarios. Puede o no tener cuenta (el asesor puede cargar sus datos manualmente). |
| **Empleado** | Personal interno de Blis Corp con acceso limitado según su rol. |
| **Lead** | Persona interesada que dejó sus datos en una campaña de marketing. No requiere tener cuenta. |
| **Usuario** | Término genérico que se refiere a cualquier persona con cuenta en la plataforma. |

---

## Modelos de Negocio

### Módulo Inmobiliario

#### Proyecto

```
Proyecto Inmobiliario
│
├── Ejemplos: Montebello, Villa Victoria
│
├── Estados:
│   ├── EN PLANOS (Sin construcción)
│   ├── PREVENTA (Ventas anticipadas)
│   ├── VENTA CON ESCRITURA (Firma activa)
│   ├── VENTA FINALIZADA (Agotado)
│   └── PROYECTO ENTREGADO (Construido)
│
└── Características:
    ├── Logo y colores personalizables
    ├── Fechas de firma y escritura
    └── Sincronización con Notion (import only)
```

#### Lote

```
Lote (Unidad de Venta)
│
├── Identificación:
│   ├── lot_number: "Lote 01", "Lote 02", etc.
│   ├── lot_area: Metros cuadrados
│   └── proyecto_id: Proyecto al que pertenece
│
├── Estados:
│   ├── Disponible (Sin interés)
│   ├── Reservado (Arras entregadas)
│   ├── Vendido (Contrato firmado)
│   └── Desistido (Cliente perdió el lote)
│
├── Propietario:
│   ├── owners[]: Array de propietarios (puede ser más de uno)
│   └── client_name: Nombre principal
│
├── Precios:
│   ├── total_price: Precio final negociado
│   ├── expected_quota: Cuota mensual esperada
│   └── initial_payment_expected: Inicial esperada
│
└── Pagos (JSONB tipado):
    ├── initial_payments[]: Pagos de arranque/arras
    ├── payments[]: Cuotas mensuales
    └── abonos_extraordinarios[]: Pagos extra
```

#### Flujo de Estados de Lote

```
┌─────────────────────────────────────────────────────────────────┐
│                    MáQUINA DE ESTADOS DE LOTE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                 │
│  │ DISPONIBLE  │←─────────────────────────────────────────┐     │
│  └──────┬──────┘                                          │     │
│         │                                                 │     │
│         │ Cliente entrega arras                           │     │
│         │ (monto pequeno, ~$500-$1000)                    │     │
│         ▼                                                 │     │
│  ┌─────────────┐                                          │     │
│  │  RESERVADO  │──────────────────────────────────────┐│     │
│  └──────┬──────┘       Cliente desiste              │     │
│         │              (pierde arras)                │     │
│         │                                        ▼     │     │
│         │ Firma contrato + Inicial completa      ┌─────────────┐
│         │ (monto grande, +$5000)                  │ DISPONIBLE  │
│         ▼                                        └─────────────┘
│  ┌─────────────┐
│  │   VENDIDO   │
│  └──────┬──────┘
│         │
│         │ Cliente no paga + 30 días
│         │ (pierde todo lo abonado)
│         ▼
│  ┌─────────────┐
│  │  DESISTIDO│
│  └──────┬──────┘
│         │
│         │ Transferencia a otro lote│         │ (familiar, etc.)
│         ▼
│    (Nuevo Lote con mismo propietario)│
│
└─────────────────────────────────────────────────────────────────┘
```

---

### Sistema de Pagos

#### Estructura de Pagos

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRUCTURA FINANCIERA DE LOTE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRECIO TOTAL DEL LOTE: $50,000                                 │
│  │                                                               │
│  ├── INICIAL ESPERADA: $10,000                                  │
│  │   └── Pagos de arranque/arras (JSONB)                        │
│  │       ├── Pago 1: $500 (arras)                               │
│  │       ├── Pago 2: $4,500 (inicial)                           │
│  │       └── Pago 3: $5,000 (refuerzo)                          │
│  │                                                               │
│  ├── CUOTAS MENSUALES: $500 x 60 meses = $30,000                │
│  │   └── payments[] (JSONB)                                     │
│  │       ├── "2024-01": $500 (CUOTA_REGULAR)                    │
│  │       ├── "2024-02": $500 (CUOTA_REGULAR)                    │
│  │       ├── "2024-03": $800 (CUOTA_REGULAR + extra)            │
│  │       └── "2024-04": $500 (CUOTA_REGULAR)                     │
│  │                                                               │
│  └── ABONOS EXTRAORDINARIOS (opcionales)                        │
│      └── abonos_extraordinarios[] (JSONB)                        │
│          ├── "Abono extra enero": $2,000 (ABONO_EXTRAORDINARIO) │
│          └── "Transferencia familiar": $1,500 (ABONO_EXTRAORDINARIO)│
│                                                                  │
│  ════════════════════════════════════════════════════════════│
│                                                                  │
│  SALDO FINAL PENDIENTE:                                         │
│  = PRECIO TOTAL│
│    - INICIAL PAGADA│
│    - CUOTAS PAGADAS│
│    - ABONOS EXTRAORDINARIOS                                     │
│                                                                  │
│  Ejemplo:│
│  $50,000 - $10,000 - $6,300 - $3,500 = $30,200                 │
│                                                                  │
│  ══════════════════════════════════════════════════════════════ │
│                                                                  │
│  IMPORTANTE: Los ABONOS EXTRAORDINARIOS **SIEMPRE**             │
│  reducen el SALDO FINAL, no adelantan cuotas.                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Clasificación de Pagos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **CUOTA_REGULAR** | Pago mensual esperado según plan | Cuota de Enero: $500 |
| **ABONO_EXTRAORDINARIO** | Pago adicional que reduce saldo final | "Abono extra enero": $2,000 |

#### Cálculo de Saldo Final

```typescript
function calcularSaldoFinal(lote: Lote): number {
  const inicialPagada = lote.initial_payments
    .reduce((acc, p) => acc + p.monto_pagado, 0)
  
  const cuotasPagadas = lote.payments
    .reduce((acc, p) => acc + p.monto_pagado, 0)
  
  const abonosExtra = lote.abonos_extraordinarios
    .reduce((acc, p) => acc + p.monto, 0)
  
  return lote.total_price - inicialPagada - cuotasPagadas - abonosExtra
}
```

---

### Alertas de Mora

#### Sistema de Notificaciones Automáticas

| Días de Mora | Estado | Color | Acciones Automáticas |
|--------------|--------|-------|---------------------|
| 0-4 días | Normal | 🟢 Verde | Ninguna |
| 5-29 días | Gris | 🟡 Amarillo |1. Email automático al cliente |
| | | | 2. WhatsApp automático al cliente |
| | | | 3. Tarea creada al asesor |
| 30+ días | Crítico | 🔴 Rojo |1. Alerta a SuperAdmin |
| | | | 2. Alerta a Socio de Proyecto |
| | | | 3. Email de posible rescisión |
| | | | 4. Nota en el lote |

---

### Sistema de Contratos

#### Plantillas de Contrato

```
CONTRATO_PLANTILLA
│
├── Por Proyecto o Genérica
│   ├── Puede ser específica de un proyecto
│   └── O genérica para toda la empresa│
├── Cláusulas Editables
│   ├── Cada cláusula tiene contenido con variables
│   ├── Ejemplo: "El PROPIETARIO {{PROPIETARIO_NOMBRE}}..."│
    └── Variables se reemplazan al generar contrato
│
├── Opciones Múltiples (si aplica)
│   ├── Una cláusula puede tener varias opciones
│   ├── Ejemplo Cláusula de Financiamiento:
│   │   ├── Opción A: "Financiamiento en 60 cuotas"
│   │   ├── Opción B: "Financiamiento en 48 cuotas"
│   │   └── Opción C: "Pago al contado"│
    └── Solo se elige UNA opción al exportar
│
└── Generación
    ├── Se importa a cada lote
    ├── Se edita según negociación
    ├── Se reemplazan variables
    └── Se exporta a PDF
```

**Variables Disponibles:**

| Variable | Descripción |
|----------|-------------|
| `{{PROPIETARIO_NOMBRE}}` | Nombre completo del propietario |
| `{{PROPIETARIO_DOCUMENTO}}` | DNI/RUC del propietario |
| `{{LOTE_NUMERO}}` | Número del lote |
| `{{LOTE_AREA}}` | Área en m² |
| `{{PROYECTO_NOMBRE}}` | Nombre del proyecto |
| `{{PRECIO_TOTAL}}` | Precio total negociado |
| `{{CUOTA_MENSUAL}}` | Valor de la cuota mensual |
| `{{FECHA_FIRMA}}` | Fecha de firma del contrato |
| `{{FECHA_ESCRITURA}}` | Fecha estimada de escritura |

---

### Módulo de E-Commerce

#### Tipos de Producto

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **digital** | Producto descargable | eBook, PDF, Plantilla |
| **fisico** | Producto con envío | Libro físico, Merch |
| **servicio** | Servicio profesional | Asesoría, Consultoría |
| **suscripcion** | Membresía recurrente | Acceso premium mensual |

#### Estados de Producto

| Estado | Descripción |
|--------|-------------|
| **borrador** | No visible en tienda |
| **activo** | Visible y disponible |
| **destacado** | Visible en portada |
| **agotado** | Sin stock |

---

### Sistema de Leads

#### Flujo de Conversión

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUNNEL DE CONVERSIÓN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LANDING PAGE                                                   │
│  │                                                               │
│  │ Usuario completa formulario                                   │
│  ▼                                                               │
│  LEAD (Estado: nuevo)                                           │
│  │                                                               │
│  │ Asesor contacta                                               │
│  ▼                                                               │
│  LEAD (Estado: contactado)                                      │
│  │                                                               │
│  │ Se evalúa interés                                             │
│  ▼                                                               │
│  LEAD (Estado: calificado)                                      │
│  │                                                               │
│  ├── Si compra productos digitales                              │
│  │   └── LEAD → SOCIO (tiene cuenta)                            │
│  │                                                               │
│  ├── Si compra lote                                             │
│  │   └── LEAD → PROPIETARIO (creado en lote)                    │
│  │                                                               │
│  └── Si no compra                                               │
│      └── LEAD (Estado: perdido)                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Asignación de Leads

```
CAMPANA┐
       │
       ├── asesor_id (Asesor asignado por defecto)
       │
       └── emails_notificacion[] (Lista de emails)
│
LEAD
       │
       ├── campana_id (Origen de la campaña)
       │
       ├── asesor_id (Asesor asignado)
       │
       └── utm_source, utm_medium, utm_campaign (Tracking)
```

---

### Módulo de Comunidad

#### Social Hub

```
Features:
│
├── Feed de Publicaciones (tipo BuddyBoss)
│   ├── Posts de texto
│   ├── Imágenes
│   ├── Enlaces
│   └── Likes y comentarios
│
├── Grupos Privados por Proyecto
│   ├── Solo propietarios de ese proyecto
│   ├── Chat grupal│
│   └── Documentos compartidos
│
├── Eventos en Vivo│
│   ├── Stream HLS/RTMP
│   ├── Chat propio (no de Meet)
│   ├── Botón "Participar en vivo"→ Meet/Zoom
│   └── BlisCoins automáticos por asistencia
│
└── Sistema de Mensajería
    ├── Chat directo
    └── Notificaciones
```

#### Live Events

```
LIVE_EVENT
│
├── Información Básica
│   ├── titulo: string
│   ├── descripcion: string
│   ├── tipo: 'webinar' | 'presentacion' | 'qya' | 'social' | 'entrevista'
│   └── imagen_portada: string
│
├── Streaming
│   ├── stream_url: string (HLS/RTMP)
│   ├── stream_tipo: 'hls' | 'rtmp' | 'youtube' | 'vimeo' | 'meet_embed'
│   ├── sala_externa_url: string (Link a Meet/Zoom original)
│   └── participacion_habilitada: boolean│
├── Chat Propio
│   ├── chat_habilitado: boolean│   ├── chat_moderado: boolean│   └── mensajes[]: LiveEventMensaje│
├── Gamificación
│   ├── coins_por_minuto: number (default: 1)
│   ├── coins_bonus_asistir: number│
    └── Sistema de Heartbeat (pulso cada60 segundos)
│
└── Métricas
    ├── vistas_total: number
    ├── participantes_unicos: number
    ├── pico_concurrentes: number
    └── mensajes_chat_total: number
```

---

### Sistema de BlisCoins

#### Ganancia de BlisCoins

| Acción | BlisCoins Ganados | Frecuencia |
|--------|-------------------|------------|
| Lectura completa de artículo | +5 | Una vez por artículo |
| Completar curso | +50 | Una vez por curso |
| Registrar referido | +100 | Una vez por referido |
| Asistir a evento en vivo | +1 por minuto | Por minuto activo |
| Comprar producto | Variable | Por compra |

#### Uso de BlisCoins

| Uso | Descripción |
|-----|-------------|
| Comprar eBook | Precio en BlisCoins mostrado |
| Descuento en cursos | % de descuento con BlisCoins |
| Productos exclusivos | Solo disponibles con BlisCoins |

---

### Templates y Landing Pages

#### Tipos de Template

| Tipo | Descripción | Principal|
|------|-------------|-----------|
| **landing** | Página principal del sitio | Solo uno puede ser principal |
| **blog** | Blog del sitio | Solo uno puede ser principal |
| **funnel** | Página de captura | Múltiples activos |

#### Sistema de Versiones

```
TEMPLATE
│
├── Estado: 'borrador' | 'activo' | 'archivado'
│
├── es_principal: boolean
│   └── Solotrue para landing/blog principal
│
├── slug: string
│   └── URL pública: /blog/[slug] o /funnel/[slug]
│
└── secciones: JSONB│
    ├── captureHero (formulario de leads)
    ├── features (características)
    ├── testimonials (testimonios)
    └── ... más secciones
```

Duplicar Template:
1. Crear copia del template existente
2. Modificar contenido
3. Activar cuando esté listo
4. Marcar como principal si es necesario

---

### Templates y Marketing

#### Tipos de Template

| Tipo | Descripción | URL |
|------|-------------|-----|
| **landing** | Página principal | `/` (dominio principal) |
| **blog** | Blog del sitio | `/blog/[slug]` |
| **funnel** | Página de captura | `/funnel/[slug]` |

#### Sistema de Activación

```
Templates Activos:
│
├── Solo UNO puede ser "landing principal"
│   └── Se muestra en el dominio raíz│
├── Solo UNO puede ser "blog principal"
│   └── Se muestra en /blog│
└── Múltiples "funnel" activos
    ├── Cada uno con su slug│
    └── Accesibles en /funnel/[slug]
```

---

## Tipos de Datos

### Usuario Unificado

```typescript
interface User {
  id: string
  empresa_id?: string
  
  // Datos básicos
  email: string
  nombre: string
  apellido?: string
  
  // Roles
  roles: ('superadmin' | 'socio_proyecto' | 'asesor' | 'socio' | 'propietario' | 'empleado')[]
  
  // Si es propietario
  propietario_id?: string
  lotes?: Lote[]
  
  // Si es socio
  productos_digitales?: Producto[]
  blis_coins: number
  
  // Si es asesor
  clientes_asignados?: Propietario[]
  comisiones?: Comision[]
}
```

### Propietario vs Socio

| Característica | Propietario | Socio |
|----------------|-------------|-------|
| Compró | Lotes inmobiliarios | Productos digitales |
| Tiene cuenta | Opcional | Obligatoria |
| Ve en portal | Mis Propiedades | Mi Academia |
| Datos cargados por | Asesor o sí mismo | Registro automático |

---

## Flujo de Datos Completo

### 1. Captura de Lead

```
Usuario en Landing (Template)
     │
     ├── Ve formulario de captura│
     └── Completa datos
     │
     ▼
POST /api/leads
     │
     ├── Guarda en tabla `leads`
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
Asesor actualiza Lote
     │
     ├── Estado: Disponible → Reservado│
     ├── Registra arras (pago inicial parcial)
     └── Asigna propietario
     │
     ▼
Cliente firma contrato│
     │
     ├── Sube PDF a Lote
     │
     ├── Estado: Reservado → Vendido
     │
     └── Registra pagos iniciales
     │
     ▼
Cliente abona mensualmente
     │
     ├── Sistema registra cuotas
     │
     ├── Calcula Saldo Final en tiempo real│
     │
     └── Alertas automáticas si mora
```

### 3. Compra de Producto Digital

```
Cliente en Tienda
     │
     ├── Añade al carrito
     │
     └── Checkout
│
     ▼
Procesa Pago
     │
     ├── BlisCoins / Stripe / PayPal
     │
     ├── Crea orden
     │
     ├── Descuenta stock (si físico)
     │
     ├── Asigna producto (si digital)
     │
     └── Otorga BlisCoins (si aplica)
```

---

## Reglas de Negocio

### 1. Abonos Extraordinarios

**REGLA:** Los abonos extraordinarios SIEMPRE reducen el Saldo Final Pendiente.

**Mensaje al Cliente:** "¡Recibimos tu abono extra de $X! Tu Saldo Final ha bajado a $Y. ¡Estás más cerca de tu escritura!"

### 2. Alertas de Mora

**REGLA:** Mora >5 días genera notificación automática. Mora >30 días genera alerta de rescisión.

### 3. API Keys

**REGLA:** Las API Keys de Binance/otros servicios están encriptadas y solo son visibles para SuperAdmin.

### 4. Auditoría de Precios

**REGLA:** Todo cambio de precio realizado por "Socio de Proyecto" genera un registro inmutable en el Log de Auditoría.

### 5. Multi-Tenancy

**REGLA:** Cada empresa ve SOLO sus propios datos. SuperAdmin ve todas las empresas.

---

## Métricas Clave

### Inmobiliario

| Métrica | Descripción |
|---------|-------------|
| Tasa de Conversión | Leads → Propietarios |
| Tiempo de Venta | Días desde reserva hasta venta |
| Saldo Pendiente Total | Suma de saldos finales de todos los lotes |
| Mora Promedio | Días de mora promedio por proyecto |
| Comisión por Asesor | Total de comisiones generadas |

### E-Commerce

| Métrica | Descripción |
|---------|-------------|
| Tasa de Conversión | Visitantes → Compradores |
| Ticket Promedio | Valor promedio de compra |
| BlisCoins Circulando | Total de BlisCoins en sistema |
| Productos Más Vendidos | Top productos por ventas |

### Marketing

| Métrica | Descripción |
|---------|-------------|
| Costo por Lead | Gasto publicitario / Leads |
| Tasa de Apertura | Emails abiertos / Emails enviados |
| Engagement | Interacciones / Impresiones |

---

**Mantenido por:** BLIS Corp Development Team  
**Próxima revisión:** 2026-07-08