# 📋 Xpand Capital - Documentación de Desarrollo

## ⚠️ IDIOMA OBLIGATORIO

**TODAS las respuestas, comentarios, explicaciones, mensajes de commit y comunicación con el usuario DEBEN estar en ESPAÑOL.** No importa el idioma en el que el usuario escriba, la respuesta SIEMPRE debe ser en español. Esto incluye:
- Explicaciones de código o decisiones técnicas
- Confirmaciones de acciones realizadas
- Preguntas de clarificación
- Mensajes de error y advertencias
- Comentarios en código si se solicitan

**EXCEPCIÓN:** El código fuente (nombres de variables, funciones, textos de UI, etc.) se mantiene en el idioma original del proyecto.

## 📁 Estructura del Proyecto

```
xpancapital/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas de autenticación
│   ├── (public)/            # Páginas públicas (landing, formularios)
│   ├── superadmin/          # Panel de administración
│   │   ├── _types/          # Tipos compartidos por módulo
│   │   ├── _hooks/          # Hooks personalizados por módulo
│   │   └── _components/     # Componentes modulares por módulo
│   └── api/                 # API Routes
├── components/              # Componentes reutilizables
├── context/                 # React Context providers
├── docs/                    # Documentación técnica
├── lib/                     # Utilidades y hooks globales
├── public/                   # Archivos estáticos
└── supabase/                # Migraciones y funciones de BD
```

## 🏗️ Arquitectura Modular

### Principios de Refactorización

El proyecto sigue una arquitectura modular para componentes grandes:

```
app/superadmin/[módulo]/
├── page.tsx                 # Página principal (<400 líneas)
├── _types/
│   └── index.ts            # Tipos e interfaces
├── _hooks/
│   ├── index.ts            # Barrel export
│   └── use[Módulo].ts      # Hooks de estado y lógica
└── _components/
    ├── index.ts            # Barrel export
    ├── [Component]1.tsx    # Componentes UI (<300 líneas)
    └── [Component]2.tsx
```

### Módulos Refactorizados

| Módulo | Original | Estado | Archivos |
|--------|----------|--------|----------|
| productos | 2,777 lines | ✅ Completado | 33 archivos |
| api-nube | 3,404 lines | ✅ Modular | 12 archivos |
| cursos | 1,742 lines | ✅ Parcial | 6 archivos |
| clientes | 1,601 lines | ✅ Parcial | 6 archivos |
| proyectos | 1,243 lines | ✅ Parcial | 3 archivos |
| certificados | 778 lines | ✅ Parcial | 3 archivos |
| configuracion | 690 lines | ✅ Parcial | 4 archivos |
| ajustes | 687 lines | ✅ Parcial | 2 archivos |

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

```sql
-- Empresas (Multi-tenant)
empresas (id, nombre, slug, config, created_at)

-- Usuarios y Roles
profiles (id, empresa_id, email, nombre, rol, blis_coins...)
roles (id, nombre, permisos)

-- Productos y Catálogo
productos (id, empresa_id, nombre, precio, stock...)
categorias (id, empresa_id, nombre...)

-- Plantillas y Landing Pages
templates (id, empresa_id, nombre, secciones, config...)
landings (id, empresa_id, template_id, slug...)

-- Leads y Campañas
campanas (id, empresa_id, asesor_id, nombre...)
asesores (id, empresa_id, nombre, email...)
leads (id, empresa_id, campana_id, asesor_id, datos...)
```

### Migraciones Recientes

- `022_templates_section_order.sql` - Orden y visibilidad de secciones
- `029_leads_campanas.sql` - Sistema de leads y campañas
- `030_api_keys.sql` - Almacenamiento de claves API

---

## 🔌 APIs y Endpoints

### Sistema de Leads

```
POST /api/leads          # Crear lead desde formulario
GET  /api/leads          # Listar leads (admin)
PUT  /api/leads          # Actualizar estado/asignación

POST /api/campanas       # Crear campaña
GET  /api/campanas       # Listar campañas
PUT  /api/campanas       # Actualizar campaña

POST /api/asesores       # Crear asesor
GET  /api/asesores       # Listar asesores
```

### Templates y Landing

```
GET  /api/templates           # Listar templates
POST /api/templates           # Crear template
GET  /api/templates/[id]      # Obtener template
PUT  /api/templates/[id]      # Actualizar template

GET  /api/templates/landing   # CMS landing page
```

### Administración

```
GET  /api/admin/clientes      # Listar clientes
PUT  /api/admin/clientes      # Actualizar cliente
GET  /api/admin/cursos        # Listar cursos
POST /api/admin/cursos        # Crear curso
GET  /api/admin/proyectos     # Listar proyectos
```

---

## 🎨 Sistema de Leads y Campañas

### Estructura

```typescript
interface Campana {
  id: string
  empresa_id: string
  asesor_id?: string
  nombre: string
  descripcion?: string
  estado: 'activa' | 'pausada' | 'completada'
  notificar_email: boolean
  notificar_whatsapp: boolean
  emails_notificacion: string[]
  whatsapp_notificacion: string[]
}

interface Lead {
  id: string
  empresa_id: string
  campana_id?: string
  asesor_id?: string
  nombre: string
  email?: string
  telefono?: string
  datos: Record<string, any>
  estado: 'nuevo' | 'contactado' | 'calificado' | 'convertido'
}
```

### Flujo

```
Usuario → Formulario → POST /api/leads → Supabase
    ↓
Trigger notifica_nuevo_lead()
    ↓
Notificaciones: Email, WhatsApp, Notion
    ↓
Lead redirigido a página de gracias
```

---

## 🔧 Hooks Personalizados

### Hooks Globales (`lib/hooks/`)

```typescript
// Gestión de templates
useLandingTemplate() → { template, loading, updateSection }
useTemplates() → { templates, create, update, delete }

// Gestión de empresas
useEmpresa() → { empresa, update, config }

// Autenticación
useAuth() → { user, session, signIn, signOut }
```

### Hooks por Módulo

```typescript
// Productos
useProducts() → { products, loading, create, update, delete }
useProductFilters() → { filters, setFilter, filteredProducts }

// Clientes
useClients() → { clients, loading, update, delete }

// Proyectos
useProjects() → { projects, loading, save, delete }
useNotionSync() → { syncWithNotion, syncing }

// Cursos
useCourseManagement() → { courses, create, update, delete }

// Certificados
useTemplates() → { templates, loading, save, delete }
useCanvasEditor() → { selectedId, moveElement, scaleElement }
```

---

## 📦 Componentes Principales

### Editor de Plantillas (`components/editor/`)

- `ImageUpload.tsx` - Subida de imágenes con drag & drop
- `MapPointEditor.tsx` - Editor visual de puntos en mapa
- `ColorPicker.tsx` - Selector de colores con hex input

### Secciones de Landing (`components/sections/`)

- `Hero.tsx` - Sección de portada
- `About.tsx` - Sección "Nosotros"
- `Process.tsx` - Proceso de trabajo
- `Projects.tsx` - Proyectos destacados
- `Testimonials.tsx` - Testimonios
- `CustomHeader.tsx` - Header personalizable
- `CustomFooter.tsx` - Footer personalizable

### Administración (`app/superadmin/`)

- `productos/` - Gestión de productos
- `clientes/` - Gestión de clientes
- `cursos/` - Gestión de cursos
- `proyectos/` - Gestión de proyectos
- `certificados/` - Editor de certificados
- `api-nube/` - Configuración de APIs

---

## 🚀 Comandos

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run lint             # Linting
npm run typecheck        # Verificación de tipos

# Supabase
npx supabase start       # Iniciar instancia local
npx supabase db push     # Aplicar migraciones
npx supabase db reset    # Resetear base de datos

# Seeds
npx tsx scripts/seed-default-template.ts
```

---

## 🔐 Autenticación y Permisos

### Roles

- `superadmin` - Acceso completo a todas las empresas
- `admin` - Acceso completo a su empresa
- `editor` - Puede editar contenido pero no configuración
- `viewer` - Solo lectura

### Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Verificar sesión
  // Verificar permisos por rol
  // Redirigir si no autorizado
}
```

---

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS para estilos
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 🌐 Despliegue

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

### Plataformas Soportadas

- Vercel (recomendado)
- Netlify
- Docker

---

## ⚠️ REGLAS CRÍTICAS DE DATOS

### ❌ NUNCA USAR `tipo` PARA MOSTRAR CATEGORÍA

El campo `tipo` en productos (digital/fisico/servicio/suscripcion) es un campo interno de CLASIFICACIÓN, NO una categoría real. **NUNCA** debe usarse para mostrar al usuario.

**❌ INCORRECTO:**
```typescript
// Esto muestra etiquetas genéricas inventadas
<span>{product.tipo === 'servicio' ? 'Curso' : 'Ebook'}</span>
```

**✅ CORRECTO:**
```typescript
// Usar la categoría real del producto
<span>{product.categoria?.nombre || 'Producto'}</span>
```

### 🏷️ CATEGORÍA vs TIPO

| Campo | Tabla | Valores | Uso |
|-------|-------|---------|-----|
| `tipo` | `productos` | digital, fisico, servicio, suscripcion | Clasificación interna |
| `categoria` | `producto_categorias` | Cursos, Ebooks, Kits, etc. | Mostrar al usuario |

### 📦 Estructura de Datos

```sql
-- Tabla producto_categorias
producto_categorias (id, empresa_id, nombre, slug, sku_prefix, ...)

-- Tabla productos  
productos (id, empresa_id, nombre, ..., tipo, categoria_id REFERENCES producto_categorias)
```

### 🔗 Relaciones en API de Compras

```typescript
// API de compras debe incluir la relación categoria
supabase
  .from('compras')
  .select(`
    *,
    items:compra_items(
      ...,
      producto:productos(..., categoria:producto_categorias(nombre))
    )
  `)
```

---

## 📝 Convenciones de Código

### Naming

- **Componentes**: PascalCase (`ProductCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useProducts.ts`)
- **Tipos**: PascalCase (`Product`, `Client`)
- **Archivos**: camelCase para módulos, PascalCase para componentes

### Estructura de Componentes

```typescript
// Imports agrupados
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from 'lucide-react'

// Types
interface Props {
  title: string
  children: React.ReactNode
}

// Componente
export function Component({ title, children }: Props) {
  // Hooks
  const [state, setState] = useState()
  
  // Handlers
  const handleClick = () => {}
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

---

## 🔄 Changelog

### 2026-04-08: Refactorización Modular

- ✅ Refactorización de 8 módulos principales
- ✅ Creación de ~69 archivos modulares
- ✅ Extracción de tipos, hooks y componentes
- ✅ Sin errores de TypeScript

### 2026-03-30: Sistema de Leads

- ✅ Tablas `campanas`, `asesores`, `leads`, `integraciones`
- ✅ APIs de campañas y asesores
- ✅ Hooks useCampanas y useAsesores

---

*Documento v2.0 - Xpand Capital Development Team*

---

### DIRECTRICES DE REFACTORIZACIÓN VISUAL Y UI AVANZADA

**MISIÓN:** Refactorizar exclusivamente la capa visual y de interacción de la plataforma para lograr una UX inmersiva, cinematográfica y de altísima gama (estilo Awwwards).

## 🚫 REGLAS CRÍTICAS DE "CERO CREACIÓN"

1. **NO CREAR COMPONENTES NUEVOS:** Modificar los existentes en `components/sections/` y `components/ui/`.
2. **NO MODIFICAR LÓGICA:** Mantener intacta la lógica de Supabase, enrutamiento, contextos globales, formularios y bases de datos.
3. **CERO INSTALACIONES:** Usar estrictamente el ecosistema existente: `framer-motion`, `clsx`, `tailwind-merge`, `shadcn/ui` y las utilidades de animación configuradas.
4. **REUTILIZAR RECURSOS:** Aplicar variables de color (`--color-blis-red`), clases globales (`.glass`, `.neon-text`), y la utilidad `cn()`.

## 📱 REGLA DE ORO: ENFOQUE MOBILE-FIRST Y RENDIMIENTO TÁCTIL OBLIGATORIO

El tráfico principal de Xpand Capital proviene de dispositivos móviles. Al refactorizar con Tailwind CSS y Framer Motion, es obligatorio cumplir:

1. **Prioridad Tailwind Mobile-First:** Todo el maquetado y espaciado base debe estar pensado para pantallas pequeñas. Usar los prefijos `md:`, `lg:`, `xl:` exclusivamente para escalar el diseño hacia escritorio, nunca al revés.
2. **Interacciones Táctiles (Touch vs. Hover):** Los efectos avanzados que dependen del cursor (`onMouseMove`, `whileHover`, cursores magnéticos, tarjetas 3D que siguen al mouse) NO funcionan en móvil. Programar SIEMPRE un comportamiento de respaldo elegante para pantallas táctiles (usar `whileTap`, o reemplazar el hover por un revelado suave cuando el elemento entra en el viewport usando `whileInView`).
3. **Rendimiento Móvil (60fps):** La experiencia en celular debe sentirse como una app nativa, rápida y fluida. Si un efecto de Parallax, Trazado SVG o grid de fondo es muy pesado para el procesador de un teléfono, simplificarlo o desactivarlo en pantallas pequeñas (usando CSS `hidden md:block` o detectando el viewport).

## 🎨 SISTEMA DE DISEÑO AVANZADO (CIBER-LUJO)

* **Estética Dominante:** Modo oscuro profundo (#050505) como fondo principal.
* **Acentos e Iluminación:** Iluminación cinematográfica de fondo y destellos en rojo neón carmesí (`--color-blis-red-neon`). Efectos de borde con "tracing".
* **Transiciones:** 'Staggered fade-ins' sutiles, microinteracciones de hover fluidas (scale, glow effects), y animaciones de scroll con propósito claro.

## 📋 PLAN MAESTRO DE ANIMACIONES — SECCIÓN POR SECCIÓN

### 1. Hero Sections (`Hero.tsx`, `CaptureHero.tsx`)
* **Mecánica: Text Reveal Cinemático.**
  * *Objetivo visual:* Título y subtítulo.
  * *Implementación:* Contenedores con `overflow-hidden`. Dividir texto en palabras/letras y animar de `y: 20` a `y: 0`, con desenfoque inicial usando `filter: blur()`, con `staggerChildren` para efecto secuencial.
* **Mecánica: Scroll Parallax en Capas.**
  * *Objetivo visual:* Fondo tecnológico (grid, orbes con glow).
  * *Implementación:* Usar `useScroll` vinculado al contenedor principal del Hero. Aplicar `useTransform` para mover los elementos del fondo (grid) verticalmente más lento que el contenido de texto, creando profundidad.

### 2. Sección de Aliado Inmobiliario (`ConoceaBlis.tsx` o similar)
* **Mecánica: Staggered Fade-In on Viewport.**
  * *Objetivo visual:* Texto a la izquierda, bloque de imagen/video a la derecha.
  * *Implementación:* `whileInView` con `variants` para que la columna de texto se deslice desde la izquierda y el bloque de medios desde la derecha/abajo, con retraso en cascada.
* **Mecánica: Parallax de Imagen.**
  * *Objetivo visual:* Imagen/Video de construcción.
  * *Implementación:* Parallax sutil en la imagen dentro de su contenedor al hacer scroll, usando `useTransform` vinculado al progreso del scroll local.

### 3. Pasos de Proyecto (`Process.tsx`, `Steps.tsx`)
* **Mecánica: Trazado SVG por Scroll.**
  * *Objetivo visual:* Línea de tiempo que conecta los pasos.
  * *Implementación:* Animar `pathLength` de un `<motion.path>` SVG de 0 a 1, vinculado a `scrollYProgress`. La línea roja neón debe "dibujarse" a medida que el usuario baja.
* **Mecánica: Revelado de Tarjetas en Cascada.**
  * *Objetivo visual:* Tarjetas de pasos.
  * *Implementación:* Secuenciar aparición de tarjetas de izquierda a derecha cuando entran en el viewport.

### 4. Operaciones en Campo (`Operations.tsx`)
* **Mecánica: Parallax de Capas de Profundidad.**
  * *Objetivo visual:* Texto sobre imagen grande de maquinaria.
  * *Implementación:* Aplicar parallax a la imagen de fondo (moverla más lento) y parallax inverso sutil a la caja de texto (moverla un poco más rápido), dando sensación de profundidad.

### 5. Sección de Video de Trabajo (`SéTestigo.tsx`, `FunnelVideo.tsx`)
* **Mecánica: Borde Neón Pulsante.**
  * *Objetivo visual:* Contenedor del video central.
  * *Implementación:* Agregar elemento absoluto con borde neón rojo carmesí (`neon-border`) que pulse sutilmente (`animate={{ scale: [1, 1.01, 1] }}`). El video debe tener transición suave de opacidad y escala al entrar en pantalla.

### 6. Simulador de Precios (`Calculator.tsx`, `Pricing.tsx`)
* **Mecánica: Contadores Dinámicos con "Slot Machine".**
  * *Objetivo visual:* Números de precios y plazos.
  * *Implementación:* Números que giran rápidamente de 0 a su valor real solo cuando la sección cruza el 50% de la pantalla (`viewport={{ amount: 0.5 }}`).
* **Mecánica: Border Trace en Tarjetas.**
  * *Objetivo visual:* Contenedores de opciones de precios.
  * *Implementación:* Línea de borde delgada que se ilumine secuencialmente alrededor de la tarjeta activa o en hover.

### 7. Aliado Territorial (`TrustBadges.tsx`)
* **Mecánica: Marquee Infinito Suavizado.**
  * *Objetivo visual:* Marquee de logotipos de confianza.
  * *Implementación:* Carrusel de movimiento continuo horizontal que se pause automáticamente al hacer hover.

### 8. Nuestros Proyectos (`Projects.tsx`, `Catalog.tsx`)
* **Mecánica: Tarjetas 3D Magnéticas (Tilt Effect).**
  * *Objetivo visual:* Cuadrícula de tarjetas de proyectos.
  * *Implementación:* En hover, aplicar transformación 3D de inclinación (`rotateX`, `rotateY`) calculada según posición del cursor, con efecto `spring` sutil. El `.glass-card` debe intensificar su glow neón en el borde que mire hacia el mouse.

### 9. Nuestros Agentes (`Team.tsx`)
* **Mecánica: Revelado de Detalles Avanzado.**
  * *Objetivo visual:* Fotos de los asesores.
  * *Implementación:* En hover, imagen hace zoom in sutil (`scale: 1.05`), la superposición de gradiente oscuro se intensifica, y el texto con cargo/links de contacto se desliza desde abajo (`y: 10` a `y: 0`).

### 10. Testimonios (`Testimonials.tsx`)
* **Mecánica: Revelado Staggered on Enter.**
  * *Objetivo visual:* Tarjetas de testimonios.
  * *Implementación:* Secuenciar aparición de tarjetas al entrar en pantalla, con desplazamiento lateral o inferior.

### 11. Componentes Globales (Botones, Navbar, Footer)
* **Mecánica: Botones CTA Magnéticos.**
  * *Objetivo visual:* Botones principales de acción en Hero, simulador y footer.
  * *Implementación:* El botón debe ser "atraído" unos píxeles hacia el cursor cuando este se acerque, usando matemáticas de posición del mouse.
* **Mecánica: Navbar Dinámica.**
  * *Objetivo visual:* `CustomHeader`.
  * *Implementación:* El navbar debe ocultarse (`y: -100`) en scroll hacia abajo y reaparecer deslizándose desde arriba (`y: 0`) en scroll hacia arriba, activando el fondo `.glass`.

---

## 🗺️ MAPA DE ANIMACIONES UI — LANDING COMPLETA (15 SECCIONES)

Directrices exactas de refactorización visual para cada sección de la landing page principal.  
**Enfoque obligatorio:** MOBILE-FIRST + estética "Cyber-Luxe" (Dark mode #050505 + Crimson Neon).

### 1. INICIO (`Hero.tsx`)
* **Text Reveal Cinemático:** Título y subtítulo suben desde `y: 40` con `blur(6px)` inicial usando `staggerChildren` por letra. Contenedor con `overflow-hidden`.
* **Parallax de Fondo:** Grid tecnológico se mueve 30% más lento que el texto con `useScroll` + `useTransform`.
* **Botones Magnéticos (desktop):** CTA principal atraído sutilmente hacia el cursor. En móvil, `whileTap={{ scale: 0.95 }}`.

### 2. TRAYECTORIA (`About.tsx`)
* **Sticky Scroll (desktop):** Columna de texto fija mientras imágenes de historia hacen scroll vertical al lado.
* **Mobile:** Fade-in escalonado en ambas columnas al entrar al viewport.

### 3. PROCESO (`Process.tsx`)
* **Trazado SVG por Scroll:** Línea conectora `<motion.line>` con `pathLength` vinculado a `scrollYProgress`. Se dibuja en rojo neón al bajar.
* **Cascada de Tarjetas:** Cada paso entra con `whileInView` y `delay` incremental (`index * 0.15`).

### 4. BACKSTAGE (`Operations.tsx`)
* **Parallax de Profundidad:** Imagen de maquinaria se mueve más lento que el texto usando `useTransform` con valores distintos.
* **Reveal Asimétrico:** Texto desde izquierda, imagen desde derecha con `whileInView` en cascada.

### 5. VIDEO (`VideoShowcase.tsx`, `FunnelVideo.tsx`)
* **Scale-Up Suave:** Contenedor del video entra de `scale: 0.9` a `1`.
* **Borde Neón Pulsante:** Elemento absoluto con `neon-border` que pulsa `scale: [1, 1.01, 1]` para incitar al clic.

### 6. MERCADO (`Metrics.tsx`)
* **Contadores Slot-Machine:** Números giran de 0 a su valor real solo cuando la sección está al 50% visible (`viewport={{ amount: 0.5 }}`).
* **Easing cúbico:** `ease-out cubic` para desaceleración natural.

### 7. PLUSVALÍA (`StatsSection.tsx`)
* **Sparklines SVG:** Líneas de tendencia se dibujan con `pathLength` vinculado a scroll.
* **Glow en Puntos Críticos:** `drop-shadow` rojo neón en los picos de datos.

### 8. MAPA (`ProjectMap.tsx`)
* **Fade del Mapa Base:** El mapa entra con opacidad de 0 a 1.
* **Pines con Rebote:** Los marcadores caen desde `y: -20` con `type: "spring"` y `staggerChildren` para caída secuencial.

### 9. PORTAFOLIO (`Projects.tsx`, `Catalog.tsx`)
* **Tarjetas 3D Magnéticas (desktop):** Tilt effect con `rotateX`/`rotateY` (±10°) según posición del cursor. Glow tracker que sigue al mouse.
* **Mobile:** Carrusel con `snap` nativo CSS + `whileInView` para entrada animada.

### 10. TIENDA (`ProductGrid.tsx`, componentes en `components/tienda/`)
* **Microinteracciones:** Hover → imagen zoom 1.05x + botón "Comprar" se desliza desde `y: 10` a `y: 0`.
* **Mobile:** `whileTap` para feedback táctil inmediato.

### 11. ALIANZA / TEAM (`Team.tsx`)
* **Reveal de Detalles:** Hover → overlay oscuro se intensifica + cargo/links sociales se deslizan hacia arriba.
* **Mobile:** Toque mantiene el estado "activo" para mostrar detalles sin hover.

### 12. TESTIMONIOS (`Testimonials.tsx`)
* **Marquee Infinito:** Movimiento horizontal constante con `animate={{ x: ["0%", "-50%"] }}`.
* **Pausa al Hover:** `whileHover` detiene la animación. En móvil, `whileTap` pausa.

### 13. FAQ (`FAQ.tsx`)
* **Acordeones Fluidos:** `AnimatePresence` + `motion.div` con `animate={{ height: "auto" }}` para transiciones sin saltos.
* **Ícono Rotatorio:** Flecha/chevron rota 180° al expandir con `animate={{ rotate: isOpen ? 180 : 0 }}`.

### 14. BLOG (`BlogPosts.tsx`, `BlogHero.tsx`)
* **Grid en Cascada:** Tarjetas entran con `whileInView` + `delay` incremental.
* **Borde Neón al Hover:** `hover:border-blis-red-neon` + `hover:shadow-[0_0_15px_rgba(255,30,86,0.3)]`.

### 15. CONTACTO (`Footer.tsx`, formularios en `CaptureForm.tsx`)
* **Campos Secuenciales:** Inputs aparecen uno tras otro con `staggerChildren` (0.08s entre cada uno).
* **Botón Enviar:** Animación de carga interna (spinner + texto cambia a "Enviando..."). `whileTap={{ scale: 0.95 }}`.

---

## 🎨 Iconos de Marca (Brand Icons)

### Ubicación
```
public/icons/brands/
├── whatsapp.svg
├── google.svg
├── stripe.svg
├── ... (113 íconos)
```

### Cómo usarlos en componentes

```tsx
{/* Como imagen directa */}
<img src="/icons/brands/whatsapp.svg" className="w-5 h-5" alt="WhatsApp" />

{/* Como componente funcional inline */}
const WaIcon = () => <img src="/icons/brands/whatsapp.svg" className="w-5 h-5" alt="" />

{/* Con Next.js Image (para optimización) */}
import Image from "next/image"
<Image src="/icons/brands/stripe.svg" width={24} height={24} alt="Stripe" />
```

### Cómo descargar nuevos íconos

Los íconos provienen del repositorio [thesvg.org](https://github.com/glincker/thesvg) (`public/icons/`).

**Script:** `scripts/download-brand-icon.ts`

```bash
# Descargar uno
npx tsx scripts/download-brand-icon.ts notion

# Lote completo (todos los definidos en BATCH[])
npx tsx scripts/download-brand-icon.ts --batch
```

**Si un ícono no se encuentra**, probar nombres alternativos consultando el repo:
```bash
curl -s https://api.github.com/repos/glincker/thesvg/contents/public/icons/{nombre}
```

El script intenta variantes: `default.svg` → `wordmark.svg` → `mono.svg` → `icon.svg` → `color.svg`.

### ⚠️ Reglas

- **NO descargar íconos de otras fuentes** — solo del repo `glincker/thesvg`
- **Nombrar el archivo** exactamente como el nombre de marca (minúsculas, slugs): `google-play.svg`, `microsoft-teams.svg`
- **Si ya existe**, el script lo omite automáticamente
- Los SVGs son locales (sin dependencia externa en producción)
- Cada SVG pesa ~1-5KB — sin problema de rendimiento
