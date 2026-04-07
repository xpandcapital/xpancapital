# Sistema de Monedas - Guía de Uso

## Conceptos Clave

### 1. Moneda Fiscal (Fiscal Currency)
- **Definición**: Moneda en la que se cobra y pagan impuestos
- **Ejemplo**: PEN (Sol Peruano) para empresas en Perú
- **Uso**: Checkout, pagos, facturación, reportes fiscales
- **Almacenamiento**: Se guarda en la base de datos

### 2. Moneda de Visualización (Display Currency)
- **Definición**: Moneda que ve el cliente en la tienda
- **Ejemplo**: USD para cliente de Estados Unidos
- **Uso**: Catálogo, productos, precios mostrados
- **Cálculo**: Conversión en tiempo real usando APIs

### 3. Moneda de Impuestos (Tax Currency)
- **Definición**: Moneda para cálculos de impuestos
- **Ejemplo**: PEN para SUNAT
- **Uso**: Cálculo de IGV, reportes tributarios

## Flujo de Trabajo

```
Producto (DB):
  - precio: 100
  - moneda_fiscal: "PEN"

Visualización (Cliente de USA):
  - Detecta ubicación: USD
  - Consulta tipo de cambio: 1 PEN = 0.27 USD
  - Muestra: "$27.00 USD ≈ S/100 PEN"

Checkout:
  - Siempre cobra en PEN: S/100
  - Pasarela recibe: 100 PEN
  - Impuestos: 18% IGV = 18 PEN
```

## Uso en Código

### Mostrar Precio Convertido

```tsx
import { PriceDisplay } from '@/components/PriceDisplay'

// En el catálogo
<PriceDisplay 
  amount={100} 
  currency="PEN" 
  showConverted={true}
/>

// Output: "$27.00 USD" (para cliente de USA)
//         "S/100 PEN" (debajo, más pequeño)
```

### Checkout (Siempre en Moneda Fiscal)

```tsx
import { useCurrency } from '@/context/CurrencyContext'

function Checkout() {
  const { fiscalCurrency, convertToFiscal } = useCurrency()
  
  const productPrice = 100 // en PEN
  const total = convertToFiscal(productPrice, 'USD') // Si el cliente vio USD
  
  // Cobrar: total en fiscalCurrency (PEN)
}
```

### Detectar Moneda del Usuario

```tsx
import { useEffect, useState } from 'react'

function detectUserCurrency() {
  // 1. Verificar preferencia guardada
  const saved = localStorage.getItem('userCurrency')
  if (saved) return saved
  
  // 2. Detectar por timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  const map: { [key: string]: string } = {
    'America/Lima': 'PEN',
    'America/Mexico_City': 'MXN',
    'America/Bogota': 'COP',
    'America/New_York': 'USD',
    'Europe/Madrid': 'EUR',
  }
  
  return map[timezone] || 'USD'
}
```

## Configuración

### 1. Definir Moneda Fiscal

En el dashboard de administración:
- Ir a: Configuración → Monedas
- Seleccionar "Moneda Fiscal": PEN
- Guardar cambios

### 2. Activar Visualización Multi-Moneda

- Activar toggle "Multi-Moneda"
- Seleccionar monedas disponibles para visualización
- Sistema actualizará tipos de cambio automáticamente

### 3. APIs de Tipo de Cambio

El sistema usa estas APIs en orden de prioridad:
1. **Perú API** (peruapi.com) - Para datos oficiales de Perú
2. **ExchangeRate-API** - Fallback gratuito
3. **Valores por defecto** - Si todo falla

Actualización: Cada 1 hora automáticamente.

## Ejemplos de Implementación

### Producto con Precio Fiscal

```typescript
interface Product {
  id: string
  nombre: string
  precio_fiscal: number      // 100
  moneda_fiscal: string      // "PEN"
  // No guardamos precios en otras monedas
}
```

### Mostrar en Catálogo

```tsx
function ProductCard({ product }: { product: Product }) {
  const { convertFromFiscal, fiscalCurrency } = useCurrency()
  const [userCurrency, setUserCurrency] = useState('USD')
  
  const displayPrice = convertFromFiscal(
    product.precio_fiscal, 
    userCurrency
  )
  
  return (
    <div>
      <span className="text-2xl font-bold">
        ${displayPrice} {userCurrency}
      </span>
      <span className="text-sm text-gray-500">
        ≈ {product.precio_fiscal} {fiscalCurrency.code}
      </span>
    </div>
  )
}
```

### Pasarela de Pagos

```tsx
function PaymentGateway({ cart }: { cart: CartItem[] }) {
  const { fiscalCurrency } = useCurrency()
  
  const totalFiscal = cart.reduce((sum, item) => {
    return sum + (item.precio_fiscal * item.cantidad)
  }, 0)
  
  // Siempre cobrar en moneda fiscal
  return <Checkout amount={totalFiscal} currency={fiscalCurrency.code} />
}
```

## Preguntas Frecuentes

### ¿Por qué no guardar precios en todas las monedas?
- **Ventaja**: Un solo precio, menos complejidad
- **Desventaja**: Tipo de cambio fluctúa
- **Solución**: Actualizar tasas cada hora

### ¿Qué pasa si el tipo de cambio cambia?
- Los precios mostrados se actualizan automáticamente
- Los precios guardados en DB no cambian (siempre en moneda fiscal)

### ¿Cómo manejar redondeos?
- Usar 2 decimales para mostrar
- Usar precisión total para cálculos internos
- Redondear solo al mostrar al cliente

### ¿Y los impuestos?
- Calcular siempre en moneda fiscal
- Mostrar desglose: Subtotal + IGV = Total
- Ejemplo: S/100 + S/18 IGV = S/118

## Configuración Recomendada por País

### Perú (SUNAT)
- Moneda Fiscal: PEN
- Impuestos: IGV 18%
- API: peruapi.com

### México (SAT)
- Moneda Fiscal: MXN
- Impuestos: IVA 16%
- API: Abrir tipo de cambio del Banco de México

### Colombia (DIAN)
- Moneda Fiscal: COP
- Impuestos: IVA 19%
- API: Superfinanciera

### Ecuador (SRI)
- Moneda Fiscal: USD
- Impuestos: IVA 12%
- Nota: Dolarizado, no necesita conversión

## Troubleshooting

### Error: "No se pueden obtener tipos de cambio"
- Verificar conexión a internet
- Revisar si las APIs están activas
- Sistema usará valores por defecto

### Precios no se actualizan
- Refrescar página (F5)
- Verificar que multi-moneda esté activado
- Revisar consola del navegador

### Checkout muestra moneda incorrecta
- Verificar configuración de moneda fiscal
- Revisar que el producto tenga moneda_fiscal definida
- Contactar soporte si persiste
