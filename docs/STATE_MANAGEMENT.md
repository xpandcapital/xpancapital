# BLIS Corp - Guía de Gestión de Estado

> **Versión:** 1.0  
> **Última actualización:** 2026-04-07  
> **Estado:** OBLIGATORIO - Decisiones de estado deben seguir esta guía

---

## 🧭 Filosofía General

**Principio:** El estado más simple posible, tan cerca del componente que lo usa como sea viable.

```
Nivel de Complejidad → Complejidad de Solución

Local (1 componente)     → useState
Derived (calculado)      → useMemo / useDerivedState
Shared (2-3 componentes) → Context API
Global (4+ componentes)  → Zustand / React Query
Server State             → React Query / SWR
```

---

## 📊 Matriz de Decisiones

| Tipo de Estado | Ejemplo | Solución | Persistencia |
|----------------|---------|----------|--------------|
| UI local (modales) | `isModalOpen` | `useState` | No |
| UI local complejo | Formulario multi-step | `useReducer` | No |
| Derived state | Total carrito | `useMemo` | No |
| Filtros activos | Permalink | URL state (`useSearchParams`) | URL |
| Selección múltiple | Bulk edit | Custom Hook con dispatch | No |
| Toast notifications | Global alerts | Context API + Portal | No |
| User session | Auth state | Context API + localStorage | localStorage |
| Server cache | Lista productos | React Query | Cache |
| Real-time data | Stock updates | React Query + WebSocket | Cache |

---

## 🏗️ Patrones por Contexto

### 1. Estado Local Simple

**Cuándo:** Estado usado solo en UN componente.

```typescript
// _components/ProductCard.tsx
function ProductCard({ product }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <QuickActions product={product} />}
    </div>
  );
}
```

---

### 2. Estado Derivado

**Cuándo:** Valor calculado de otros estados.

```typescript
// ❌ INCORRECTO - Estado redundante
const [total, setTotal] = useState(0);
useEffect(() => setTotal(price * quantity), [price, quantity]);

// ✅ CORRECTO - Derivado
const total = useMemo(
  () => price * quantity,
  [price, quantity]
);
```

---

### 3. Custom Hook con Lógica de Negocio

**Cuándo:** Estado compartido entre 2-3 componentes del mismo feature.

```typescript
// _hooks/useProductFilters.ts
interface FilterState {
  search: string;
  categories: string[];
  sortBy: SortOption;
  page: number;
}

interface UseProductFiltersReturn {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  categories: [],
  sortBy: 'name-asc',
  page: 1
};

export function useProductFilters(): UseProductFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  const setFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);
  
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    return count;
  }, [filters]);
  
  return {
    filters,
    setFilter,
    resetFilters,
    activeFiltersCount
  };
}
```

---

### 4. Context API

**Cuándo:** Estado global para UI (no server data).

```typescript
// context/ToastContext.tsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);
  
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastPortal toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
```

---

### 5. URL State

**Cuándo:** Estado que debe ser shareable/bookmarkable.

```typescript
// _hooks/useProductFilters.ts (con URL sync)
export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const filters = useMemo(() => ({
    search: searchParams.get('q') || '',
    category: searchParams.get('cat') || 'all',
    page: parseInt(searchParams.get('page') || '1'),
  }), [searchParams]);
  
  const setFilter = useCallback(<K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K]
  ) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key === 'search' ? 'q' : key, String(value));
    } else {
      params.delete(key === 'search' ? 'q' : key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);
  
  return { filters, setFilter };
}
```

---

### 6. React Query (Server State)

**Cuándo:** Datos del servidor que necesitan cache, refresh, optimistic updates.

```typescript
// _hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (product: ProductInput) => createProduct(product),
    onMutate: async (newProduct) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previous = queryClient.getQueryData(['products']);
      
      queryClient.setQueryData(['products'], (old: Product[] = []) => 
        [...old, { ...newProduct, id: 'temp-id' }]
      );
      
      return { previous };
    },
    onError: (err, newProduct, context) => {
      // Rollback on error
      queryClient.setQueryData(['products'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

---

### 7. Zustand (Estado Global Complejo)

**Cuándo:** Estado global con acciones complejas, sin necesidad de server sync.

```typescript
// store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: crypto.randomUUID() }]
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => 
          i.id === id ? { ...i, quantity } : i
        )
      })),
      
      clear: () => set({ items: [] }),
      
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'blis-cart-storage' }
  )
);
```

---

## 🔒 Reglas de Inmutabilidad

### Nunca mutar estado directamente

```typescript
// ❌ INCORRECTO - Mutación directa
const handleUpdate = (id: string, changes: Partial<Product>) => {
  const product = products.find(p => p.id === id);
  product.name = changes.name; // MUTACIÓN!
  setProducts([...products]);
};

// ✅ CORRECTO - Inmutabilidad
const handleUpdate = (id: string, changes: Partial<Product>) => {
  setProducts(prev => prev.map(p => 
    p.id === id ? { ...p, ...changes } : p
  ));
};
```

---

### Arrays: usar métodos inmutables

| Operación | ❌ Mutación | ✅ Inmutable |
|-----------|-------------|--------------|
| Agregar | `arr.push(x)` | `[...arr, x]` |
| Eliminar | `arr.splice(i, 1)` | `arr.filter((_, idx) => idx !== i)` |
| Actualizar | `arr[i].x = y` | `arr.map((item, idx) => idx === i ? {...item, x: y} : item)` |
| Ordenar | `arr.sort()` | `[...arr].sort()` |
| Reverse | `arr.reverse()` | `[...arr].reverse()` |

---

## ⚠️ Anti-Patterns Comunes

### 1. Estado Duplicado

```typescript
// ❌ INCORRECTO - products y filteredProducts
const [products, setProducts] = useState([]);
const [filteredProducts, setFilteredProducts] = useState([]);

useEffect(() => {
  setFilteredProducts(products.filter(...));
}, [products, filters]);

// ✅ CORRECTO - Solo products, filtrar en render
const [products, setProducts] = useState([]);

const filteredProducts = useMemo(
  () => products.filter(/* ... */),
  [products, filters]
);
```

---

### 2. Prop Drilling Excesivo

```typescript
// ❌ INCORRECTO - Pasando props innecesariamente
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user}>
      <GreatGrandChild user={user} /> {/* solo aquí se usa */}
    </GrandChild>
  </Child>
</Parent>

// ✅ CORRECTO - Context o composición
<UserProvider><Layout /></UserProvider>

// o mejor aún, composición:
<Parent>
  <Child>
    <GrandChild>
      <GreatGrandChild user={useUser()} /> {/* solo donde se necesita */}
    </GrandChild>
  </Child>
</Parent>
```

---

### 3. useEffect para Derived State

```typescript
// ❌ INCORRECTO
const [total, setTotal] = useState(0);
useEffect(() => setTotal(items.reduce((s, i) => s + i.price, 0)), [items]);

// ✅ CORRECTO
const total = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items]);
```

---

## 📝 Checklist de Estado

Antes de agregar un nuevo estado, verificar:

- [ ] ¿Realmente necesito estado? ¿Puedo derivarlo?
- [ ] ¿Qué componentes lo necesitan? ¿Solo uno? → useState
- [ ] ¿Necesita persistirse? → localStorage / URL
- [ ] ¿Es data del servidor? → React Query
- [ ] ¿Cambia frecuentemente? → useMemo/useCallback
- [ ] ¿Necesito debug tools? → Zustand con devtools

---

**Mantenido por:** BLIS Corp Development Team  
**Próxima revisión:** 2026-07-07