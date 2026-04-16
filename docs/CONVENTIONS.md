# BLIS Corp - Convenciones de Código

> **Versión:** 1.0  
> **Última actualización:** 2026-04-07  
> **Estado:** OBLIGATORIO - Todo nuevo código debe seguir estas reglas

---

## 🚨 Reglas de Oro

### 1. Límite de Líneas por Archivo

| Tipo de Archivo | Soft Limit | Hard Limit | Acción si excede |
|-----------------|------------|------------|------------------|
| Componente React | 300 líneas | 500 líneas | Dividir en sub-componentes |
| Custom Hook | 150 líneas | 250 líneas | Dividir responsabilidades |
| Utilidad/Helper | 200 líneas | 400 líneas | Separar en módulos |
| Tipo/Interface | Sin límite | - | - |

**Violación**: PR bloqueado automáticamente por CI.

---

### 2. Estructura de Archivos Obligatoria

```
feature/
├── page.tsx              # Solo orquestación, <150 líneas
├── _components/
│   ├── Component.tsx     # Componente principal
│   ├── ComponentParts/   # Sub-componentes si es necesario
│   └── index.ts          # Barrel export
├── _hooks/
│   └── useFeature.ts     # Lógica de estado
├── _types/
│   └── types.ts          # Tipos e interfaces
├── _utils/
│   └── helpers.ts        # Funciones puras
└── _constants/
    └── constants.ts      # Valores estáticos
```

**El prefijo `_` indica carpetas privadas** (no exported fuera del módulo).

---

### 3. Orden de Imports

```typescript
// 1. React core
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

// 3. Internal contexts
import { useBusinessSettings } from '@/context/BusinessSettingsContext';

// 4. Internal hooks
import { useProducts } from './_hooks/useProducts';

// 5. Internal components
import { ProductTable } from './_components/ProductTable';

// 6. Types
import type { Product } from './_types/types';

// 7. Constants
import { DEFAULT_PAGE_SIZE } from './_constants/constants';
```

---

### 4. Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componente | PascalCase | `ProductCard` |
| Hook | camelCase con prefijo use | `useProductFilters` |
| Utilidad | camelCase | `formatCurrency` |
| Constante | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Tipo/Interface | PascalCase | `ProductState` |
| Archivo componente | PascalCase | `ProductCard.tsx` |
| Archivo hook | camelCase | `useProducts.ts` |
| Carpeta de feature | kebab-case | `product-management/` |

---

### 5. Responsabilidad Única por Archivo

**❌ INCORRECTO:**
```typescript
// ProductPage.tsx - 3000 líneas mezclando todo
export default function ProductPage() {
  // Estado global
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [modals, setModals] = useState({});
  
  // Lógica de negocio
  const calculatePrice = () => {...}
  const validateForm = () => {...}
  const sendAnalytics = () => {...}
  // ... 2900 líneas más
}
```

**✅ CORRECTO:**
```typescript
// page.tsx - 80 líneas solo orquestación
export default function ProductPage() {
  const { products, loading } = useProducts();
  const { filters, setFilters } = useProductFilters();
  
  return (
    <ProductProvider>
      <ProductToolbar filters={filters} onFilterChange={setFilters} />
      <ProductTable products={products} loading={loading} />
    </ProductProvider>
  );
}
```

---

### 6. Estado en Componentes

**Regla:** Máximo 10 `useState` por componente. Si necesitas más, extrae a hooks.

```typescript
// ❌ INCORRECTO - 15 useState hooks
const [a, setA] = useState();
const [b, setB] = useState();
// ... 13 más

// ✅ CORRECTO - Máximo 10, o usa useReducer o context
const [state, dispatch] = useReducer(productReducer, initialState);
```

---

### 7. useEffect con Dependencias Explícitas

**❌ PROHIBIDO:**
```typescript
useEffect(() => {
  fetchData();
}, []); // ESLint warning ignorado
```

**✅ OBLIGATORIO:**
```typescript
useEffect(() => {
  if (userId) {
    fetchUserData(userId);
  }
}, [userId]); // Dependencias explícitas
```

---

### 8. Manejo de Errores

Todo código async debe tener try-catch:

```typescript
// ✅ CORRECTO
const handleSubmit = async () => {
  try {
    await saveProduct(formData);
    showToast({ type: 'success', message: 'Guardado' });
  } catch (error) {
    if (error instanceof ValidationError) {
      setFormErrors(error.fields);
    } else {
      showToast({ type: 'error', message: 'Error inesperado' });
    }
    console.error('[ProductPage]', error);
  }
};
```

---

### 9. Comentarios y Documentación

**Prohibido:**
- Comentarios que explican QUÉ hace el código
- Código comentado (usar git history)

**Obligatorio:**
- JSDoc para funciones públicas
- Comentarios explicando POR QUÉ una decisión

```typescript
// ❌ INCORRECTO
// Recorre los productos
products.forEach(p => p.price *= 1.1);

// ✅ CORRECTO
// Apply 10% inflation adjustment per Q2 2024 policy
products.forEach(p => p.price *= 1.1);
```

---

### 10. Testing Requirements

| Tipo | Cobertura Mínima |
|------|------------------|
| Hooks críticos | 80% |
| Utilidades | 90% |
| Componentes UI | 60% |

---

## 🔒 Anti-Patterns Prohibidos

1. **Props drilling > 3 niveles** → Usar Context o lifting state
2. **`any` type** → Usar `unknown` o tipo específico
3. **Inline styles > 50 caracteres** → Usar Tailwind o CSS
4. **Componentes anónimos** → Siempre con nombre
5. **API calls en useEffect sin abort controller** → Memory leaks
6. **Console.log en producción** → Usar logger con levels

---

## 📚 Referencias

- [React Documentation](https://react.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Mantenido por:** BLIS Corp Development Team  
**Próxima revisión:** 2026-07-07