# BLIS Corp - Plataforma Inmobiliaria Multi-Tenant

Plataforma SaaS para gestión inmobiliaria con sistema de leads, campañas, y landing pages personalizables.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
blis-corp/
├── app/                    # Next.js App Router
│   ├── (auth)/           # Autenticación
│   ├── (public)/         # Páginas públicas
│   ├── superadmin/       # Panel de administración
│   └── api/              # API Routes
├── components/           # Componentes reutilizables
├── context/              # React Context
├── lib/                  # Utilidades y hooks
├── public/               # Archivos estáticos
└── supabase/             # Migraciones BD
```

## 🏗️ Arquitectura Modular

Cada módulo sigue esta estructura:

```
app/superadmin/[módulo]/
├── page.tsx              # Página principal
├── _types/index.ts       # Tipos
├── _hooks/               # Hooks personalizados
└── _components/          # Componentes UI
```

Ver [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) para detalles.

## 🔧 Comandos

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run lint             # Linting
npm run typecheck        # Verificación de tipos

# Supabase
npx supabase start       # Iniciar instancia local
npx supabase db push     # Aplicar migraciones
npx supabase db reset    # Resetear base de datos
```

## 🔌 APIs Principales

| Endpoint | Descripción |
|----------|-------------|
| `/api/leads` | Gestión de leads |
| `/api/campanas` | Campañas de marketing |
| `/api/templates` | Plantillas de landing |
| `/api/admin/clientes` | Gestión de clientes |
| `/api/admin/cursos` | Gestión de cursos |
| `/api/admin/proyectos` | Gestión de proyectos |

## 📝 Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=        # URL de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Clave pública
SUPABASE_SERVICE_KEY=           # Clave de servicio
```

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Iconos**: Lucide Icons
- **Estado**: React Context + Hooks

## 📊 Módulos Principales

| Módulo | Descripción | Líneas |
|--------|-------------|--------|
| `productos` | Gestión de productos | ~400 |
| `clientes` | Gestión de clientes | ~500 |
| `cursos` | Sistema de cursos | ~300 |
| `proyectos` | Gestión de proyectos | ~400 |
| `certificados` | Editor de certificados | ~300 |
| `api-nube` | Configuración de APIs | ~400 |

## 🔐 Roles de Usuario

- `superadmin` - Acceso total
- `admin` - Acceso a su empresa
- `editor` - Edición de contenido
- `viewer` - Solo lectura

## 📖 Documentación

- [AGENTS.md](./AGENTS.md) - Documentación técnica completa
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Resumen de refactorización
- [SESSION_STATUS.md](./SESSION_STATUS.md) - Estado actual del desarrollo

## 🤝 Contribuir

1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit: `git commit -m 'Añadir nueva funcionalidad'`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📄 Licencia

Privado - BLIS Corp © 2026