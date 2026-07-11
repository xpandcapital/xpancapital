# XPAND CORP - LISTA DE PENDIENTES

> Última actualización: 08 Abril 2026
> Estado: En desarrollo

---

## FASE 0: REFACTORIZACIÓN MODULAR ✅ COMPLETADO

### 0.1 Arquitectura Modular ✅
- [x] Estructura de carpetas por módulo (_types, _hooks, _components)
- [x] Barrel exports con index.ts
- [x] Tipos centralizados por módulo
- [x] Hooks personalizados extraídos
- [x] Componentes UI modulares (< 300 líneas)

### 0.2 Módulos Refactorizados ✅
| Módulo | Original | Archivos Creados | Estado |
|--------|----------|-----------------|--------|
| productos | 2,777 líneas | 33 archivos | ✅ Completado |
| api-nube | 3,404 líneas | 12 archivos | ✅ Modular |
| cursos | 1,742 líneas | 6 archivos | ✅ Parcial |
| clientes | 1,601 líneas | 6 archivos | ✅ Parcial |
| proyectos | 1,243 líneas | 3 archivos | ✅ Parcial |
| certificados | 778 líneas | 3 archivos | ✅ Parcial |
| configuracion | 690 líneas | 4 archivos | ✅ Parcial |
| ajustes | 687 líneas | 2 archivos | ✅ Parcial |

### 0.3 Documentación ✅
- [x] AGENTS.md actualizado con arquitectura modular
- [x] REFACTORING_SUMMARY.md creado
- [x] README.md actualizado
- [x] SESSION_STATUS.md actualizado

---

## FASE 1: FUNCIONALIDAD CORE ✅ COMPLETADO

### 1.1 Base de Datos ✅
- [x] Schema SQL creado y ejecutado
- [x] Empresa XPAND CORP configurada (ID: 6186f014-c8c7-4027-9f08-8acf2bae3eae)
- [x] Niveles de cliente creados
- [x] Categorías de blog creadas
- [x] Posts de prueba insertados

### 1.2 APIs ✅
- [x] /api/blog - CRUD de posts
- [x] /api/blog/categorias - Categorías
- [x] /api/blog/lectura - Tracking de lectura
- [x] /api/coins/balance - Balance de coins
- [x] /api/coins/transactions - Transacciones
- [x] /api/coins/add - Agregar coins
- [x] /api/coins/spend - Gastar coins
- [x] /api/storage - Upload de imágenes
- [x] /api/empresas - Info de empresa

### 1.3 Autenticación ✅
- [x] Hooks de auth creados (useAuth)
- [x] Página de login actualizada
- [x] Integración con Supabase Auth
- [x] SSR error corregido

### 1.4 Blog ✅
- [x] Blog público integrado con Supabase
- [x] BlogPremium en home actualizado
- [x] Posts mostrándose correctamente
- [x] Página de artículo funciona

---

## FASE 2: SISTEMA DE LECTURA Y COINS ✅ COMPLETADO

### 2.1 Timer de Lectura ✅
- [x] Hook useReadingTracker funcional
- [x] Guardar progreso en blog_lecturas
- [x] Contador visual en artículo
- [x] Guardar progreso al salir/cerrar pestaña

### 2.2 Recompensas por Lectura ✅
- [x] Otorgar coins al completar lectura
- [x] Evitar duplicados (solo una vez por artículo)
- [x] Notificación visual de coins ganados
- [x] Actualizar balance en tiempo real

### 2.3 Contenido Premium ✅
- [x] Detectar si artículo es premium
- [x] Bloquear contenido hasta pagar
- [x] Descontar coins al desbloquear
- [x] Guardar artículos desbloqueados

---

## FASE 3: PERFIL DE USUARIO ✅ COMPLETADO

### 3.1 Página de Perfil ✅
- [x] Ver datos del usuario
- [x] Editar nombre, apellido, avatar
- [x] Ver balance de coins
- [x] Historial de transacciones

### 3.2 Página de Mis Artículos ✅
- [x] Sección de historial de lectura (placeholder)
- [x] Sección de artículos desbloqueados (placeholder)
- [x] Links al blog

---

## FASE 4: SISTEMA DE COMENTARIOS ✅ COMPLETADO

### 4.1 Backend ✅
- [x] Tabla blog_comments tiene estructura
- [x] API para crear/listar comentarios
- [x] Validar que usuario está autenticado para comentar

### 4.2 Frontend ✅
- [x] Mostrar comentarios en artículo
- [x] Formulario de comentario
- [x] Solo usuarios registrados pueden comentar
- [x] Editar/Eliminar comentarios propios

---

## FASE 5: TIENDA Y PRODUCTOS ✅ COMPLETADO

### 5.1 Catálogo de Productos ✅
- [x] API para productos (listar, crear, actualizar, eliminar)
- [x] API para categorías de productos
- [x] Hook useProducts para fetch de productos
- [x] Página de tienda muestra productos dinámicos
- [x] Fallback a mock data si no hay productos en Supabase

### 5.2 Carrito de Compras ✅
- [x] ShopContext actualizado con persistencia en localStorage
- [x] CartSidebar component para ver carrito
- [x] Integración con Header para mostrar count

### 5.3 Checkout ✅
- [x] Página de checkout completa
- [x] Formulario de información de contacto
- [x] Formulario de dirección de envío
- [x] Selección de método de pago (USD o Coins)

### 5.4 Compras con Coins ✅
- [x] API para crear compras
- [x] Integración con API de coins
- [x] Página de confirmación de compra

---

## FASE 6: SISTEMA DE REFERIDOS ✅ COMPLETADO

### 6.1 Generar Código de Referido ✅
- [x] Mostrar código único por usuario
- [x] Link de invitación compartible

### 6.2 Tracking de Referidos ✅
- [x] API para obtener info de referidos
- [x] Guardar referidos en tabla
- [x] Contador de referidos en perfil

### 6.3 Panel de Referidos ✅
- [x] Ver código de referido y link
- [x] Ver lista de referidos
- [x] Compartir en redes sociales
- [x] Aplicar código de referido

### 6.4 Comisiones ✅
- [x] Asignar coins al referidor cuando referido compra
- [x] Historial de comisiones detallado

---

## FASE 7: PANEL DE ADMINISTRACIÓN ✅ COMPLETADO

### 7.1 Dashboard ✅
- [x] Estadísticas generales (usuarios, posts, productos, compras)
- [x] Posts más leídos
- [x] Usuarios con más coins
- [x] Gráfico de vistas por día

### 7.2 Gestión de Usuarios ✅
- [x] API para listar/editar usuarios
- [x] Página de listado de usuarios
- [x] Búsqueda y filtros

### 7.3 Gestión de Contenido ✅
- [x] CRUD de productos (admin)
- [x] CRUD de posts (admin)
- [x] Filtros por estado y búsqueda

### 7.4 Otras Secciones ✅
- [x] Layout responsivo con sidebar
- [x] Navegación entre secciones
- [x] Estadísticas en dashboard

---

## FASE 8: CERTIFICADOS Y CURSOS ✅ COMPLETADO

### 8.1 Cursos ✅
- [x] API para cursos (GET lista, GET por slug, POST progreso)
- [x] Hook useCursos y useCurso
- [x] Página de listado de cursos (/cursos)
- [x] Página de detalle de curso con lecciones
- [x] Sistema de progreso de curso

### 8.2 Certificados ✅
- [x] API para certificados (GET, POST)
- [x] API para generar PDF de certificado
- [x] Base de datos: Tabla certificado_plantillas con configuración completa
- [x] Componente PDF CertificateDocument con diseño personalizable
- [x] Página de verificación de certificado con descarga PDF
- [x] Página de mis cursos y certificados (/miembros/cursos)
- [x] Generación de código de verificación único
- [x] Página admin para configurar plantillas de certificados (/admin/certificados)

### 8.3 Configuración de Plantillas ✅
- [x] Dimensiones personalizables (ancho, alto en mm)
- [x] Colores configurables (fondo, primario, secundario, textos)
- [x] Tipografía ajustable (tamaño título, cuerpo)
- [x] Posiciones de elementos (nombre, curso, fecha, código)
- [x] Imágenes personalizables (logo, fondo, firma)
- [x] Textos editables (título, subtítulo, completado, firma)

---

## FASE 9: OPTIMIZACIÓN Y PRODUCCIÓN 🔄 EN PROGRESO

### 9.1 Código ✅
- [x] Remover console.logs innecesarios
- [x] Verificar tipos TypeScript
- [x] Eliminar código no usado (imports/variables sin usar)

### 9.2 SEO ✅
- [x] Sitemap.xml dinámico (blog posts, productos)
- [x] robots.txt configurado
- [x] Metadatos base en layout

### 9.3 Producción ⏳
- [ ] Variables de entorno en Vercel
- [ ] Dominio personalizado
- [ ] SSL configurado

---

## RESUMEN DE PRIORIDAD

| Fase | Prioridad | Complejidad | Estado |
|------|-----------|-------------|--------|
| Fase 1 | Alta | Media | ✅ 100% |
| Fase 2 | Alta | Media | ✅ 100% |
| Fase 3 | Media | Baja | ✅ 100% |
| Fase 4 | Media | Media | ✅ 100% |
| Fase 5 | Alta | Alta | ✅ 100% |
| Fase 6 | Baja | Media | ✅ 100% |
| Fase 7 | Media | Media | ✅ 100% |
| Fase 8 | Certificados | Media | ✅ 100% |
| Fase 9 | Producción | Alta | ⏳ 33% |

---

## SIGUIENTE PASO

**Fase 8** - Certificados y Cursos (opcional)

o

**Fase 9** - Optimización y Producción

1. Remover console.logs
2. Verificar tipos TypeScript
3. SEO: metadatos, sitemap, robots.txt
4. Variables de entorno en producción

¿Continuar con Fase 9?
