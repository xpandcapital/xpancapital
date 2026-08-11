# MANUAL DEL COPILOTO — Xpand Capital

> **Documento autocontenido** para una IA copiloto de desarrollo.  
> Contiene **absolutamente todo** lo construido, resuelto, pendiente y documentado en este proyecto.  
> **Generado:** 29 Mayo 2026 | **Versión:** 3.0

---

# 1. VISIÓN GENERAL Y ARQUITECTURA

## 1.1 ¿Qué es Xpand Capital?

Plataforma SaaS **multi-tenant** para gestión inmobiliaria. Permite a cada empresa (tenant) gestionar:
- Landing pages personalizables (editor de templates con 15+ secciones)
- Sistema de leads y campañas de marketing
- E-commerce con productos digitales/físicos, XPAND Coins (moneda virtual), pasarelas de pago
- Cursos y certificados (LMS interno)
- Proyectos inmobiliarios con lotes, contratos y sincronización Notion
- Chat en tiempo real con IA
- Cliente de correo integrado (IMAP)
- Terminal de trading
- Punto de venta (POS)
- Y mucho más

## 1.2 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 15.3.8 |
| UI | React | 19.2.3 |
| Base de Datos | Supabase (PostgreSQL) | 2.x |
| Auth | Supabase Auth + middleware propio | — |
| Estilos | Tailwind CSS v4 + shadcn/ui | 4.x |
| Animaciones | Framer Motion | 12.34.3 |
| Íconos | Lucide React | 0.575.0 |
| Lenguaje | TypeScript | 5.x |
| Testing | Vitest + Testing Library | 3.x |
| Email | Nodemailer + IMAP (imapflow) | 8.x / 1.x |
| PDF | Puppeteer + @react-pdf/renderer | 24.x / 4.x |
| Despliegue | Vercel | — |
| Mapas | react-simple-maps | 3.0.0 |
| Gráficos | Recharts | 3.8.1 |

## 1.3 Estructura de Directorios

```
xpancapital/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Autenticación
│   ├── (public)/                 # Páginas públicas
│   ├── login/                    # Página de login
│   ├── miembros/                 # Área de miembros
│   ├── superadmin/               # Panel de administración (31 módulos)
│   │   ├── [_modulo]/_types/     # Tipos del módulo
│   │   ├── [_modulo]/_hooks/     # Hooks del módulo
│   │   └── [_modulo]/_components/# Componentes UI del módulo
│   ├── tienda/                   # Tienda pública
│   ├── blog/                     # Blog público
│   ├── cursos/                   # Cursos públicos
│   ├── proyectos/                # Proyectos públicos
│   ├── embudo/                   # Funnel pages
│   ├── formulario/               # Formularios de captura
│   ├── api/                      # 130+ endpoints API
│   └── ...otras rutas
├── components/
│   ├── sections/                 # 35 secciones de landing
│   ├── tienda/                   # 16 componentes de tienda
│   ├── ui/                       # Componentes UI (shadcn + personalizados)
│   ├── editor/                   # Editor de templates
│   ├── layout/                   # Layout shell y providers
│   └── superadmin/               # Componentes del panel admin
├── context/                      # 11 React Context providers
├── lib/                          # Utilidades, hooks, tipos
│   ├── hooks/                    # 17 hooks globales
│   ├── supabase/                 # Clientes y middleware Supabase
│   ├── security-*.ts             # Sistema de seguridad
│   └── types/                    # Tipos globales
├── hooks/                        # AuthProvider principal
├── public/icons/brands/          # 118 íconos SVG de marcas
├── scripts/                      # Scripts auxiliares (seed, scrape, icons)
├── supabase/migrations/          # 60+ migraciones SQL
├── docs/                         # Documentación
└── tests/                        # Tests (0 implementados)
```

## 1.4 Convenciones del Proyecto

| Convención | Regla |
|------------|------|
| Idioma comunicación | **ESPAÑOL obligatorio** para respuestas, explicaciones, commits |
| Idioma código | Inglés (nombres de variables, funciones, tipos) |
| Nombres componentes | PascalCase (`ProductCard.tsx`) |
| Nombres hooks | camelCase con prefijo `use` (`useProducts.ts`) |
| Tipos | PascalCase (`Product`, `Client`) |
| Archivos módulo | camelCase |
| Imports | Agrupados: React → externos → locales |
| Estilo | Dark mode (#050505) + rojo carmesí (#d5c108) + neón (#f5e100) |
| Mobile-first | Tailwind con prefijos `md:`, `lg:`, `xl:` para escalar |

## 1.5 Módulos Refactorizados vs Sin Refactorizar

| Módulo | Estado | Archivos | Líneas originales |
|--------|--------|----------|-------------------|
| productos | ✅ Completo | 33 | 2,777 → 409 |
| api-nube | ✅ Completo | 17 | 3,404 |
| templates | ✅ Completo | 16 | — |
| correo | ✅ Completo | 16 | — |
| clientes | ✅ Parcial | 20 | 1,601 |
| cursos | ✅ Parcial | 19 | 1,742 |
| proyectos | ✅ Parcial | 14 | 1,243 |
| certificados | ✅ Parcial | 12 | 778 |
| configuracion | ✅ Parcial | 24 | 690 |
| ajustes | ✅ Parcial | 20+ | 687 |
| trading | ✅ Parcial | 13 | (TerminalLogic 325KB) |
| calendarios | ✅ Parcial | 12 | — |
| blog | ✅ Parcial | 8+ | — |
| asesores | ✅ Parcial | 5 | — |
| leads | ❌ Monolítico | 1 | 437 |
| campanas | ❌ Monolítico | 1 | 474 |
| ventas | ❌ Monolítico | 1 | 441 |
| contratos | ❌ Monolítico | 1 | 349 |
| formasdepago | ❌ Monolítico | 1 | 424 |
| biblioteca | ❌ Monolítico | 1 | 273 |
| dashboard | ❌ Monolítico | 1 | 388 |

---

# 2. BASE DE DATOS (SUPABASE)

## 2.1 Tabla `empresas` (Multi-tenant)

Todas las demás tablas referencian `empresas.id`.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Identificador |
| `slug` | VARCHAR | Slug único |
| `nombre` | VARCHAR | Nombre de la empresa |
| `nombre_legal`, `logo_url`, `logo_dark_url`, `favicon_url` | VARCHAR/TEXT | Branding |
| `color_primario`, `color_secundario`, `color_acento` | VARCHAR | Colores corporativos |
| `moneda_base`, `monedas_activas` | VARCHAR/TEXT[] | Configuración monetaria |
| `idioma`, `zona_horaria`, `pais_fiscal` | VARCHAR | Localización |
| `ruc`, `razon_social`, `direccion_fiscal` | VARCHAR | Datos fiscales |
| `dominio_principal`, `dominios_alias` | VARCHAR/TEXT[] | Dominios |
| `activo` | BOOLEAN | Estado |
| `plan` | VARCHAR | CHECK: free/starter/pro/enterprise |
| `plan_limite_usuarios`, `plan_limite_productos`, `plan_limite_almacenamiento` | INTEGER | Límites del plan |
| `dias_garantia_defecto` | INTEGER | DEFAULT 7 |
| `creado_en`, `actualizado_en` | TIMESTAMPTZ | Timestamps |

## 2.2 Tabla `profiles` (Perfiles de Usuario)

50+ columnas. Las más importantes:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | = auth.users.id |
| `empresa_id` | UUID FK | Empresa a la que pertenece |
| `email` | TEXT | NOT NULL |
| `nombre`, `apellido` | TEXT | Datos personales |
| `rol` | TEXT | CHECK: usuario/cliente/editor/admin/superadmin/empleado |
| `blis_coins` | INTEGER | Saldo de moneda virtual |
| `verificado` | BOOLEAN | Email verificado |
| `codigo_referido`, `referido_por` | TEXT/UUID | Sistema de referidos |
| `permisos_adicionales` | JSONB | Permisos extra/denegados |
| `estado_chat` | TEXT | online/ausente/ocupado/offline |
| `total_compras`, `total_gastado_usd` | INTEGER/DECIMAL | Historial de compras |
| `departamento` | TEXT | Departamento (RRHH) |
| `ultimo_login` | TIMESTAMPTZ | Último acceso |

**Índices:** `idx_profiles_empresa_estado`, `idx_profiles_empresa_rol`  
**RLS:** `profiles_select_same_empresa` (empresa-scoping), `profiles_update_own_estado_chat` (solo propio)

## 2.3 Tabla `productos` (E-commerce)

40+ columnas:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Identificador |
| `empresa_id` | UUID FK | Multi-tenant |
| `nombre`, `slug` | TEXT | Nombre y slug |
| `tipo` | TEXT | CHECK: digital/fisico/servicio/suscripcion |
| `categoria_id` | UUID FK | → producto_categorias |
| `curso_id` | UUID FK | → cursos (si es curso vendible) |
| `precio_usd`, `precio_coins` | DECIMAL/INTEGER | Precios |
| `metodo_pago` | TEXT | CHECK: coins/dinero/ambos |
| `stock`, `stock_ilimitado` | INTEGER/BOOLEAN | Inventario |
| `imagen_principal`, `galeria` | TEXT/TEXT[] | Imágenes |
| `estado` | VARCHAR | CHECK: borrador/activo/pausado/archivado |
| `destacado`, `activo` | BOOLEAN | Flags |
| `descuento_porcentaje`, `tipo_descuento`, `descuento_hasta` | DECIMAL/DATE | Descuentos |
| `sku`, `sku_prefix`, `is_auto_sku` | VARCHAR/BOOLEAN | SKU |
| `es_perecedero`, `fecha_vencimiento`, `lote_uid` | BOOLEAN/DATE/VARCHAR | Productos perecederos |
| `comision_activo`, `comision_tipo`, `comision_valor` | BOOLEAN/TEXT/DECIMAL | Sistema de comisiones |

**Importante:** `tipo` es clasificación interna (digital/fisico/servicio/suscripcion). NUNCA usar `tipo` para mostrar categoría al usuario. Siempre usar `categoria.nombre`.

## 2.4 Tabla `producto_categorias`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Identificador |
| `empresa_id` | UUID FK | Multi-tenant |
| `nombre`, `slug` | VARCHAR(100) | Nombre y slug |
| `sku_prefix` | VARCHAR(10) | Prefijo para SKU |
| `icono`, `color` | VARCHAR(50/20) | Estilo visual |
| `orden` | INTEGER | Ordenamiento |
| `activo` | BOOLEAN | Estado |

## 2.5 Tabla `compras` (Órdenes)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Número de orden |
| `empresa_id`, `user_id`, `producto_id` | UUID FK | Relaciones |
| `metodo_pago` | TEXT | CHECK: izipay/paypal/coins/bliscoins/transfer/transferencia/crypto_manual/whatsapp/efectivo/tarjeta/otro/cash/card/manual |
| `monto_coins`, `monto_usd` | INTEGER/DECIMAL | Montos |
| `estado` | TEXT | CHECK: pendiente/completado/cancelado/reembolsado |
| `transaction_id` | TEXT | ID de la pasarela de pago |
| `referido_por` | UUID | Sistema de referidos |

## 2.6 Tabla `compra_items`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Identificador |
| `compra_id` | UUID FK | → compras(id) ON DELETE CASCADE |
| `producto_id` | UUID FK | → productos(id) ON DELETE SET NULL |
| `cantidad` | INTEGER | DEFAULT 1 |
| `precio_unitario` | DECIMAL(10,2) | Precio unitario |
| `subtotal` | DECIMAL(10,2) | **GENERATED ALWAYS AS (cantidad * precio_unitario) STORED** |
| `product_type` | TEXT | DEFAULT 'digital' |

## 2.7 Tabla `cursos` (LMS)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Identificador |
| `empresa_id` | UUID FK | Multi-tenant |
| `nombre`, `slug`, `descripcion` | TEXT | Datos básicos |
| `modulos` | JSONB | Estructura: `[{id, titulo, lecciones: [{id, titulo, tipo, contenido, videoUrl, preguntas}]}]` |
| `precio_coins`, `precio_usd` | INTEGER/DECIMAL | Precios |
| `max_intentos`, `nota_aprobacion` | INTEGER | Evaluación |
| `certificado_template_id` | UUID FK | → certificado_plantillas |
| `instructor_id` | UUID FK | → advisors |
| `activo` | BOOLEAN | Estado |
| `para_equipo` | BOOLEAN | Para capacitación de empleados |
| `sequential_progress` | BOOLEAN | Progreso secuencial obligatorio |
| `require_completion` | BOOLEAN | Requiere completar para aprobar |
| `imagen_principal` | TEXT | Imagen de portada |

## 2.8 Tabla `templates` (Landing Pages)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Identificador |
| `empresa_id` | UUID FK | Multi-tenant |
| `nombre`, `slug` | VARCHAR(100) | Nombre y slug |
| `tipo_contenido` | VARCHAR(30) | CHECK: landing/blog/blog_post/tienda/producto/curso/leccion/proyecto/funnel/captura/checkout/thankyou/legal |
| `estado` | VARCHAR(20) | CHECK: borrador/revision/listo/activo |
| `es_principal` | BOOLEAN | Template por defecto |
| `secciones` | JSONB | Contenido de todas las secciones |
| `sectionOrder` | TEXT[] | Orden de secciones |
| `sectionVisibility` | JSONB | Visibilidad por sección |
| `config` | JSONB | Configuración (customHeader, customFooter, branding) |
| `meta_titulo`, `meta_descripcion`, `meta_keywords`, `og_imagen` | VARCHAR/TEXT | SEO |
| `thumbnail_url`, `descripcion` | TEXT | Metadata |

## 2.9 Tabla `leads`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Identificador |
| `empresa_id` | UUID FK | Multi-tenant |
| `campana_id` | UUID FK | → campanas |
| `asesor_id` | UUID FK | → asesores |
| `template_id` | UUID FK | → templates |
| `nombre`, `email`, `telefono`, `whatsapp` | TEXT | Datos de contacto |
| `datos` | JSONB | Datos adicionales del formulario |
| `ciudad`, `presupuesto`, `interes`, `mensaje` | TEXT | Información del lead |
| `estado` | TEXT | CHECK: nuevo/contactado/calificado/interesado/oportunidad/cliente/perdido |
| `temperatura` | VARCHAR(20) | CHECK: frio/tibio/caliente |
| `score` | INTEGER | Puntuación del lead |
| `fuente` | VARCHAR(50) | Origen del lead |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | VARCHAR | UTM tracking |

## 2.10 Tabla `campanas`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | Identificador |
| `empresa_id` | UUID FK | Multi-tenant |
| `asesor_id` | UUID FK | → asesores |
| `nombre`, `descripcion` | TEXT | Datos básicos |
| `estado` | TEXT | CHECK: borrador/activa/pausada/finalizada |
| `notificar_email`, `notificar_whatsapp` | BOOLEAN | Notificaciones |
| `emails_notificacion`, `whatsapp_notificacion` | TEXT[] | Destinatarios |
| `notion_database_id` | TEXT | Base de datos Notion |
| `notion_sync` | BOOLEAN | Sincronización con Notion |

## 2.11 Tablas Restantes (Resumen Rápido)

| Tabla | Propósito | Columnas clave |
|-------|-----------|----------------|
| `asesores` | Asesores/empleados | nombre, email, telefono, whatsapp, comision, puesto, rol |
| `advisors` | Versión extendida de asesores | 30+ campos (documento, residencia, estudios, herramientas, auth_user_id) |
| `integraciones` | Config de integraciones | tipo (whatsapp/email/notion/zapier/webhook), config JSONB |
| `blog_posts` | Blog | titulo, slug, contenido, extracto, autor, estado, contrasena, visibilidad |
| `blog_categorias` | Categorías de blog | nombre, slug, descripcion |
| `email_templates` | Plantillas de email | nombre, settings JSONB, blocks JSONB, evento |
| `email_senders` | Remitentes de email | from_name, from_email, provider, smtp_host, smtp_port, api_key |
| `email_campaigns` | Campañas de email | template_id, sender_id, subject, recipients JSONB |
| `email_media` | Medios de email | url, tipo, categoria |
| `email_servidores` | Servidores IMAP/SMTP | dominio, imap_host, imap_port, smtp_host, smtp_port |
| `email_cuentas` | Cuentas de email | email, password_enc, servidor_id, user_id |
| `certificado_plantillas` | Plantillas de certificados | nombre, fondo_url, fuentes, colores, posiciones |
| `projects` | Proyectos inmobiliarios | name, status, location, cover_image, gallery_images, notion_database_id |
| `project_lots` | Lotes de proyecto | lot_number, lot_area, client_name, total_price, status |
| `notion_receipts` | Recibos desde Notion | receipt_number, amount, date, receipt_type, lot_number |
| `chat_salas` | Salas de chat | tipo (directo/grupal/soporte/ventas/ia/visitante), estado |
| `chat_miembros` | Miembros de sala | user_id, rol_sala (admin/miembro/observador) |
| `chat_mensajes` | Mensajes de chat | tipo (texto/imagen/video/audio/archivo/sistema/ia), contenido |
| `chat_config` | Config del chat | widget_activo, ia_activa, horarios, mensajes |
| `chat_plantillas` | Respuestas rápidas | titulo, contenido, categoria |
| `chat_visitantes` | Visitantes del chat | session_id, nombre, email, pagina_origen |
| `chat_presencia` | Presencia de usuarios | user_id, estado, ultima_actividad |
| `notificaciones` | Notificaciones | tipo (sistema/chat/lead/venta/alerta), titulo, mensaje, leido |
| `push_subscriptions` | Web push | endpoint, keys, user_id, browser, device_type |
| `postulantes` | Postulantes a empleo | 30+ campos (puesto, experiencia, cv_url, correo_corporativo) |
| `site_config` | Config del sitio | 30+ campos (branding, SEO, redes, footer, seguridad) |
| `empresa_config` | Config por empresa | features toggle (blog, tienda, academia, referidos, coins, envíos) |
| `roles` | Roles del sistema | nombre, label, permisos JSONB, color, orden |
| `boveda_transacciones` | Transacciones XPAND Coins | tipo, monto, balance_antes, balance_despues |
| `equipo_cursos` | Cursos asignados a empleados | advisor_id, curso_id, progreso, lecciones_completadas |
| `equipo_productos` | Productos asignados a empleados | advisor_id, producto_id, estado |
| `carritos` | Carrito de compras | user_id, items JSONB, total, subtotal, impuesto, descuento |
| `favoritos` | Productos favoritos | user_id, producto_id |
| `formas_pago` | Métodos de pago | nombre, slug, tipo, config JSONB, activo |
| `biblioteca_libros` | Biblioteca | titulo, autor, categoria, portada, descripcion, download_link |
| `short_links` | Links acortados | url, codigo, clicks, ultimo_click |
| `security_logs` | Logs de seguridad | ip, pais, ruta, metodo, motivo, user_agent |
| `security_alerts` | Alertas de seguridad | tipo, nivel, mensaje, datos JSONB |
| `login_history` | Historial de login | user_id, ip, pais, user_agent |
| `site_config.security_config` | Config seguridad | geobloqueo, security_headers, rate_limiting, alerts (JSONB) |
| `api_keys` | API keys cifradas | servicio, key_name, key_value (cifrada), user_id, is_global |
| `monedas_config` | Config de monedas | moneda_base, monedas_activas, margen_seguridad |
| `tasas_cambio` | Tasas de cambio | moneda_origen, moneda_destino, tasa |
| `unidades_medida` | Unidades de medida | nombre, abreviatura, tipo (weight/volume/quantity/distance/other) |
| `producto_estados` | Estados de producto | nombre, slug, color, icono, orden |
| `sku_patrones` | Patrones SKU | nombre, prefijo |
| `envio_zonas` | Zonas de envío | nombre, regiones, precio_base, precio_por_gramo |
| `usuario_preferencias` | Preferencias de usuario | tema, idioma, moneda_preferida, notificaciones |
| `historial_ventas_pos` | Historial POS | items JSONB, subtotal, total, metodo_pago |
| `landing_secciones` | Secciones landing legacy | seccion, contenido JSONB |

## 2.12 Funciones SQL, Triggers y RLS

### Triggers
- `update_template_updated_at` → templates
- `update_lead_updated_at` → leads
- `trigger_nuevo_lead` → notificar_nuevo_lead()
- `update_postulantes_updated_at` → postulantes
- `trigger_lead_notificacion` → notificar_nuevo_lead()
- `notificar_nueva_venta` → compras
- `update_sala_ultima_actividad` → chat_salas

### Funciones
- `notificar_nuevo_lead()` — Notifica por email/WhatsApp/Notion cuando se crea un lead
- `notificar_nueva_venta()` — Notifica cuando se completa una compra
- `track_short_link_click()` — Incrementa contador de clicks en short_links
- `array_append_unique()` — Helper para arrays en chat
- `get_user_salas()` — RPC que retorna IDs de salas de chat del usuario
- `get_biblioteca_libros_admin()` — RPC para obtener libros con permisos

### RLS (Row Level Security)
- **Todas las tablas tienen RLS habilitada**
- La mayoría usa `empresa-scoping`: usuarios solo ven datos de su empresa
- Lectura pública en: landing_secciones, blog_categorias, producto_estados, unidades_medida, envio_zonas, monedas_config, tasas_cambio
- Inserción pública en: leads (para formularios web), blog_comments
- El service_role tiene bypass total de RLS

## 2.13 Seed y Datos Iniciales

- **Templates por defecto** (migraciones 024-028): thankyou, captura, funnel
- **Template landing completo** (seed-default-template.ts, ejecutado via `npm run seed`)
- **Roles** (migración 053): usuario, cliente, editor, admin, superadmin, empleado
- **Formas de pago** (migración 090): izipay, coins, transferencia, crypto_manual, whatsapp, efectivo, tarjeta
- **71 plantillas de email** (seed-email-event-templates.ts): transacciones, cuenta, empleados, cursos, leads, admin, comunicación, seguridad, documentos

---

# 3. AUTENTICACIÓN, ROLES Y PERMISOS

## 3.1 Flujo de Autenticación

```
Request HTTP
  │
  ▼
middleware.ts (Next.js)
  ├─ ¿Ruta pública sin cookie? → NextResponse.next() (0 consultas)
  ├─ getSecurityConfig() (cache 30s)
  ├─ GeoBlock → 403 si país bloqueado
  ├─ Rate Limit → 429 si excedido
  ├─ updateSession(request) → supabase.auth.getUser()
  │   ├─ NO autenticado + ruta protegida → redirect /login
  │   ├─ SI autenticado + /login → redirect según rol
  │   └─ Inyecta headers: x-blis-user-id, x-blis-user-rol, x-blis-empresa-id
  └─ Security Headers → injectHeaders()
```

**Rutas públicas:** `/`, `/blog`, `/tienda`, `/cursos`, `/proyectos`, `/verificar`, `/gracias`, `/f`, `/formulario`, `/embudo`, `/calendario`, `/certificado`, `/login`, `/embed`, `/legal`, `/s`

**Rutas protegidas:** `/superadmin/*`, `/miembros/*`, `/admin/*`

## 3.2 Roles y Permisos

| Rol | Permisos | Ruta por defecto |
|-----|----------|------------------|
| `superadmin` | `*` (todo) | `/superadmin` |
| `admin` | `*` (todo) | `/superadmin` |
| `editor` | 65 permisos (crear/editar/ver, sin eliminar) | `/superadmin` |
| `empleado` | 18 permisos (solo ver) | `/superadmin` |
| `cliente` | miembros:ver, facturacion:ver, perfil:* | `/miembros` |
| `usuario` | miembros:ver, perfil:* | `/miembros` |

**Permisos adicionales:** El campo `permisos_adicionales` en `profiles` permite agregar (`extra`) o quitar (`denied`) permisos específicos por usuario, por encima de los del rol.

**138 permisos totales** organizados en categorías: dashboard, proyectos, lotes, contratos, asesores, pos, ventas, formas de pago, productos, clientes, ajustes, cursos, capacitaciones, certificados, trading, chat, templates, mails, calendarios, formularios, leads, campañas, notificaciones, blog, equipo, postulantes, puestos, preguntas, utilidades, configuracion, api-nube, analiticas, roles, empresas, perfil, miembros, facturación.

## 3.3 AuthProvider (`hooks/useAuth.tsx`)

**Estados:** `user`, `loading`  
**Funciones:** `loginWithEmail(email, password)`, `signUp(email, password, nombre?, apellido?)`, `logout()`, `updateProfile()`, `refreshUser()`  
**Cache:** localStorage clave `blis_auth_user`  
**Timeout:** 8 segundos fuerza `loading=false`

## 3.4 Sistema de Permisos (`hooks/usePermissions.ts`)

**Fuentes de permisos (en orden de prioridad):**
1. API `/api/admin/roles` → busca por `nombre === user.role` → `permisos[]`
2. Fallback: `ROLE_DEFAULTS[rol]`
3. Aplica `permisos_adicionales.extra` (añadir) y `.denied` (quitar)
4. Si contiene `*`, añade explícitamente `*`

**Funciones:** `hasPermission(p)`, `canAccessSection(path)`, `canDoAction(section, action)`

## 3.5 Sistema de Seguridad

### Capas
1. **Geobloqueo** (`lib/geoblock.ts`): 30 países bloqueados por defecto, ~100 permitidos. Configurable desde BD.
2. **Rate Limiting** (`lib/rate-limit.ts`): Token bucket in-memory. Límite por IP + ruta + método.
3. **Bot Protection** (`lib/bot-protection.ts`): Cloudflare Turnstile.
4. **Security Headers** (`lib/security-headers.ts`): CSP, HSTS, X-Frame-Options, etc.
5. **Alertas** (`lib/security-alerts.ts`): Contadores in-memory + reglas de spike/anomalía → webhook/email.
6. **Login Tracking** (`lib/login-tracker.ts`): Detecta logins desde nuevos países → alerta.
7. **AI Security Scanner** (`lib/security-scanner.ts`): Gemini analiza 8 queries en paralelo (admins nuevos, XSS en templates/leads, spam, logins anómalos, volumen de bloqueos).

---

# 4. API REFERENCE (130+ ENDPOINTS)

## 4.1 Ecommerce / Pagos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/checkout` | Pública | Checkout completo: crea usuario, registra compra, descuenta coins, asigna cursos, envía email |
| GET | `/api/compras?user_id=` | Pública | Lista compras con items, productos y categorías |
| POST | `/api/compras` | Service key | Crea compra (usada por ShopContext) |
| POST | `/api/paypal/create-order` | Service key | Crea orden PayPal + orden en BD |
| POST | `/api/paypal/capture-order` | Pública | Captura orden PayPal, actualiza BD |
| POST | `/api/paypal-webhook` | Webhook | Procesa eventos PayPal |
| POST | `/api/izipay-confirm` | Pública | Confirmación de pago Izipay |
| POST | `/api/izipay-webhook` | Webhook | Webhook Izipay |
| GET | `/api/get-izipay-token` | Pública | Token de autenticación Izipay |

## 4.2 Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PUT/DELETE | `/api/admin/ventas` | CRUD ventas + logs |
| GET/PUT/DELETE | `/api/admin/clientes` | CRUD clientes (+ 9 sub-rutas: orders, history, academia, referrals, etc.) |
| GET/PUT/DELETE | `/api/admin/users` | CRUD usuarios |
| POST/PUT/DELETE | `/api/admin/equipo` | CRUD empleados (crea auth user + profile + advisor) |
| GET/POST/PUT/DELETE | `/api/admin/cursos` | CRUD cursos (con link a producto para tienda) |
| GET/POST/PUT/DELETE | `/api/admin/projects` | CRUD proyectos (+ lotes, Notion sync) |
| GET/POST/PUT/DELETE | `/api/admin/empresa` | CRUD empresas multi-tenant |
| GET/POST/PUT/DELETE | `/api/admin/roles` | CRUD roles |
| GET/POST/PUT/DELETE | `/api/admin/permisos` | CRUD permisos |
| GET | `/api/admin/stats` | Estadísticas del dashboard |
| GET/POST | `/api/admin/formas-pago` | Gestión métodos de pago |
| GET/POST/PUT/DELETE | `/api/admin/biblioteca` | CRUD biblioteca de libros |
| GET/POST | `/api/admin/api-keys` | Gestión API keys (215 keys, cifradas) |
| POST | `/api/admin/api-keys/test` | Test de conexión para 70+ APIs |
| GET/POST | `/api/admin/seguridad` | Config de seguridad |
| GET | `/api/admin/seguridad/logs` | Logs de seguridad |
| GET | `/api/admin/seguridad/dashboard` | Dashboard de seguridad |
| GET | `/api/admin/seguridad/alerts` | Alertas de seguridad |
| GET | `/api/admin/seguridad/login-history` | Historial de logins |
| POST | `/api/admin/seguridad/scanner` | AI security scanner |
| POST | `/api/admin/run-migration` | Ejecutar migraciones |
| POST | `/api/admin/create-user` | Crear usuario |
| POST | `/api/admin/sync-auth-metadata` | Sincronizar metadata de auth |

## 4.3 Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PUT/DELETE | `/api/productos` | CRUD productos |
| GET/POST | `/api/productos/categorias` | CRUD categorías |
| GET | `/api/productos/[id]/entrega?user_id=` | Validar compra y entregar producto |
| GET | `/api/productos/[id]/descargar-zip` | Descargar archivos del producto |

## 4.4 Leads / Campañas / Asesores

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/leads` | Crear/actualizar lead (formulario público) |
| GET/PUT | `/api/leads` | Listar/actualizar leads (admin) |
| GET/POST/PUT/DELETE | `/api/campanas` | CRUD campañas |
| GET/POST/PUT/DELETE | `/api/asesores` | CRUD asesores |

## 4.5 Templates / Landing

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/templates` | Listar/crear templates |
| GET/PUT/DELETE | `/api/templates/[id]` | CRUD template individual |
| GET | `/api/templates/landing` | Template landing activo principal |
| GET | `/api/templates/slug/[slug]` | Template por slug |
| GET | `/api/templates/tipo/[tipo]` | Template por tipo |
| POST | `/api/templates/[id]/activar\|desactivar\|principal\|duplicar` | Acciones de template |

## 4.6 Certificados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/certificados` | Verificar/emitir certificado |
| GET/POST/PUT/DELETE | `/api/certificados/plantillas` | CRUD plantillas |
| GET | `/api/certificados/pdf?id=` | Generar PDF del certificado |

## 4.7 Cursos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cursos?slug=\|id=&user_id=` | Obtener curso con progreso |
| POST | `/api/cursos` | Actualizar progreso |
| GET/POST/DELETE | `/api/equipo-cursos` | Cursos de equipo |

## 4.8 Blog

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PUT/DELETE | `/api/blog` | CRUD posts |
| GET/POST | `/api/blog/categorias` | Categorías |
| GET/POST/PUT/DELETE | `/api/blog/comments` | Comentarios (jerárquicos) |
| GET/POST/PUT | `/api/blog/lectura` | Progreso de lectura + recompensa coins |

## 4.9 Chat

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/chat/visitor` | Chat de visitante (público) |
| GET | `/api/chat/visitor` | Listar visitantes (admin) |
| POST | `/api/chat/send` | Enviar mensaje |
| POST | `/api/chat/ai` | Chat con IA (Gemini/GPT-4o-mini) |
| GET/PUT | `/api/chat/config` | Config del chat |
| GET | `/api/chat/widget-config` | Config pública del widget |
| GET/POST | `/api/chat/rooms` | Salas de chat |
| GET/POST/PUT/DELETE | `/api/chat/templates` | Respuestas rápidas |

## 4.10 Notificaciones / Push

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/PUT/DELETE | `/api/notificaciones` | CRUD notificaciones |
| POST | `/api/notificaciones/enviar` | Enviar notificación masiva |
| POST/DELETE | `/api/notificaciones/suscribir` | Web Push suscripción |
| POST/DELETE | `/api/push/subscribe` | Gestionar suscripción push |
| POST | `/api/push/send` | Enviar push notification |

## 4.11 Email Marketing

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PUT/DELETE | `/api/email-templates` | CRUD plantillas |
| GET/POST/PUT/DELETE | `/api/email-senders` | CRUD remitentes |
| POST | `/api/email-senders/test` | Probar SMTP/Resend/SendGrid |
| GET/POST/PUT/DELETE | `/api/email-palettes` | CRUD paletas de color |
| GET/POST/PUT/DELETE | `/api/email-media` | CRUD medios |
| POST | `/api/send-email` | Enviar email |

## 4.12 Correo (IMAP Client)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/PUT/DELETE | `/api/correo/cuentas` | CRUD cuentas |
| POST | `/api/correo/cuentas/conectar` | Conectar vía IMAP |
| GET | `/api/correo/messages?cuenta_id=&folder=` | Listar mensajes |
| GET/PUT | `/api/correo/messages/[uid]` | Ver/actualizar mensaje |
| POST | `/api/correo/messages/[uid]/reply` | Responder |
| POST | `/api/correo/translate` | Traducir mensaje |

## 4.13 Integraciones / Notion

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PUT/DELETE | `/api/integraciones` | CRUD integraciones |
| POST | `/api/notion/sync` | Sincronizar lotes |
| POST | `/api/notion/sync-receipts` | Sincronizar recibos |
| POST | `/api/notion/sync-lot-payments` | Sincronizar pagos |
| POST | `/api/notion/parse-ai` | Parsear con IA |

## 4.14 XPAND Coins / Referidos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/coins/balance?user_id=` | Saldo |
| POST | `/api/coins/add` | Añadir coins |
| POST | `/api/coins/spend` | Gastar coins |
| GET | `/api/coins/transactions?user_id=` | Historial |
| GET/POST/PUT | `/api/referidos` | Sistema de referidos |

## 4.15 Shop / Carrito

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/DELETE | `/api/shop/cart?user_id=` | CRUD carrito |
| GET/POST | `/api/shop/favorites?user_id=` | Favoritos |

## 4.16 Envato

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/envato/auth` | OAuth |
| GET | `/api/envato/callback` | Callback OAuth |
| GET | `/api/envato/elements?q=` | Buscar templates |
| POST | `/api/envato/download` | Descargar template |
| POST | `/api/envato/set-session` | Establecer sesión |

## 4.17 Otros Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/upload` | Subir archivo a Supabase Storage |
| POST/DELETE | `/api/storage` | Gestionar archivos en Storage |
| GET | `/api/peru-api?type=ruc\|dni\|tipo_cambio&id=` | Proxy API Perú |
| POST | `/api/test-connection` | Probar conexión a 14 servicios |
| POST | `/api/issue-invoice` | Emitir comprobante SUNAT |
| GET/POST/PUT/DELETE | `/api/short-links` | CRUD links acortados |
| POST | `/api/postulantes/public` | Postulación pública |
| GET/POST | `/api/formularios` | CRUD formularios |
| GET/POST | `/api/calendarios` | CRUD calendarios |
| GET | `/api/context/categorias\|monedas\|unidades\|sku-patrones\|estados\envio-zonas` | Catálogos maestros |
| POST | `/api/bordado/remove-bg\|vectorize\|enhance` | Procesamiento de imágenes |
| GET | `/api/biblioteca/libros` | Libros públicos |

---

# 5. MÓDULOS DEL PANEL SUPERADMIN

## 5.1 Productos (✅ Refactorizado — 33 archivos)

### Tipos (`_types/index.ts`)
- `Product`: 44 campos (id, sku, name, category, price, stock, status, image...)
- `ProductFormData`: Datos de formulario crear/editar
- `ProductFilters`: searchTerm + categoryFilters[]
- `ProductPagination`: currentPage, itemsPerPage, totalPages, totalItems
- `ViewMode`: 'grid' | 'list' | 'compact'
- `AnalyticsData`: inventoryValue, lowStockCount, perishableStats
- `LabelSettings`: showCategory, showSku, paperSize, layout
- `ProductStatus`: 'Disponible' | 'Bajo Stock' | 'Agotado' | 'Ilimitado'

### Hooks
| Hook | Función |
|------|---------|
| `useProducts()` | fetchProducts (GET), createProduct (POST), updateProduct (PUT), deleteProduct (DELETE), updateProductBulk |
| `useProductFilters(products)` | Filtrado por searchTerm, categoryFilters; ordenamiento por columna |
| `useProductSelection()` | Selección individual/todos, clearSelection |
| `usePagination(totalItems)` | paginatedItems<T>(), goToPage, nextPage, prevPage |
| `useProductAnalytics(products)` | Cálculos memoizados: valor inventario, stock bajo, perecederos críticos, top categorías |

### Componentes
- **UI:** Header, SearchFilterBar, ViewModeToggle, PaginationBar, AnalyticsSection, BulkEditActions, ToolsMenu, Toast
- **Views:** ProductListView, ProductGridView, CompactTableView, ProductTableRow, ProductTableHeader
- **Modals:** ProductFormModal, DeleteConfirmModal, MassEditModal, QRBarcodeModal, LabelPreview, LabelSettingsPanel, PerishableSection, ProductStockSection, ProductPriceSection, ProductImageUploader
- **Sub-módulo:** `entregas/` — Gestión de entregas de productos

### CRUD
| Op | Endpoint |
|----|----------|
| Read | GET `/api/productos?all=true` |
| Create | POST `/api/productos` |
| Update | PUT `/api/productos` (individual + bulk inline + mass edit) |
| Delete | DELETE `/api/productos?id=` (individual y bulk con Promise.all) |

### Providers anidados (7 niveles)
`BusinessSettingsProvider → CategoryProvider → StatusProvider → SkuProvider → UnitProvider → CurrencyProvider → LabelProvider → ShippingProvider → AdminProductsContent`

---

## 5.2 Clientes (✅ Parcial — 20 archivos)

### Tipos (`_types/index.ts`)
- `Client`: 50+ campos (id, firstName, lastName, email, role, blisCoins, purchases, income, tier, documentType, isCompany, addresses[], orders[], academicProgress[], certificates[], aiTags[], heatMap[], referrals[], churnRisk)
- `DbProfile`: Mapeo directo tabla `profiles` (49 campos SQL)
- `ClientTab`: 'profile' | 'economy' | 'sales' | 'referrals' | 'comms' | 'addresses' | 'academia' | 'ai_insights' | 'automations' | 'history'

### Hook: `useClients()`
fetch → mapDbToClient (mapeo extenso 50+ campos) → filtrado local → vista

### Sub-módulo `[id]/` (detalle de cliente)
10 pestañas con componentes dedicados:
ProfileTab, EconomyTab, SalesTab, ReferralsTab, CommsTab, AddressesTab, AcademiaTab, AiInsightsTab, AutomationsTab, HistoryTab

### CRUD: GET/PUT/DELETE `/api/admin/clientes`

---

## 5.3 Cursos (✅ Parcial — 19 archivos)

### Tipos (`_types/index.ts`)
- `Course`: id, title, category, price, status, modules[], hasCertificate, bliscoins, image, certificateTemplateId, paraEquipo, sequentialProgress, requireCompletion, venderEnTienda, productoId
- `Module`: id, title, description?, lessons[], questions[], isQuizEnabled?, isOpen?
- `Lesson`: id, title, type (video/text/quiz), content, videoUrl?, attachments[], questions[]
- `Question`: id, text, options[] ({id, text, isCorrect})

### Hooks (4 exportados)
| Hook | Funciones |
|------|-----------|
| `useCourseManagement()` | fetchCourses, saveBorrador (con auto-save 5s + slug retry), handleCreateNew, handleDeleteCourse |
| `useModuleActions()` | addModule, updateModule, deleteModule, moveModule, generateModuleQuizWithAI |
| `useLessonActions()` | addLesson, updateLesson, deleteLesson, reorderLesson, moveLessonBetweenModules, generateQuizWithAI |
| `useQuestionActions()` | addQuestion, updateQuestion, deleteQuestion |

### Componentes
CourseList, CourseCard, CourseEditor, CourseEditorHeader, CourseDetailsForm, CourseInfoPanel, ModuleEditor, LessonEditor, RichTextEditor, PreviewModal, ConfirmationModal, TiendaSection, ImageCropper, CourseProgress

### CRUD: GET/POST/PUT/DELETE `/api/admin/cursos`

---

## 5.4 Proyectos (✅ Parcial — 14 archivos)

### Tipos (`_types/index.ts`)
- `Project`: id, name, status (5 estados), website, location, description, cover_image, gallery_images, start_date, end_date, logo_url, colors, lots[], notion_database_id, notion_receipts_database_id
- `ProjectLot`: id, project_id, lot_number, lot_area, client_name, total_price, status (4 estados)
- `STATUS_OPTIONS`: EN PLANOS, PREVENTA, VENTA CON ESCRITURA, VENTA FINALIZADA, PROYECTO ENTREGADO
- Utilidades: extractNotionId(), getProjectSlug(), getStatusBadgeColor()

### Hooks (4 exportados)
| Hook | Función |
|------|---------|
| `useProjects()` | loadProjects, saveProject (POST/PUT), deleteProject |
| `useImageUpload()` | uploadImage → POST /api/upload |
| `useNotionSync()` | syncWithNotion → POST /api/notion/sync + /sync-receipts + /sync-lot-payments |
| `useAIParse()` | parseAI → POST /api/notion/parse-ai |

### Componentes
Header, SearchBar, ProjectGrid, ProjectCard, ProjectListView, ProjectForm, NotionSyncModal, EmptyState

### CRUD: GET/POST/PUT/DELETE `/api/admin/projects`

---

## 5.5 Certificados (✅ Parcial — 12 archivos)

### Tipos
- `CertificateElement`: id, type ('name'|'course'|'date'|'qr'), x, y, fontSize, color, fontWeight
- `CertificateTemplate` (local): title, description, backgroundImage, elements[]
- `DBTemplate`: 20+ campos (ancho, alto, color_fondo, posiciones, fuentes, colores)
- Conversores: dbToLocal(), localToDb(), createNewTemplate()

### Hooks
- `useCertificados()`: fetchTemplates, handleCreateNew, handleEditTemplate, handleDeleteTemplate, saveProject, updateElement, drag & drop en canvas
- `useTemplates()` (alternativo): fetch, save, delete
- `useCanvasEditor(canvasRef)`: moveElement, scaleElement, continuousMove, continuousScale, handleDragStart

### Componentes
CertificateEditor, CertificateList, CertificateCard, CanvasPreview, EditorToolbar, ElementSettings, TipsPanel, LoadingState

### CRUD: GET/POST/PUT/DELETE `/api/certificados/plantillas`

---

## 5.6 API-Nube (✅ Completo — 17 archivos)

### Tipos
- `ApiApp`: id, name, icon (React.ComponentType), color, bg, description, website, fields[], scope
- `ApiField`: id, label, type (password/text/file/database_selector), description, getFrom, accessType, cost
- `ApiCategory`: id, title, icon, color, description, apps[]

### Hook Principal: `useApiConfig()` (546 líneas — el más grande)
- **Estados:** 215 API keys, notes, favorites, status, environment, showKeys, isLoading, isSaving
- **Funciones:** loadApiKeys, handleKeyChange, handleFileChange, handleSaveApp, handleSaveAll, toggleFavorite, saveNote, copyToClipboard, testApiConnection, exportConfig, importConfig
- **Persistencia:** API keys en BD (`/api/admin/api-keys`), configuración en localStorage

### 215 Claves de API Soportadas
Organizadas en categorías: AI (10+), Pagos (12+), Comunicación (8+), Cloud/BD (6+), Trading/Crypto (10+), Identidad (8+), Diseño (6+), Documentos (3+), Mapas (2+), Analytics (4+), Automatización (3+), Calendar (3+)

### CRUD: GET/PUT `/api/admin/api-keys`

---

## 5.7 Templates (✅ Completo — 16 archivos)

### Tipos de Template (13)
landing, blog, blog_post, tienda, producto, curso, leccion, proyecto, funnel, captura, checkout, thankyou, legal

### Estados: borrador → revision → listo → activo

### Hook: `useTemplateEditor()`
- Estados: template, loading, saving, activeSection, sectionOrder, sectionVisibility, projects[], templateConfig, campanas[], asesores[]
- Funciones: handleSave, updateSection, updateArrayItem, addArrayItem, removeArrayItem, moveSectionUp/Down, toggleSectionVisibility

### Componentes del Editor
TemplateSidebar, ConfigPanel, EditorRouter, CaptureHeroEditor, SectionCard, VisibilityToggle, ColorPicker, LinkField, InputField, TextAreaField

### Template List
- Crear → TemplateTypeModal → createTemplate()
- Duplicar, Activar/Desactivar, Establecer Principal, Eliminar
- CRUD: GET/POST `/api/templates`, GET/PUT/DELETE `/api/templates/[id]`

---

## 5.8 Otros Módulos (Resumen)

### Leads (437 líneas, monolítico)
- Tabla con 5 contadores por estado + filtros (search, estado, campaña) + export CSV
- Modal detalle de lead con todos los campos
- Cambio de estado: PUT `/api/leads`
- Estados: nuevo → contactado → calificado → cliente | perdido

### Campañas (474 líneas, monolítico)
- Grid de cards con nombre, estado, descripción, asesor
- Modal con: nombre, descripcion, estado, notificar_email/whatsapp, emails_notificacion[], whatsapp_notificacion[], Notion
- Estados: borrador → activa → pausada → finalizada

### Asesores (5 archivos, modular)
- Cards expandibles con: nombre, rol, puesto, email, teléfono, cédula, residencia, estudios, comisión, herramientas
- EmployeeModal: crear/editar empleado con roles + permisos
- AssignmentModal: asignar cursos/productos

### Dashboard (388 líneas)
- KPIs reales desde Supabase + Realtime (3 canales: compras, leads, blog)
- Gráfico barras (Recharts): ventas mensuales
- Top productos + activity feed (últimos leads, compras, posts)
- Skeleton loader durante carga

### Ventas (441 líneas)
- Lista con filtros (búsqueda, estado, paginación)
- Modal crear venta manual + verificar pagos
- Log de cambios de estado
- KPIs: total, pendientes, completadas, canceladas

### Contratos (349 líneas)
- Editor de contrato inmobiliario con cálculo automático de cuotas
- Reporte financiero (total pagado, proyección, balance)
- Integración IA (aiChat de @/lib/ai-client)

### Formas de Pago (424 líneas)
- Gestión de métodos: izipay, coins, transferencia, crypto, whatsapp
- Config de bancos/wallets/cuentas por método
- Toggle activo/inactivo + reordenamiento

### Biblioteca (273 líneas)
- CRUD libros: título, autor, categoría, portada, descripción, download_link
- Upload de imagen + toggle destacado/activo

### Blog
- Lista de posts + editor (crear) + gestión de rutas

### Correo (16 archivos, modular)
- Cliente IMAP completo: bandeja, visor, redacción con IA, traducción

### Trading (13 archivos)
- Terminal de trading: charts, scanner, lógica de trading

### Calendarios (12 archivos)
- CRUD con editor multi-tipo, scheduling, equipo

### Seguridad
- Dashboard, scanner AI, geobloqueo, rate limiting, headers, bot protection, login history, access logs, alerts

### Roles y Permisos
- Árbol de 138 permisos (VCED por recurso)
- CRUD roles con permissions grid
- Reordenamiento

### Empresas (10 archivos)
- CRUD multi-tenant con planes, límites, colores, monedas
- Gestión de usuarios por empresa (asignar/desasignar)

---

# 6. COMPONENTES DE LANDING Y PÚBLICOS

## 6.1 Secciones de Landing (35 archivos en `components/sections/`)

### Hero.tsx (481 líneas)
- **Animaciones:** CharReveal (texto letra-por-letra), GlitchText (aberración cromática), ParticleDot (35 partículas reactivas al cursor)
- **Parallax:** Fondo tech grid + 2 orbes con useTransform vinculado a scrollYProgress
- **Widgets flotantes:** 4 widgets animados (ventas, portafolio, rendimiento, plusvalía)
- **Botón magnético:** Sigue al cursor ±6px con useSpring
- **Responsive:** Partículas `hidden md:block`, widgets escalan con breakpoints

### About.tsx (203 líneas)
- Grid 2 columnas: texto sticky (izq) + imagen/video (der)
- AnimatedCounter para stats
- Modal de video con iframe y backdrop blur

### Process.tsx (215 líneas)
- **MOBILE:** Timeline vertical con pasos + línea conectora
- **DESKTOP:** Grid horizontal + SVG connector line animada (pathLength 0→1 vinculado a scroll)
- Entradas desde 4 direcciones con staggerChildren 0.15s

### Operations.tsx (228 líneas)
- Parallax de profundidad (imagen: y:[40,-40], orbe: y:[-200,300])
- Slider con drag horizontal + auto-avance 4s con progress dots
- Stats sidebar con entrada staggered

### Projects.tsx (486 líneas)
- **TiltCard:** Efecto 3D ±10° con rotateX/rotateY calculado por posición del cursor
- Glow tracker que sigue al mouse
- Modal con carrusel drag + contenido
- Fetch directo de Supabase (projects con cover_image, gallery_images)

### Testimonials.tsx (197 líneas)
- **MOBILE:** Tarjeta única con auto-avance 4s
- **DESKTOP:** Marquee CSS infinito (translateX 0 → -50%, 2x array para loop seamless)
- Hover pausa, tap pausa en móvil

### Team.tsx (206 líneas)
- Imagen CEO con overlay animado que se intensifica en hover
- Detalles (cargo + social links) se deslizan hacia arriba en hover
- 2 widgets flotantes (Capital Administrado, Garantía Fiduciaria)

### FAQ.tsx (168 líneas)
- Acordeones con AnimatePresence + height:auto
- Chevron rota 180° al abrir
- Widget de satisfacción magnético (4.9/5.0 + barras de progreso)

### Calculator.tsx (301 líneas)
- Simulador de precios con slider (marketValue 20K-150K)
- 3 etapas: Planos (teal), Preventa (rojo, elevado), Escritura (gris)
- Cálculos con ratios del CMS

### VideoShowcase.tsx (119 líneas)
- Contenedor video con scale:0.9→1
- Borde neón pulsante (scale:[1, 1.008, 1])
- Stats con AnimatedCounter

### ProjectMap.tsx (193 líneas)
- Lista ubicaciones (izq) + SVG Ecuador (der) con radar rings + pines animados
- Pines caen con spring bounce, pulse ring

### Catalog.tsx (391 líneas)
- Tabs de categorías con contador de productos
- Product cards con imagen, precio + XPANDCOINS, botón "Ver"
- Layout especial horizontal para categoría "asesor"
- Auto-scroll 4.5s por categoría en móvil

### Footer.tsx (431 líneas)
- Sección video thumbnail → iframe on click
- Formulario VIP con campos secuenciales (stagger 0.08s)
- Sitemap, legal, contacto, redes sociales

### CustomHeader.tsx (118 líneas)
- Header fixed con logo, nav links, CTA animado (ArrowRight)

### CustomFooter.tsx (144 líneas)
- Grid 4 columnas con logo + links + social icons

### Header.tsx (685+ líneas)
- Header fixed con scroll detection (bg-black/80 + blur en scroll)
- Search con dropdown 3 columnas, carrito dropdown, favoritos dropdown
- Hamburguer menú con animación spring

### Componentes de Funnel (7 archivos)
FunnelHero, FunnelPricing (3 layouts), FunnelTestimonials (3 layouts), FunnelVideo (3 layouts), FunnelBenefits, FunnelCTA, FunnelCountdown (timer a endDate)

### Componentes ThankYou
ThankYouHero (CheckCircle animado), ThankYouNextSteps (3 pasos con íconos)

### Otros
BlogPosts (grid/slider), BlogHero (carrusel 5 artículos), BlogPremium, CaptureForm (formulario + Turnstile), CaptureHero, ContentSection, InteractiveData, StatsSection (sparklines SVG), Metrics, TrustBadges (marquee infinito 7 partners)

## 6.2 Tienda (16 archivos en `components/tienda/`)

| Componente | Descripción |
|------------|-------------|
| `ProductGrid` | Cards con Shine sweep, badges, rating, botón carrito animado |
| `CartSidebar` | Sidebar con spring animation, items, subtotal, XPANDCOINS, checkout |
| `ShopHeroSlider` | Carrusel direccional con gradient mesh + orbe animado |
| `ProductCategorySlider` | Scroll horizontal con snap, ProductCardInner con badges y favoritos |
| `FlashDeals` | Countdown + barra progreso + auto-rotación 5s |
| `LiveBuyerNotification` | Notificaciones pseudo-aleatorias con banderas |
| `BundlesSection` | 3 bundles con savings badge + stock bar |
| `TestimonialsCarousel` | 5 testimonios rotación 6s |
| `TrustBanner` | 6 trust items con hover glow |
| `StatsBar` | 4 stats con countUp al entrar en viewport |
| `UrgencyTimer` | Timer 24h basado en localStorage |
| `TopSellers` | Ranking 1-5 con badges y tendencia |
| `NewsletterBanner` | Formulario con estados idle/loading/success |
| `ShopSidebar` | Fixed left sidebar con IntersectionObserver + collision con footer |
| `ProductSearch` | Modal búsqueda Ctrl+K con filtros |
| `CheckoutIzipay` | Integración SDK Izipay con 5 estados visuales |

## 6.3 Editor de Templates (4 archivos)

| Componente | Descripción |
|------------|-------------|
| `ImageUpload` | Drop zone con drag & drop, upload a Supabase, integración con ImageCropper |
| `ImageCropper` | Canvas con mouse drag + zoom, output 1920px WebP |
| `MapPointEditor` | Drag & drop de pines en mapa, panel lateral con edición inline, ajuste fino ±2% |
| `MapEditor` | Editor completo de mapa con modos de añadir, 8 colores de pin |

## 6.4 UI Components y Animaciones

| Componente | Descripción |
|------------|-------------|
| `AnimatedCounter` | Fase scramble (dígitos aleatorios) + settle (ease-out cubic), IntersectionObserver |
| `AutoSlider` | Scroll horizontal con requestAnimationFrame, 4s por slide, hover pausa |
| `CustomCursor` | Ring cursor personalizado (rojo neón), modos hover/touch, interpolación suavizada |
| `CursorWrapper` | Dynamic import con ssr:false |
| `SideAnchorNav` | Desktop: dots verticales con tooltips; Mobile: barra flotante con IntersectionObserver |
| `Toast` | Provider de toasts con animaciones Framer Motion |
| `ConstructionLoader` | Skeleton loader para templates |
| `PermissionSelector/Guard` | Gestión RBAC |
| `FaviconBadge` | Actualiza title con contador de notificaciones (solo en /superadmin) |

## 6.5 Layout Shell

| Componente | Descripción |
|------------|-------------|
| `LayoutShell` | Server Component — obtiene template cacheado |
| `LayoutProviders` | Client Component — anida: LandingCMS → Tooltip → Auth → Toast → Shop → Sales → DynamicMetadata → CursorWrapper → PWARegistrar → FaviconBadge → Header |
| `DynamicSections` | Renderiza secciones por sectionOrder y sectionVisibility. 40+ secciones registradas. Scroll progress bar 2px rojo neón. |

---

# 7. HOOKS GLOBALES Y UTILIDADES

## 7.1 Hooks en `lib/hooks/` (17 hooks)

| Hook | API | Descripción |
|------|-----|-------------|
| `useLandingTemplate()` | GET `/api/templates/landing` | Template landing activo, secciones, visibilidad |
| `useTemplates()` | GET/POST/PUT/DELETE `/api/templates/*` | CRUD completo de templates |
| `useTemplate()` | GET `/api/templates/slug/[slug]`\|`/tipo/[tipo]` | Template por slug o tipo |
| `useSiteConfig()` | GET/PUT `/api/site-config` | Config del sitio (35 campos) |
| `useBusinessConfig()` | GET/POST `/api/context/business-config` | Features toggle (perecederos, envíos, coins) |
| `useProducts()` | GET `/api/productos?filtros` | Productos con filtros |
| `useCategorias()` | GET/POST/PUT/DELETE `/api/context/categorias` | CRUD categorías + reorder |
| `useMonedas()` | Supabase directo `monedas_config` + `tasas_cambio` | Tasas de cambio, refresh desde open.er-api.com |
| `useCompras()` | GET `/api/compras?user_id=` | Compras con items anidados |
| `useCampanas()` | GET/POST/PUT/DELETE `/api/campanas` | CRUD campañas (+ useAsesores para `/api/asesores`) |
| `useCoins()` | `/api/coins/balance`, `/transactions`, `/add`, `/spend` | XPAND Coins |
| `useBlog()` | GET/POST/PUT/DELETE `/api/blog` + `/api/storage` | Blog posts con SEO, premium, tags |
| `useReferrals()` | GET/POST/PUT `/api/referidos` | Sistema de referidos |
| `useUserStats()` | 3 APIs en paralelo | Stats calculados: productos, cursos, coins, inversión, plusvalía |
| `useExchangeRates()` | `/api/peru-api` + exchangerate-api.com | Tasas de cambio con auto-refresh cada 1h |
| `usePushNotifications()` | Web Push API + VAPID | Permiso, service worker, suscripción |
| `useEmailTemplates/Media/Senders()` | CRUD correspondiente | Sistema de correos |

## 7.2 Auth Hooks

| Hook | Ubicación | Descripción |
|------|-----------|-------------|
| `useAuth()` | `hooks/useAuth.tsx` | AuthProvider principal (Context) con cache localStorage |
| `useAuth()` | `lib/hooks/useAuth.ts` | Hook standalone ligero (sin Context, usado por ShopContext) |
| `usePermissions()` | `hooks/usePermissions.ts` | Permisos efectivos desde API `/api/admin/roles` + permisos_adicionales |

## 7.3 Utilidades Clave en `lib/`

| Archivo | Propósito |
|---------|-----------|
| `lib/utils.ts` | `cn()` (clsx + tailwind-merge), helpers varios |
| `lib/supabase/index.ts` | 445 líneas: fetchWithRetry, helpers de BD (getCurrentUser, getBlogPosts, getProductos, getCompras, getCoinsTransactions, etc.), realtime subscriptions |
| `lib/supabase/client.ts` | Singleton browser client (Anon Key) |
| `lib/supabase/server.ts` | Admin client (Service Role) + instancia `supabase` |
| `lib/supabase/middleware.ts` | updateSession: cookies + getUser + profiles (rol, empresa_id) + canAccess |
| `lib/supabase/api-auth.ts` | Fast path (lee headers x-blis-*) + slow path (getUser + profiles) |
| `lib/supabase/storage.ts` | uploadFileToStorage, getFileExtension, formatFileSize |
| `lib/supabaseStorage.ts` | Capa clave-valor que sincroniza con Supabase (proyectos/lotes) |
| `lib/cachedSupabaseStorage.ts` | Versión mejorada con logger y manejo de fechas |
| `lib/api-crypto.ts` | Cifrado/descifrado de API keys (AES) |
| `lib/ai-client.ts` | Cliente de IA para chat y generación |

## 7.4 Contextos (11 providers)

| Contexto | Hook | Estado gestionado |
|----------|------|-------------------|
| `AuthContext` | `useAuth()` | user, loading, loginWithEmail, logout |
| `ShopContext` | `useShop()` | cart, favorites, purchasedProducts, blisCoins, isCartOpen |
| `CurrencyContext` | `useCurrency()` | selectedCurrency, taxCurrency, fiscalCurrency, convertAmount |
| `SalesContext` | `useSales()` | cart (POS), customer, transactionType, documentType, history |
| `LandingCMSContext` | `useLandingCMS()` | cmsData (16 secciones), templateData, siteConfig |
| `CategoryContext` | `useCategorias()` | CRUD categorías con SKU prefix |
| `ShippingContext` | `useEnvioZonas()` | Zonas de envío, cálculo de costos |
| `UnitContext` | `useUnidades()` | Unidades de medida |
| `StatusContext` | `useEstados()` | Estados de producto |
| `BusinessSettingsContext` | `useBusinessConfig()` | perecederos, serialización, envíos, tipo negocio |
| `SkuContext` | `useSkuPatrones()` | Patrones SKU |
| `LabelContext` | standalone | Config etiquetas: tipo código, layout, campos visibles |

## 7.5 Sistema Supabase — Resumen de Acceso

| Cliente | Ubicación | Auth | Uso |
|---------|-----------|------|-----|
| Browser Client | `lib/supabase/client.ts` | Anon Key + cookies (RLS) | Hooks del cliente, contextos |
| Server Client | `lib/supabase/server.ts` | Service Role (bypass RLS) | API routes, middleware, seed scripts |
| Middleware Client | `lib/supabase/middleware.ts` | Cookies del request | Verificación de sesión en middleware |

---

# 8. SISTEMA DE DISEÑO (CYBER-LUXE)

## 8.1 Paleta de Colores

| Variable CSS | Valor | Uso |
|-------------|-------|-----|
| `--background` | `#050505` | Fondo principal (negro profundo) |
| `--foreground` | `#ffffff` | Texto principal |
| `--color-blis-red` | `#d5c108` | Color primario (rojo carmesí) |
| `--color-blis-red-neon` | `#f5e100` | Acento neón (brillante) |
| `--card` | `#0a0a0a` | Fondos de tarjetas |
| `--muted` | `#1a1a1a` | Fondos secundarios |
| `--border` | `rgba(255,255,255,0.1)` | Bordes sutiles |
| `--ring` | `#d5c108` | Anillos de focus |

## 8.2 Clases Utilitarias Personalizadas

| Clase | Descripción |
|-------|-------------|
| `.glass` | `bg-white/5 border border-white/10` + `backdrop-filter: blur(4px)` |
| `.glass-card` | `bg-black/60 border border-white/5` + `backdrop-filter: blur(8px)` + shadow |
| `.antigravity` | `transition-transform duration-700` + hover `-translate-y-2` + neon shadow |
| `.text-gradient` | `bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500` |
| `.blis-gradient` | `bg-gradient-to-br from-blis-red/80 to-blis-red/20` |
| `.cyber-texture` | Ruido fractal SVG como background-image repetible |
| `.neon-text` | `text-blis-red-neon` + triple text-shadow (5px, 10px, 20px) |
| `.neon-border` | `border-blis-red-neon` + double box-shadow (exterior + interior) |
| `.scrollbar-hide` | Oculta scrollbar en todos los navegadores |

## 8.3 Fuentes y Tipografía
- **Font:** Variable sans-serif vía `next/font` (probablemente Inter o Geist)
- **Peso regular:** 400, **Negrita:** 700
- **Tamaños:** Sistema de Tailwind con `text-7xl` a `text-xs`

## 8.4 Cursor Personalizado
- Cursor SVG inline (data URI): diana circular roja neón de 14px
- Interactivos: diana circular roja neón de 14px
- Renderizado por GPU compositor (zero lag)

## 8.5 Scrollbar Personalizada
- Ancho: 6px
- Thumb: `rgba(213, 193, 8, 0.4)` con hover glow `rgba(213, 193, 8, 0.8)`
- Track: transparente
- Soporte: WebKit + Firefox

## 8.6 Breakpoints (Tailwind)
- `sm`: 640px, `md`: 768px, `lg`: 1024px, `xl`: 1280px
- **Enfoque mobile-first:** Estilos base para móvil, `md:` y `lg:` para escalar

---

# 9. RECURSOS EXTERNOS Y PROVEEDORES

## 9.1 APIs Externas Implementadas (con código funcional)

| Proveedor | Propósito | Método auth | Archivos clave |
|-----------|-----------|-------------|----------------|
| **Supabase** | BD, auth, storage, realtime | Anon + Service Key | Todo el proyecto |
| **PayPal** | Pasarela de pagos | OAuth2 (client_id + secret) | `app/api/paypal/*`, `lib/paypal/client.ts` |
| **Izipay** | Pasarela Perú | API Keys (shop_id, secret, hmac) | `app/api/izipay-*`, `lib/izipay/client.ts` |
| **Notion** | CRM/sincronización | Bearer token | `lib/integrations/notion.ts`, `app/api/notion/*` |
| **Google Gemini** | AI Security Scanner | API Key | `lib/security-scanner.ts` |
| **Cloudflare Turnstile** | Anti-bots | Secret key | `lib/bot-protection.ts` |
| **Nodemailer SMTP** | Envío correos | SMTP creds | `lib/email/sendTemplateEmail.ts` |
| **Resend** | Email API | API Key (Bearer) | `lib/email/sendTemplateEmail.ts` |
| **IMAP (imapflow)** | Cliente correo | IMAP creds | `app/superadmin/correo/` |
| **Web Push (VAPID)** | Notificaciones | VAPID keys | `lib/push-notifications.ts` |
| **Vercel Analytics** | Analytics | Automático | `@vercel/analytics` |

## 9.2 APIs con Tester de Conexión (70+ servicios)

El archivo `app/api/admin/api-keys/test/route.ts` contiene testers para **más de 70 APIs**:
- **IA:** Gemini, OpenAI, Groq, Anthropic, Replicate, Stability, ElevenLabs, HuggingFace, OpenCodeGo, OpenGozen
- **Pagos:** Stripe, MercadoPago, Culqi, Paymentez, PlaceToPay
- **Comunicación:** Twilio, SendGrid, Resend, Mailgun, WhatsApp Business, OneSignal, Pushwoosh, Pusher, FCM, PlanifyX
- **Automatización:** Pabbly, Make, n8n
- **Trading:** Alpaca, CryptoHopper, QuantConnect, TradingView, CoinMarketCap, CoinGecko, Coinbase
- **Identidad:** Perú (API Consult, SRI), Ecuador, Colombia (DataUno, ValidarUC), Onfido, Jumio, Authenteq
- **Diseño:** Canva, Unsplash, Pexels, Pixabay, Brandfetch, Envato, Freepik, Adilo
- **Documentos:** PDFMonkey, DocSpring, PandaDoc
- **Cloud:** Cloudinary, Supabase, MongoDB, PlanetScale, Upstash
- **Mapas:** Mapbox, YouTube
- **Calendar:** Flaxxa, Calendly, Cal.com
- **Analytics:** Mixpanel, Amplitude

## 9.3 APIs Pendientes de Implementar

| API | Ubicación | Estado |
|-----|-----------|--------|
| Resend/SendGrid (notificación leads) | `app/api/leads/route.ts:34` | TODO |
| Twilio/WhatsApp API (notificación leads) | `app/api/leads/route.ts:42` | TODO |

## 9.4 Variables de Entorno

### Configuradas en `.env.local`:
```
GEMINI_API_KEY
OPENAI_API_KEY
NEXT_PUBLIC_PERU_API_TOKEN
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
EMAIL_ENCRYPTION_KEY
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
GEOBLOCK_SIMULATE_COUNTRY=PE
```

### Referenciadas en código pero NO en `.env.local`:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — envío de correos
- `NEXT_PUBLIC_SITE_URL` — URL base para links en emails
- `API_ENCRYPTION_KEY` — cifrado de API keys en BD (mín. 32 chars)
- `GEOBLOCK_ENABLED` — activar/desactivar geobloqueo

## 9.5 Repositorios Fuente de Recursos

| Recurso | Repositorio | Script |
|---------|-------------|--------|
| Íconos SVG de marcas (118 íconos) | `github.com/glincker/thesvg` (`public/icons/`) | `scripts/download-brand-icon.ts` |
| Plantillas de email (71) | Seed local | `scripts/seed-email-event-templates.ts` |
| Libros (biblioteca) | WordPress API `campus.xpandcapital.org` | `scripts/seed-books.ts` |

## 9.6 Scripts Disponibles

| Script | Comando | Propósito |
|--------|---------|-----------|
| `download-brand-icon.ts` | `npx tsx scripts/download-brand-icon.ts <brand>` | Descargar ícono SVG de marca |
| `seed-email-event-templates.ts` | `npx tsx scripts/seed-email-event-templates.ts` | Sembrar 71 plantillas de email |
| `seed-books.ts` | `npx tsx scripts/seed-books.ts` | Scraping de libros desde WordPress |
| `scrape-books.ts` | `npx tsx scripts/scrape-books.ts` | Scraping completo con migración de portadas |
| `run-seed.cjs` | `node scripts/run-seed.cjs` | Cargar .env.local y ejecutar seed |
| Comandos npm | `npm run seed` / `dev` / `build` / `lint` / `test` | — |

## 9.7 Dependencias Clave (package.json)

| Paquete | Propósito |
|---------|-----------|
| `next@15.3.8` | Framework |
| `react@19.2.3` | UI |
| `@supabase/ssr@0.10.2` | Supabase + SSR |
| `framer-motion@12.34.3` | Animaciones |
| `lucide-react@0.575.0` | Íconos |
| `tailwindcss@4` | Estilos (v4 con @theme en CSS) |
| `shadcn@4.7.0` | Componentes UI base |
| `@react-pdf/renderer@4.3.2` | PDF certificados |
| `puppeteer@24.40.0` | PDF vía navegador |
| `nodemailer@8.0.4` | Envío SMTP |
| `imapflow@1.3.3` | Cliente IMAP |
| `web-push@3.6.7` | Push notifications |
| `recharts@3.8.1` | Gráficos |
| `react-simple-maps@3.0.0` | Mapas SVG |
| `xlsx@0.18.5` | Exportación Excel |
| `archiver@7.0.1` / `jszip@3.10.1` | Compresión |
| `potrace@2.1.8` | Vectorización |
| `html-to-image@1.11.13` | Screenshots |
| `@vitalets/google-translate-api@9.2.1` | Traducción |
| `qrcode.react@4.2.0` / `react-barcode@1.6.1` | Códigos QR/barras |

---

# 10. BUGS CONOCIDOS Y DEUDA TÉCNICA

## 10.1 TODOs y FIXMEs (5 encontrados)

| Archivo | Contenido |
|---------|-----------|
| `app/api/leads/route.ts:34` | TODO: Implementar envío real con Resend/SendGrid |
| `app/api/leads/route.ts:42` | TODO: Implementar envío real con Twilio/WhatsApp API |
| `app/api/integraciones/route.ts:46` | TODO: Obtener empresa_id del contexto |
| `app/api/asesores/route.ts:47` | TODO: Obtener empresa_id del contexto |
| `app/api/campanas/route.ts:58` | TODO: Obtener empresa_id del contexto |

## 10.2 @ts-ignore (3 ocurrencias)

| Archivo | Contexto |
|---------|----------|
| `app/superadmin/correo/_lib/imapClient.ts:249` | Operación IMAP |
| `lib/supabase/middleware.ts:229` | Operación de BD |
| `components/superadmin/sidebar-tools/UnitConverter.tsx:26` | Conversión de tipos |

## 10.3 Errores TypeScript Pre-existentes (14)

| Archivo | Errores | Descripción |
|---------|---------|-------------|
| `context/LandingCMSContext.tsx` | 7 | Indexación con tipo `string` en objetos tipados |
| `lib/hooks/useLandingTemplate.ts` | 2 | Tipos de secciones |
| `lib/types/domain/entities.ts` | 1 | Definición de tipos |
| `lib/types/domain/schemas.ts` | 4 | Esquemas de validación |

## 10.4 console.log (532 ocurrencias)

**Archivos más contaminados:**
- `app/api/checkout/route.ts`: ~25 logs
- `app/api/izipay-webhook/route.ts`: ~22 logs
- `app/api/get-izipay-token/route.ts`: ~10 logs
- `lib/email/sendTemplateEmail.ts`: ~10 logs
- `app/api/admin/api-keys/test/route.ts`: ~10 logs

**Distribución:** ~100+ archivos con al menos un console.log. Mayoría son logs de depuración con prefijos `[Checkout]`, `[PayPal]`, `[Izipay]`, `[sendTemplateEmail]`.

## 10.5 Uso de `any` (~583 ocurrencias)

**Archivos con mayor densidad:**
- `app/api/admin/api-keys/test/route.ts`: ~15 (catch blocks, parámetros de testers)
- `app/api/checkout/route.ts`: ~12
- `app/tienda/checkout/page.tsx`: ~12 (tipos de PayPal SDK)
- `lib/izipay/types.ts`: varios (justificado por API externa)

## 10.6 Archivos Grandes Sin Refactorizar (>50KB)

| Archivo | Tamaño | Líneas estimadas |
|---------|--------|------------------|
| `app/superadmin/trading/TerminalLogic.tsx` | 325 KB | ~4,000 |
| `app/superadmin/api-nube/page.tsx` | 222 KB | ~3,400 |
| `app/superadmin/GestionDeLotes.tsx` | 175 KB | ~2,100 |
| `components/superadmin/SidebarTools.tsx` | 167 KB | ~2,000 |
| `app/superadmin/templates/[id]/page.tsx` | 154 KB | ~1,900 |
| `app/superadmin/clientes/page.tsx` | 136 KB | ~1,600 |
| `app/superadmin/cursos/page.tsx` | 134 KB | ~1,700 |
| `components/sections/Header.tsx` | 55 KB | ~700 |

## 10.7 Tests: 0 implementados

- `vitest.config.ts` configurado pero sin tests
- `tests/` solo contiene `setup.ts`
- Cobertura 0%

## 10.8 Problemas de Configuración

| Problema | Severidad | Descripción |
|----------|-----------|-------------|
| `tailwind.config.js` corrupto | Media | Contiene mensaje de error de git. No afecta porque el proyecto usa Tailwind v4 (config en CSS) |
| `.env.example` no existe | Media | README indica `cp .env.example .env.local` pero el archivo no existe |
| `ignoreBuildErrors: true` | Alta | next.config.js ignora errores de TypeScript y ESLint en build |
| Dos configs ESLint | Baja | `.eslintrc.json` (legado) + `eslint.config.mjs` (flat config) coexisten |
| README desactualizado | Baja | Dice "Next.js 14" pero usa `next@15.3.8` |
| `.env.local` en el repo | Crítica | Contiene secretos reales (API keys de Gemini, OpenAI, Supabase) |

## 10.9 Áreas de Mejora Documentadas (REVISION_Y_MEJORAS.md)

- **Seguridad:** Variables de entorno pendientes en Vercel, headers de seguridad ausentes
- **Responsive:** Tablas y modales no verificados en móvil
- **Performance:** Sin lazy loading, sin next/image en todas las imágenes
- **Accesibilidad:** Sin verificaciones de contrast ratio, focus visible, aria-labels
- **SEO:** Meta tags por página, Open Graph images, Schema.org pendientes
- **Código:** Imports sin usar, variables no utilizadas, código duplicado en módulos no refactorizados

---

# 11. ICONOS DE MARCA DISPONIBLES

**Total:** 118 íconos SVG en `public/icons/brands/`

| Categoría | Íconos |
|-----------|--------|
| **Redes Sociales** (14) | facebook, instagram, x, linkedin, tiktok, youtube, pinterest, reddit, snapchat, telegram, discord, signal, whatsapp, apple |
| **Google Suite** (14) | google, gmail, drive, docs, sheets, slides, meet, calendar, maps, chrome, analytics, play, cloud, gemini |
| **Microsoft Suite** (9) | microsoft, word, excel, powerpoint, outlook, onedrive, teams, edge, github |
| **Pagos** (6) | stripe, paypal, visa, mastercard, amex, diners-club |
| **Cripto** (9) | bitcoin, ethereum, solana, tether, polygon, cardano, chainlink, litecoin, binance |
| **Cloud** (8) | supabase, vercel, cloudflare, digitalocean, netlify, heroku, render, aws |
| **Dev Tools** (10) | nextdotjs, tailwindcss, framer, react, typescript, python, docker, kubernetes, git, vscode, npm |
| **BD** (6) | postgresql, mysql, mongodb, redis, firebase, sqlite |
| **Diseño** (11) | figma, canva, adobe, photoshop, illustrator, premiere-pro, sketch, webflow, blender, unsplash, affinity |
| **Entretenimiento** (11) | spotify, netflix, twitch, steam, kick, youtube-music, youtube-studio, disney-plus, hbo-max, prime-video, crunchyroll |
| **IA/Productividad** (7) | openai, perplexity-ai, notion, slack, zoom, linear, claude |
| **Otros** (13) | hotmart, cloudinary, vimeo, trello, zendesk, typeform, loom, dropbox, calendly, airtable, n8n, make, auth0 |

**Script para descargar nuevos:** `npx tsx scripts/download-brand-icon.ts <nombre>` (fuente: `github.com/glincker/thesvg`)

---

# 12. CONVENCIONES Y REGLAS DEL PROYECTO

## 12.1 Reglas Críticas

1. **NUNCA usar `tipo` para mostrar categoría al usuario.** El campo `productos.tipo` (digital/fisico/servicio/suscripcion) es clasificación interna. Para mostrar categoría usar `productos.categoria.nombre`.

2. **NO CREAR componentes nuevos sin aprobación.** Modificar los existentes.

3. **NO MODIFICAR lógica** de Supabase, enrutamiento, contextos globales, formularios y BD sin aprobación.

4. **CERO instalaciones** sin aprobación. Usar el ecosistema existente.

5. **Mobile-First:** Todo maquetado base para móvil, `md:`, `lg:`, `xl:` para escalar a escritorio.

6. **Interacciones táctiles:** Siempre programar fallback para móvil (`whileTap` en vez de `whileHover`).

7. **NO exponer secretos.** `.env.local` contiene claves reales. No commitear.

## 12.2 Patrones de Código

| Patrón | Ejemplo |
|--------|---------|
| Barrel exports | `_hooks/index.ts`, `_components/index.ts` |
| Mapeo DB ↔ UI | `mapDbToClient()`, `dbToLocal()`, `localToDb()` |
| CRUD via REST | `/api/admin/[recurso]` con métodos HTTP estándar |
| Action Guards | `useActionGuard()` en todos los módulos |
| Toast notifications | `useToast()` de `@/components/ui/Toast` |
| Optimistic updates | En clientes y productos (bulk edit) |
| Auto-save | Solo cursos (5s debounce) |
| Realtime | Solo dashboard (Supabase channels) |
| Cache localStorage | Auth (`blis_auth_user`), CMS (`blis_landing_cms`), API keys |

## 12.3 Flujo de Datos Típico

```
UI Component → Context/Hook → API Route → Supabase
                                      ↓
                              Service Role (bypass RLS) o
                              Anon Key (RLS + cookies)
```

## 12.4 Estructura de Componentes Recomendada

```typescript
// 1. Imports agrupados
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from 'lucide-react'

// 2. Tipos
interface Props {
  title: string
  children: React.ReactNode
}

// 3. Componente
export function Component({ title, children }: Props) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleClick = () => {}
  
  // 6. Render
  return (<div>{/* JSX */}</div>)
}
```

## 12.5 Directorios Privados (underscore prefix)

- `_types/` — Tipos e interfaces
- `_hooks/` — Hooks personalizados
- `_components/` — Componentes UI del módulo
- `_utils/` — Utilidades específicas del módulo
- `_lib/` — Librerías del módulo
- `_constants/` — Constantes
- `_data/` — Datos estáticos

---

# 13. RESUMEN ESTADÍSTICO FINAL

| Métrica | Valor |
|---------|-------|
| **Archivos totales en el proyecto** | ~700+ |
| **Endpoints API** | 130+ |
| **Módulos superadmin** | 31 |
| **Componentes de landing** | 35 |
| **Componentes de tienda** | 16 |
| **Context providers** | 11 |
| **Hooks globales** | 17 |
| **Tablas de BD** | 50+ |
| **Migraciones SQL** | 60+ |
| **APIs externas con soporte** | 70+ |
| **Íconos de marca** | 118 |
| **Módulos refactorizados (completos)** | 4 |
| **Módulos refactorizados (parciales)** | 10 |
| **Módulos sin refactorizar (monolíticos)** | 8 |
| **Scripts** | 6 |
| **Tests** | 0 |
| **console.log** | 532 |
| **Uso de `any`** | 583 |
| **@ts-ignore** | 3 |
| **TODOs** | 5 |
| **Errores TS pre-existentes** | 14 |
| **Líneas de código estimadas** | ~80,000+ |

---

*Documento generado el 29 de Mayo de 2026 para Xpand Capital — Equipo de Desarrollo*



