-- ═══════════════════════════════════════════════════════════════════════════════
-- Xpand Capital - AGREGAR COLUMNAS DE ORDEN Y VISIBILIDAD A TEMPLATES
-- Ejecutar PRIMERO antes del seed
-- ═══════════════════════════════════════════════════════════════════════════════

-- Agregar columnas si no existen
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS "sectionOrder" TEXT[] DEFAULT '{}';

ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS "sectionVisibility" JSONB DEFAULT '{}';

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_templates_section_order ON templates USING GIN ("sectionOrder");

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEMPLATES ACTUALIZADOS CON SECCIONES COMPLETAS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ============================================================
-- TEMPLATE DE THANK YOU (PÁGINA DE AGRADECIMIENTO)
-- ============================================================
INSERT INTO templates (
    empresa_id, nombre, slug, tipo_contenido, estado, es_principal,
    mostrar_en_menu, mostrar_en_footer, secciones, 
    "sectionOrder", "sectionVisibility",
    meta_titulo, meta_descripcion
)
VALUES (
    '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    'Página de Gracias Principal',
    'gracias',
    'thankyou',
    'activo',
    true,
    false,
    false,
    '{
        "thankYouHero": {
            "title1": "¡Gracias!",
            "title2": "Tu operación fue exitosa",
            "subtitle": "Tu operación ha sido procesada correctamente",
            "description": "Hemos recibido tu información correctamente. Un asesor te contactará a la brevedad.",
            "accentColor": "#10B981",
            "primaryBtnText": "Ir al Dashboard",
            "primaryBtnLink": "/miembros",
            "secondaryBtnText": "Ver Mis Compras",
            "secondaryBtnLink": "/miembros/compras"
        },
        "thankYouNextSteps": {
            "title": "¿Qué sigue?",
            "subtitle": "Próximos Pasos",
            "steps": [
                { "icon": "Mail", "title": "Revisa tu email", "description": "Te enviamos un correo con todos los detalles" },
                { "icon": "Phone", "title": "Te contactaremos", "description": "Un asesor te llamará en las próximas 24 horas" },
                { "icon": "Calendar", "title": "Agenda tu cita", "description": "Programa una visita al proyecto", "action": "Agendar", "link": "/contacto" }
            ],
            "contactInfo": { "phone": "+51 999 999 999", "email": "contacto@xpancapital.com", "whatsapp": "51999999999" },
            "accentColor": "#10B981"
        },
        "funnelCTA": {
            "title": "¿Listo para el siguiente paso?",
            "description": "Explora nuestros proyectos.",
            "primaryBtnText": "Ver Proyectos",
            "primaryBtnLink": "/proyectos",
            "secondaryBtnText": "Ir al Dashboard",
            "secondaryBtnLink": "/miembros",
            "accentColor": "#B10D24"
        },
        "stats": {
            "title": "Nuestra Trayectoria",
            "stats": [
                { "value": 250, "suffix": "+", "label": "Proyectos", "icon": "Building2" },
                { "value": 2500, "suffix": "+", "label": "Clientes", "icon": "Users" },
                { "value": 10, "label": "Años", "icon": "Calendar" }
            ],
            "accentColor": "#B10D24",
            "layout": "grid"
        }
    }',
    ARRAY['thankYouHero', 'thankYouNextSteps', 'funnelCTA', 'stats', 'footer'],
    '{"thankYouHero": true, "thankYouNextSteps": true, "funnelCTA": true, "stats": true, "footer": true}',
    '¡Gracias! | Xpand Capital',
    'Tu operación ha sido procesada exitosamente. Xpand Capital - Inmobiliaria de confianza.'
) ON CONFLICT (empresa_id, slug) DO UPDATE SET
    secciones = EXCLUDED.secciones,
    "sectionOrder" = EXCLUDED."sectionOrder",
    "sectionVisibility" = EXCLUDED."sectionVisibility",
    actualizado_en = NOW();

-- ============================================================
-- TEMPLATE DE CAPTURA (FORMULARIO DE LEADS)
-- ============================================================
INSERT INTO templates (
    empresa_id, nombre, slug, tipo_contenido, estado, es_principal,
    mostrar_en_menu, mostrar_en_footer, secciones,
    "sectionOrder", "sectionVisibility",
    meta_titulo, meta_descripcion
)
VALUES (
    '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    'Formulario de Captura Principal',
    'registro-inversores',
    'captura',
    'activo',
    true,
    false,
    false,
    '{
        "captureHero": {
            "title1": "Únete a la",
            "title2": "Élite Inmobiliaria",
            "subtitle": "Oportunidad Exclusiva de Inversión",
            "description": "Regístrate para recibir acceso anticipado a proyectos exclusivos.",
            "accentColor": "#B10D24",
            "showStats": true,
            "stats": [
                { "value": "+250%", "label": "Plusvalía" },
                { "value": "2,500+", "label": "Clientes" },
                { "value": "10+", "label": "Años" }
            ],
            "benefits": [
                { "text": "Acceso anticipado a proyectos exclusivos" },
                { "text": "Asesoría personalizada sin costo" },
                { "text": "Contenido premium del mercado inmobiliario" }
            ],
            "form": {
                "title": "Regístrate Ahora",
                "fields": [
                    { "name": "nombre", "label": "Nombre Completo", "type": "text", "placeholder": "Tu nombre", "required": true },
                    { "name": "email", "label": "Email", "type": "email", "placeholder": "tu@email.com", "required": true },
                    { "name": "telefono", "label": "Teléfono", "type": "tel", "placeholder": "+51 999 999 999", "required": true }
                ],
                "submitText": "Quiero Participar",
                "successTitle": "¡Registro Exitoso!",
                "successMessage": "Te contactaremos en las próximas 24 horas.",
                "redirectUrl": "/gracias"
            }
        },
        "funnelVideo": {
            "title": "Descubre la Oportunidad",
            "subtitle": "Video Explicativo",
            "description": "Mira cómo miles de inversores han multiplicado su patrimonio.",
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "videoThumbnail": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
            "layout": "boxed",
            "accentColor": "#B10D24"
        },
        "funnelBenefits": {
            "title": "¿Por qué invertir con nosotros?",
            "subtitle": "Ventajas Exclusivas",
            "accentColor": "#B10D24",
            "benefits": [
                { "icon": "TrendingUp", "title": "Alta Plusvalía", "description": "Proyectos con incremento de valor garantizado" },
                { "icon": "Shield", "title": "Seguridad Legal", "description": "100% documentos en regla" },
                { "icon": "Users", "title": "Comunidad Exclusiva", "description": "Red de inversores de alto nivel" },
                { "icon": "Clock", "title": "Soporte 24/7", "description": "Atención personalizada" }
            ],
            "layout": "grid"
        },
        "stats": {
            "title": "Resultados que hablan",
            "subtitle": "En Números",
            "stats": [
                { "value": 250, "suffix": "+", "label": "Proyectos", "icon": "Building2" },
                { "value": 2500, "suffix": "+", "label": "Clientes", "icon": "Users" },
                { "value": 10, "label": "Años", "icon": "Calendar" },
                { "value": 15, "prefix": "$", "suffix": "M+", "label": "Vendidos", "icon": "TrendingUp" }
            ],
            "accentColor": "#B10D24",
            "layout": "grid"
        },
        "funnelTestimonials": {
            "title": "Historias de Éxito",
            "subtitle": "Testimonios Reales",
            "testimonials": [
                { "quote": "Invertí y en 18 meses mi terreno vale el triple.", "author": "Rafael S.", "role": "Inversor", "rating": 5 },
                { "quote": "Todo documentado y transparente desde el día uno.", "author": "María G.", "role": "Propietaria", "rating": 5 },
                { "quote": "Me guiaron en todo el proceso. Ahora tengo 3 terrenos.", "author": "Carlos M.", "role": "Inversor", "rating": 5 }
            ],
            "accentColor": "#B10D24",
            "layout": "carousel"
        }
    }',
    ARRAY['captureHero', 'funnelVideo', 'funnelBenefits', 'stats', 'funnelTestimonials', 'footer'],
    '{"captureHero": true, "funnelVideo": true, "funnelBenefits": true, "stats": true, "funnelTestimonials": true, "footer": true}',
    'Registro de Inversores | Xpand Capital',
    'Únete a la élite inmobiliaria y accede a proyectos exclusivos.'
) ON CONFLICT (empresa_id, slug) DO UPDATE SET
    secciones = EXCLUDED.secciones,
    "sectionOrder" = EXCLUDED."sectionOrder",
    "sectionVisibility" = EXCLUDED."sectionVisibility",
    actualizado_en = NOW();

-- ============================================================
-- TEMPLATE DE FUNNEL (EMBUDO DE VENTA)
-- ============================================================
INSERT INTO templates (
    empresa_id, nombre, slug, tipo_contenido, estado, es_principal,
    mostrar_en_menu, mostrar_en_footer, secciones,
    "sectionOrder", "sectionVisibility",
    meta_titulo, meta_descripcion
)
VALUES (
    '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    'Embudo de Venta Principal',
    'oportunidad-exclusiva',
    'funnel',
    'activo',
    true,
    false,
    false,
    '{
        "funnelHero": {
            "title1": "Transforma tu",
            "title2": "Patrimonio",
            "subtitle": "La Oportunidad Inmobiliaria del Año",
            "description": "Descubre cómo multiplicar tu inversión con terrenos de alta plusvalía.",
            "backgroundImage": "/images/funnel-bg.webp",
            "primaryBtnText": "Quiero Participar",
            "primaryBtnLink": "#formulario",
            "urgencyText": "Cupos Limitados",
            "urgencyCount": 12,
            "accentColor": "#B10D24"
        },
        "funnelCountdown": {
            "title": "Tiempo Restante",
            "subtitle": "Oferta Limitada",
            "description": "Esta oferta especial termina pronto.",
            "endDate": "2026-12-31T23:59:59",
            "endMessage": "¡La oferta ha terminado!",
            "showDays": true,
            "showHours": true,
            "showMinutes": true,
            "showSeconds": true,
            "accentColor": "#B10D24",
            "urgentMessage": "¡Últimos lugares disponibles!",
            "layout": "card"
        },
        "funnelVideo": {
            "title": "Conoce la Oportunidad",
            "subtitle": "Mira el Video",
            "description": "Descubre en detalle todo lo que tenemos para ti.",
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "videoThumbnail": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
            "layout": "split",
            "accentColor": "#B10D24"
        },
        "funnelBenefits": {
            "title": "¿Por qué invertir con Xpand Capital?",
            "subtitle": "Ventajas Exclusivas",
            "accentColor": "#B10D24",
            "benefits": [
                { "icon": "TrendingUp", "title": "Plusvalía Garantizada", "description": "Crecimiento del 200-400% en 3-5 años" },
                { "icon": "Shield", "title": "Seguridad Total", "description": "Documentación legal impecable" },
                { "icon": "Award", "title": "Experiencia Comprobada", "description": "+10 años con 2,500 clientes satisfechos" },
                { "icon": "Zap", "title": "Facilidad de Pago", "description": "Financiamiento directo y cuotas flexibles" }
            ],
            "layout": "grid"
        },
        "stats": {
            "title": "Nuestra Trayectoria",
            "subtitle": "En Números",
            "stats": [
                { "value": 250, "suffix": "+", "label": "Proyectos", "icon": "Building2" },
                { "value": 2500, "suffix": "+", "label": "Clientes", "icon": "Users" },
                { "value": 98, "suffix": "%", "label": "Satisfacción", "icon": "Award" },
                { "value": 15, "prefix": "$", "suffix": "M+", "label": "Vendidos", "icon": "TrendingUp" }
            ],
            "accentColor": "#B10D24",
            "layout": "grid"
        },
        "funnelTestimonials": {
            "title": "Historias de Éxito",
            "subtitle": "Testimonios Reales",
            "testimonials": [
                { "quote": "Invertí hace 2 años y mi terreno ya vale el triple.", "author": "Rafael S.", "role": "Inversor", "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80", "rating": 5 },
                { "quote": "Todo documentado y transparente desde el día uno.", "author": "María G.", "role": "Propietaria", "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&q=80", "rating": 5 },
                { "quote": "No tenía experiencia y ahora tengo 3 terrenos.", "author": "Carlos M.", "role": "Inversor", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&q=80", "rating": 5 }
            ],
            "accentColor": "#B10D24",
            "layout": "featured"
        },
        "funnelPricing": {
            "title": "Elige tu Plan",
            "subtitle": "Opciones de Inversión",
            "description": "Selecciona la opción que mejor se adapte a tus necesidades.",
            "tiers": [
                { "name": "Inicial", "price": "$5,000", "priceNote": "desde", "description": "Ideal para comenzar", "features": ["Acceso a 1 proyecto", "Asesoría mensual", "Documentación básica"], "buttonText": "Comenzar", "buttonLink": "/formulario/inicial" },
                { "name": "Premium", "price": "$25,000", "priceNote": "desde", "description": "Mayor rentabilidad", "features": ["Todos los proyectos", "Asesoría semanal", "Documentación completa", "Soporte 24/7", "Eventos exclusivos"], "highlighted": true, "buttonText": "Elegir Premium", "buttonLink": "/formulario/premium" },
                { "name": "Élite", "price": "$100,000+", "priceNote": "inversión mínima", "description": "Inversores institucionales", "features": ["Proyectos exclusivos", "Asesoría dedicada", "Rentabilidad garantizada", "Soporte VIP", "Networking exclusivo"], "buttonText": "Contactar", "buttonLink": "/contacto" }
            ],
            "accentColor": "#B10D24",
            "layout": "cards"
        },
        "funnelCTA": {
            "title": "¿Listo para multiplicar tu patrimonio?",
            "subtitle": "Acción Inmediata",
            "description": "Los lugares son limitados. No dejes pasar esta oportunidad.",
            "primaryBtnText": "Inscribirme Ahora",
            "primaryBtnLink": "/formulario/registro-inversores",
            "secondaryBtnText": "Ver Proyectos",
            "secondaryBtnLink": "/proyectos",
            "accentColor": "#B10D24",
            "showUrgency": true,
            "urgencyText": "Solo quedan 12 lugares"
        }
    }',
    ARRAY['funnelHero', 'funnelCountdown', 'funnelVideo', 'funnelBenefits', 'stats', 'funnelTestimonials', 'funnelPricing', 'funnelCTA', 'footer'],
    '{"funnelHero": true, "funnelCountdown": true, "funnelVideo": true, "funnelBenefits": true, "stats": true, "funnelTestimonials": true, "funnelPricing": true, "funnelCTA": true, "footer": true}',
    'Oportunidad Exclusiva | Xpand Capital',
    'Invierte en terrenos de alta plusvalía. Plusvalía garantizada del 200-400% en 3-5 años.'
) ON CONFLICT (empresa_id, slug) DO UPDATE SET
    secciones = EXCLUDED.secciones,
    "sectionOrder" = EXCLUDED."sectionOrder",
    "sectionVisibility" = EXCLUDED."sectionVisibility",
    actualizado_en = NOW();

