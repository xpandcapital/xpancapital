-- ═══════════════════════════════════════════════════════════════════════════════
-- BLIS CORP - TEMPLATES ACTUALIZADOS CON SECCIONES COMPLETAS
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ============================================================
-- TEMPLATE DE THANK YOU (PÁGINA DE AGRADECIMIENTO)
-- ============================================================
INSERT INTO templates (
    empresa_id, nombre, slug, tipo_contenido, estado, es_principal,
    mostrar_en_menu, mostrar_en_footer, secciones, meta_titulo, meta_descripcion
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
            "description": "Hemos recibido tu información correctamente. Un asesor te contactará a la brevedad para continuar con el proceso.",
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
                { "icon": "Mail", "title": "Revisa tu email", "description": "Te enviamos un correo con todos los detalles de tu operación", "action": "Ver Email", "link": "/miembros" },
                { "icon": "Phone", "title": "Te contactaremos", "description": "Un asesor especializado te llamará en las próximas 24 horas" },
                { "icon": "Calendar", "title": "Agenda tu cita", "description": "Programa una visita al proyecto de tu interés", "action": "Agendar Ahora", "link": "/contacto" }
            ],
            "contactInfo": {
                "phone": "+51 999 999 999",
                "email": "contacto@bliscorp.com",
                "whatsapp": "51999999999"
            },
            "accentColor": "#10B981"
        },
        "funnelCTA": {
            "title": "¿Listo para el siguiente paso?",
            "subtitle": "Continúa tu camino",
            "description": "Explora nuestros proyectos y encuentra la oportunidad perfecta para ti.",
            "primaryBtnText": "Ver Proyectos",
            "primaryBtnLink": "/proyectos",
            "secondaryBtnText": "Ir al Dashboard",
            "secondaryBtnLink": "/miembros",
            "accentColor": "#B10D24",
            "showUrgency": false
        },
        "footer": {
            "description": "BLIS Corp - Tu socio inmobiliario de confianza.",
            "copyright": "© 2026 Blis Corp. Todos los derechos reservados."
        }
    }',
    '¡Gracias! | BLIS Corp',
    'Tu operación ha sido procesada exitosamente. BLIS Corp - Inmobiliaria de confianza.'
) ON CONFLICT (empresa_id, slug) DO UPDATE SET
    secciones = EXCLUDED.secciones,
    actualizado_en = NOW();

-- ============================================================
-- TEMPLATE DE CAPTURA (FORMULARIO DE LEADS) - COMPLETO
-- ============================================================
INSERT INTO templates (
    empresa_id, nombre, slug, tipo_contenido, estado, es_principal,
    mostrar_en_menu, mostrar_en_footer, secciones, meta_titulo, meta_descripcion
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
            "description": "Regístrate para recibir acceso anticipado a proyectos exclusivos, asesoría personalizada y oportunidades de inversión de alto rendimiento.",
            "accentColor": "#B10D24",
            "showStats": true,
            "stats": [
                { "value": "+250%", "label": "Plusvalía Promedio" },
                { "value": "2,500+", "label": "Clientes Satisfechos" },
                { "value": "10+", "label": "Años de Experiencia" }
            ],
            "benefits": [
                { "text": "Acceso anticipado a proyectos exclusivos" },
                { "text": "Asesoría personalizada sin costo" },
                { "text": "Contenido premium del mercado inmobiliario" },
                { "text": "Invitaciones a eventos exclusivos" }
            ],
            "form": {
                "title": "Regístrate Ahora",
                "subtitle": "Completa el formulario para acceder",
                "fields": [
                    { "name": "nombre", "label": "Nombre Completo", "type": "text", "placeholder": "Tu nombre", "required": true },
                    { "name": "email", "label": "Email", "type": "email", "placeholder": "tu@email.com", "required": true },
                    { "name": "telefono", "label": "Teléfono / WhatsApp", "type": "tel", "placeholder": "+51 999 999 999", "required": true },
                    { "name": "ciudad", "label": "Ciudad de Interés", "type": "select", "placeholder": "Seleccionar ciudad", "options": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Otro"] }
                ],
                "submitText": "Quiero Participar",
                "successTitle": "¡Registro Exitoso!",
                "successMessage": "Te contactaremos en las próximas 24 horas.",
                "privacyText": "Al enviar aceptas nuestros términos y condiciones y política de privacidad.",
                "redirectUrl": "/gracias"
            }
        },
        "funnelVideo": {
            "title": "Descubre la Oportunidad",
            "subtitle": "Video Explicativo",
            "description": "Mira cómo miles de inversores han multiplicado su patrimonio con nosotros.",
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "videoThumbnail": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
            "layout": "boxed",
            "showOverlay": true,
            "overlayText": "Duración: 3 minutos",
            "accentColor": "#B10D24"
        },
        "funnelBenefits": {
            "title": "¿Por qué invertir con BLIS Corp?",
            "subtitle": "Ventajas Exclusivas",
            "accentColor": "#B10D24",
            "benefits": [
                { "icon": "TrendingUp", "title": "Alta Plusvalía", "description": "Proyectos con incremento de valor garantizado en zonas de alta demanda", "layout": "grid" },
                { "icon": "Shield", "title": "Seguridad Legal", "description": "100% documentos en regla y saneamiento físico-legal completo" },
                { "icon": "Users", "title": "Comunidad Exclusiva", "description": "Acceso a una red de inversores de alto nivel y contactos del sector" },
                { "icon": "Clock", "title": "Soporte 24/7", "description": "Atención personalizada en todo momento durante tu proceso de inversión" },
                { "icon": "Award", "title": "Experiencia Comprobada", "description": "+10 años en el mercado con más de 2,500 clientes satisfechos" },
                { "icon": "Zap", "title": "Facilidad de Pago", "description": "Financiamiento directo sin bancos y cuotas flexibles" }
            ]
        },
        "stats": {
            "title": "Resultados que hablan",
            "subtitle": "En Números",
            "description": "Nuestra trayectoria respalda cada promesa.",
            "stats": [
                { "value": 250, "suffix": "+", "label": "Proyectos", "icon": "Building2" },
                { "value": 2500, "suffix": "+", "label": "Clientes", "icon": "Users" },
                { "value": 10, "label": "Años", "icon": "Calendar" },
                { "value": 15, "prefix": "$", "suffix": "M+", "label": "Vendidos", "icon": "TrendingUp" }
            ],
            "accentColor": "#B10D24",
            "layout": "grid",
            "animated": true
        },
        "funnelTestimonials": {
            "title": "Historias de Éxito",
            "subtitle": "Testimonios Reales",
            "testimonials": [
                { "quote": "Invertí en Montana y en 18 meses mi terreno vale el triple. BLIS Corp cambió mi vida financiera.", "author": "Rafael S.", "role": "Inversor", "rating": 5 },
                { "quote": "La seguridad legal fue lo que más me convenció. Todo documentado y transparente desde el día uno.", "author": "María G.", "role": "Propietaria", "rating": 5 },
                { "quote": "El equipo de asesoría me guió en todo el proceso. No tenía experiencia y ahora tengo 3 terrenos.", "author": "Carlos M.", "role": "Primerizo en Inversiones", "rating": 5 }
            ],
            "accentColor": "#B10D24",
            "layout": "carousel"
        },
        "footer": {
            "description": "BLIS Corp - Tu socio inmobiliario de confianza.",
            "copyright": "© 2026 Blis Corp. Todos los derechos reservados."
        }
    }',
    'Registro de Inversores | BLIS Corp',
    'Únete a la élite inmobiliaria y accede a proyectos exclusivos de alta plusvalía.'
) ON CONFLICT (empresa_id, slug) DO UPDATE SET
    secciones = EXCLUDED.secciones,
    actualizado_en = NOW();

-- ============================================================
-- TEMPLATE DE FUNNEL (EMBUDO DE VENTA) - COMPLETO
-- ============================================================
INSERT INTO templates (
    empresa_id, nombre, slug, tipo_contenido, estado, es_principal,
    mostrar_en_menu, mostrar_en_footer, secciones, meta_titulo, meta_descripcion
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
            "description": "Descubre cómo multiplicar tu inversión con terrenos de alta plusvalía en las mejores zonas de expansión urbana.",
            "backgroundImage": "/images/funnel-bg.webp",
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "primaryBtnText": "Quiero Participar",
            "primaryBtnLink": "#formulario",
            "urgencyText": "Cupos Limitados",
            "urgencyCount": 12,
            "accentColor": "#B10D24",
            "showCountdown": false
        },
        "funnelCountdown": {
            "title": "Tiempo Restante",
            "subtitle": "Oferta Limitada",
            "description": "Esta oferta especial termina pronto. No te lo pierdas.",
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
            "description": "Descubre en detalle todo lo que tenemos para ti en este proyecto exclusivo.",
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "videoThumbnail": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
            "layout": "split",
            "accentColor": "#B10D24"
        },
        "funnelBenefits": {
            "title": "¿Por qué invertir con BLIS Corp?",
            "subtitle": "Ventajas Exclusivas",
            "accentColor": "#B10D24",
            "benefits": [
                { "icon": "TrendingUp", "title": "Plusvalía Garantizada", "description": "Proyectos con crecimiento del 200-400% en 3-5 años" },
                { "icon": "Shield", "title": "Seguridad Total", "description": "Documentación legal impecable y saneamiento completo" },
                { "icon": "Award", "title": "Experiencia Comprobada", "description": "+10 años en el mercado con más de 2,500 clientes satisfechos" },
                { "icon": "Zap", "title": "Facilidad de Pago", "description": "Financiamiento directo sin bancos y cuotas flexibles" }
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
                { "quote": "Invertí en Montana y en 18 meses mi terreno vale el triple. BLIS Corp cambió mi vida financiera.", "author": "Rafael S.", "role": "Inversor", "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80", "rating": 5 },
                { "quote": "La seguridad legal fue lo que más me convenció. Todo documentado y transparente desde el día uno.", "author": "María G.", "role": "Propietaria", "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&q=80", "rating": 5 },
                { "quote": "El equipo de asesoría me guió en todo el proceso. No tenía experiencia y ahora tengo 3 terrenos.", "author": "Carlos M.", "role": "Primerizo en Inversiones", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&q=80", "rating": 5 }
            ],
            "accentColor": "#B10D24",
            "layout": "featured"
        },
        "funnelPricing": {
            "title": "Elige tu Plan de Inversión",
            "subtitle": "Opciones de Inversión",
            "description": "Selecciona la opción que mejor se adapte a tus necesidades.",
            "tiers": [
                { "name": "Inicial", "price": "$5,000", "priceNote": "desde", "description": "Ideal para comenzar en el mundo inmobiliario", "features": ["Acceso a 1 proyecto", "Asesoría mensual", "Documentación básica", "Soporte por email"], "buttonText": "Comenzar", "buttonLink": "/formulario/inicial" },
                { "name": "Premium", "price": "$25,000", "priceNote": "desde", "description": "Para inversores que buscan mayor rentabilidad", "features": ["Acceso a todos los proyectos", "Asesoría semanal personalizada", "Documentación completa", "Soporte prioritario 24/7", "Acceso a eventos exclusivos"], "highlighted": true, "buttonText": "Elegir Premium", "buttonLink": "/formulario/premium" },
                { "name": "Élite", "price": "$100,000+", "priceNote": "inversión mínima", "description": "Para inversores institucionales", "features": ["Proyectos exclusivos", "Asesoría dedicada", "Rentabilidad garantizada", "Soporte VIP", "Eventos privados", "Networking exclusivo"], "buttonText": "Contactar", "buttonLink": "/contacto" }
            ],
            "accentColor": "#B10D24",
            "layout": "cards"
        },
        "funnelCTA": {
            "title": "¿Listo para multiplicar tu patrimonio?",
            "subtitle": "Acción Inmediata",
            "description": "Los lugares son limitados y la demanda es alta. No dejes pasar esta oportunidad única.",
            "primaryBtnText": "Inscribirme Ahora",
            "primaryBtnLink": "/formulario/registro-inversores",
            "secondaryBtnText": "Ver Proyectos",
            "secondaryBtnLink": "/proyectos",
            "accentColor": "#B10D24",
            "showUrgency": true,
            "urgencyText": "Solo quedan 12 lugares"
        },
        "footer": {
            "description": "BLIS Corp - Líderes en desarrollo inmobiliario de alta plusvalía.",
            "copyright": "© 2026 Blis Corp. Todos los derechos reservados."
        }
    }',
    'Oportunidad Exclusiva | BLIS Corp',
    'Invierte en terrenos de alta plusvalía. Plusvalía garantizada del 200-400% en 3-5 años.'
) ON CONFLICT (empresa_id, slug) DO UPDATE SET
    secciones = EXCLUDED.secciones,
    actualizado_en = NOW();

-- Actualizar sectionOrder para todos
UPDATE templates SET
    "sectionOrder" = ARRAY['thankYouHero', 'thankYouNextSteps', 'funnelCTA', 'stats', 'footer'],
    "sectionVisibility" = '{"thankYouHero": true, "thankYouNextSteps": true, "funnelCTA": true, "stats": true, "footer": true}'
WHERE slug = 'gracias';

UPDATE templates SET
    "sectionOrder" = ARRAY['captureHero', 'funnelVideo', 'funnelBenefits', 'stats', 'funnelTestimonials', 'footer'],
    "sectionVisibility" = '{"captureHero": true, "funnelVideo": true, "funnelBenefits": true, "stats": true, "funnelTestimonials": true, "footer": true}'
WHERE slug = 'registro-inversores';

UPDATE templates SET
    "sectionOrder" = ARRAY['funnelHero', 'funnelCountdown', 'funnelVideo', 'funnelBenefits', 'stats', 'funnelTestimonials', 'funnelPricing', 'funnelCTA', 'footer'],
    "sectionVisibility" = '{"funnelHero": true, "funnelCountdown": true, "funnelVideo": true, "funnelBenefits": true, "stats": true, "funnelTestimonials": true, "funnelPricing": true, "funnelCTA": true, "footer": true}'
WHERE slug = 'oportunidad-exclusiva';