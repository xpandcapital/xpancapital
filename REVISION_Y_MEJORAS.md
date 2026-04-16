# 🔍 Revisión y Mejoras Pendientes

## 📋 Resumen Ejecutivo

| Categoría | Pendientes | Prioridad |
|-----------|------------|-----------|
| **TypeScript** | 14 errores pre-existentes | Alta |
| **Archivos Grandes** | 10 archivos > 50KB | Media |
| **Tests** | Sin tests unitarios | Alta |
| **Código Limpio** | console.logs, imports sin usar | Baja |

---

## 1. 🐛 Errores TypeScript Pre-existentes (14 errores)

### Context/LandingCMSContext.tsx (7 errores)
**Ubicación:** `context/LandingCMSContext.tsx:535-556`
**Problema:** Indexación con tipo `string` en objetos tipados
**Solución:**
```typescript
// Cambiar de:
cmsData[section][key] = value

// A:
type SectionKey = keyof typeof cmsData
cmsData[section as SectionKey][key] = value
```

### lib/hooks/useLandingTemplate.ts (2 errores)
**Ubicación:** `lib/hooks/useLandingTemplate.ts:103,107`
**Problema:** Retorna `{}` | `null` en lugar de `TemplateSection | null`

### lib/types/domain/entities.ts (1 error)
**Problema:** `ProjectConfig` no está definido

### lib/types/domain/schemas.ts (4 errores)
**Problema:** Argumentos faltantes en definiciones de esquemas

---

## 2. 📁 Archivos Grandes Pendientes de Refactorizar

| Archivo | Tamaño | Líneas Estimadas | Prioridad |
|---------|--------|------------------|-----------|
| `app/superadmin/api-nube/page.tsx` | 222 KB | ~3,400 | ⏳ Backup existe |
| `app/superadmin/clientes/page.tsx` | 136 KB | ~1,600 | Media |
| `app/superadmin/cursos/page.tsx` | 134 KB | ~1,700 | Media |
| `app/superadmin/templates/[id]/page.tsx` | 154 KB | ~1,900 | Media |
| `app/superadmin/trading/TerminalLogic.tsx` | 325 KB | ~4,000 | Alta |
| `app/superadmin/GestionDeLotes.tsx` | 175 KB | ~2,100 | Media |
| `components/superadmin/SidebarTools.tsx` | 167 KB | ~2,000 | Baja |
| `components/sections/Header.tsx` | 55 KB | ~700 | Baja |

---

## 3. 🧪 Tests (0 archivos de test)

**Estado actual:** Sin tests unitarios

### Tests Necesarios

```
tests/
├── unit/
│   ├── hooks/
│   │   ├── useProducts.test.ts
│   │   ├── useClients.test.ts
│   │   ├── useProjects.test.ts
│   │   └── useTemplates.test.ts
│   ├── components/
│   │   ├── ProductCard.test.tsx
│   │   └── CustomSelect.test.tsx
│   └── utils/
│       └── helpers.test.ts
├── integration/
│   └── api/
│       ├── leads.test.ts
│       └── templates.test.ts
└── e2e/
    └── admin/
        └── products.spec.ts
```

### Configuración Recomendada

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'app/api/']
    }
  }
})
```

---

## 4. 🧹 Limpieza de Código

### console.logs

```bash
# Buscar console.logs
grep -r "console\." --include="*.tsx" --include="*.ts" app/ components/ lib/
```

**Archivos con console.log:**
- `app/superadmin/api-nube/page.tsx`
- `app/superadmin/clientes/page.tsx`
- `lib/hooks/*.ts`

### Imports Sin Usar

```bash
# Verificar con ESLint
npm run lint
```

---

## 5. 🔒 Seguridad

### Variables de Entorno Pendientes

```env
# .env.local (falta documentar)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
NEXT_PUBLIC_SITE_URL=
```

### Headers de Seguridad

```typescript
// next.config.js - Añadir headers
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
]
```

---

## 6. 📱 Responsive/Falta

### Breakpoints Verificar

| Componente | Móvil | Tablet | Desktop |
|------------|-------|--------|---------|
| Header | ❓ | ❓ | ✅ |
| Sidebar | ✅ | ✅ | ✅ |
| Cards | ✅ | ❓ | ✅ |
| Tables | ❓ | ❓ | ✅ |

### Pendientes
- [ ] Revisar tablas en móvil (scroll horizontal)
- [ ] Verificar modales en pantallas pequeñas
- [ ] Comprobar sidebar colapsable

---

## 7. ⚡ Performance

### Bundle Size

```bash
# Analizar bundle
npx @next/bundle-analyzer
```

### Optimizaciones Pendientes

1. **Lazy Loading**
   ```typescript
   // Cambiar imports dinámicos
   const ProductCard = dynamic(() => import('./ProductCard'))
   ```

2. **Images**
   - Usar `next/image` en todas las imágenes
   - Añadir `priority` a imágenes above-the-fold

3. **Fonts**
   - Ya usa `next/font` ✅

---

## 8. ♿ Accesibilidad

### Verificaciones Pendientes

- [ ] Contrast ratios mínimo 4.5:1
- [ ] Focus visible en todos los elementos interactivos
- [ ] Labels en todos los inputs
- [ ] Alt text en todas las imágenes
- [ ] Aria-labels en botones de iconos

### Herramienta Recomendada

```bash
# Instalar
npm install -D eslint-plugin-jsx-a11y

# .eslintrc
{
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

---

## 9. 🌐 SEO

### Pendiente

- [x] Sitemap dinámico
- [x] robots.txt
- [ ] Meta tags por página
- [ ] Open Graph images
- [ ] Schema.org markup

### Example

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: 'BLIS Corp', template: '%s | BLIS Corp' },
  description: '...',
  openGraph: {
    title: '...',
    images: ['/og.png']
  }
}
```

---

## 📊 Priorización

### Alta Prioridad (Ahora)
1. ✅ Refactorización modular completada
2. ⏳ Arreglar 14 errores TypeScript
3. ⏳ Añadir tests unitarios básicos

### Media Prioridad (Próximas)
4. Refactorizar archivos grandes restantes
5. Limpiar console.logs
6. Security headers

### Baja Prioridad (Futuro)
7. Accesibilidad completa
8. SEO avanzado
9. Performance optimization

---

## 🔧 Comandos de Verificación

```bash
# TypeScript
npx tsc --noEmit

# Linting
npm run lint

# Buscar TODOs
grep -r "TODO" --include="*.tsx" --include="*.ts" app/ components/ lib/

# Buscar console.logs
grep -r "console\." --include="*.tsx" --include="*.ts" app/ components/ lib/ | wc -l

# Archivos grandes
find app components lib -name "*.tsx" -size +50k
```

---

*Documento generado: 2026-04-08*
*BLIS Corp Development Team*