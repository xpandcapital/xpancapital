# 📋 BLIS Corp - Documentación de Desarrollo

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
blis-corp/
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

*Documento v2.0 - BLIS Corp Development Team*