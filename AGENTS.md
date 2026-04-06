---

## 📊 SISTEMA DE LEADS Y CAMPAÑAS

### Estructura de Base de Datos

```sql
-- Tabla asesores
CREATE TABLE asesores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  whatsapp TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla campañas
CREATE TABLE campanas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  asesor_id UUID REFERENCES asesores(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'activa',
  notificar_email BOOLEAN DEFAULT true,
  notificar_whatsapp BOOLEAN DEFAULT false,
  emails_notificacion TEXT[],
  whatsapp_notificacion TEXT[],
  notion_database_id TEXT,
  notion_sync BOOLEAN DEFAULT false,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla leads (actualizada)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  campana_id UUID REFERENCES campanas(id),
  asesor_id UUID REFERENCES asesores(id),
  template_id UUID REFERENCES templates(id),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  whatsapp TEXT,
  datos JSONB DEFAULT '{}',
  ciudad TEXT,
  presupuesto TEXT,
  interes TEXT,
  mensaje TEXT,
  estado TEXT DEFAULT 'nuevo',
  etiquetas TEXT[],
  notas TEXT,
  origen TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla integraciones
CREATE TABLE integraciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  tipo TEXT CHECK (tipo IN ('whatsapp', 'email', 'notion', 'zapier', 'webhook')),
  nombre TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  activa BOOLEAN DEFAULT true
);
```

### Configuración de Formularios

```typescript
// En template.secciones.captureHero.form
interface FormConfig {
  title: string;
  subtitle: string;
  submitText: string;
  privacyText: string;
  
  // Destino del lead
  campana_id?: string;          // ID de campaña
  asesor_id?: string;            // ID de asesor asignado
  redirectUrl?: string;         // URL después del envío
  successTitle?: string;         // Título de éxito
  successMessage?: string;       // Mensaje de éxito
  
  // Campos dinámicos
  fields: FormField[];
}

interface FormField {
  name: string;                  // nombre del campo
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;                 // etiqueta visible
  placeholder?: string;
  required?: boolean;
  options?: string[];            // para select/radio/checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;           // regex para validación
    message?: string;           // mensaje de error
  };
}

// Ejemplo de configuración
const formConfig: FormConfig = {
  title: "Regístrate Ahora",
  subtitle: "Completa el formulario",
  submitText: "Quiero Participar",
  campana_id: "uuid-campana",
  asesor_id: "uuid-asesor",
  redirectUrl: "/gracias",
  fields: [
    {
      name: "nombre",
      type: "text",
      label: "Nombre Completo",
      placeholder: "Tu nombre",
      required: true
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "tu@email.com",
      required: true
    },
    {
      name: "telefono",
      type: "tel",
      label: "WhatsApp",
      placeholder: "+51 999 999 999",
      required: true
    },
    {
      name: "presupuesto",
      type: "select",
      label: "Presupuesto",
      options: ["Hasta $10,000", "$10,000 - $25,000", "$25,000 - $50,000", "Más de $50,000"],
      required: false
    }
  ]
};
```

### Flujo de Captura de Leads

```
1. Usuario llena formulario en /formulario/[slug]
   ↓
2. CaptureForm valida campos
   ↓
3. POST /api/leads con datos + campana_id + asesor_id
   ↓
4. Supabase guarda en tabla leads
   ↓
5. Trigger notifica_nuevo_lead()
   ↓
6. Notificaciones:
   - Email a emails_notificacion[]
   - WhatsApp a whatsapp_notificacion[]
   - Notion (si notion_sync = true)
   → Lead redirigido a redirectUrl
```

### API Endpoints

```typescript
// GET /api/campanas - Listar campañas
// POST /api/campanas - Crear campaña
// PUT /api/campanas - Actualizar campaña
// DELETE /api/campanas?id= - Eliminar campaña

// GET /api/asesores - Listar asesores
// POST /api/asesores - Crear asesor
// PUT /api/asesores - Actualizar asesor
// DELETE /api/asesores?id= - Eliminar asesor

// POST /api/leads - Crear lead (desde formulario)
// GET /api/leads - Listar leads (con filtros)
// PUT /api/leads - Actualizar lead (cambiar estado, asignar asesor)
```

### Hooks

```typescript
// lib/hooks/useCampanas.ts
const { campanas, loading, create, update, delete } = useCampanas();

// lib/hooks/useAsesores.ts
const { asesores, loading, create, update, delete } = useAsesores();
```

---

## 🔄 CAMBIOS RECIENTES

### 2026-03-30: Sistema de Leads y Branding

**Nuevas tablas:**
- `asesores` - Gestión de asesores/vendedores
- `campanas` - Campañas de marketing
- `leads` - Leads con campos extendidos (campana_id, asesor_id, datos JSONB)
- `integraciones` - Configuración de integraciones

**Nuevos archivos:**
- `app/api/campanas/route.ts` - API de campañas
- `app/api/asesores/route.ts` - API de asesores
- `lib/hooks/useCampanas.ts` - Hook de campañas y asesores
- `components/sections/CustomHeader.tsx` - Header personalizable
- `components/sections/CustomFooter.tsx` - Footer personalizable
- `supabase/migrations/029_leads_campanas.sql` - Migración de BD

**Archivos modificados:**
- `app/api/leads/route.ts` - Extendido con campos de campaña/asesor
- `lib/hooks/useTemplate.ts` - Agregado getConfig() para branding
- `lib/hooks/useTemplates.ts` - Agregado campo config a interfaz
- `app/superadmin/templates/[id]/page.tsx` - Panel de configuración y branding
- `app/gracias/page.tsx` - Aplica configuración de branding
- `app/embudo/[slug]/page.tsx` - Aplica configuración de branding
- `app/formulario/[slug]/page.tsx` - Aplica configuración de branding
- `AGENTS.md` - Documentación actualizada

**Funcionalidad Pendiente:**
- [ ] Editor de formulario dinámico en template editor
- [ ] Dashboard de leads en superadmin
- [ ] Integración real con WhatsApp (Twilio)
- [ ] Integración real con Email (Resend/SendGrid)
- [ ] Integración real con Notion
- [ ] Selector de país para teléfono con iconos de bandera

---

*Documento v1.2 - BLIS Corp Development Team*