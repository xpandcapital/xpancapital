-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICAR Y ACTUALIZAR TEMPLATES - CONTENIDO COMPLETO
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- Primero, verificar qué templates existen
SELECT id, nombre, slug, tipo_contenido, estado, es_principal FROM templates;

-- Si no existe el template de gracias, crearlo
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
                {
                    "icon": "Mail",
                    "title": "Revisa tu email",
                    "description": "Te enviamos un correo con todos los detalles de tu operación",
                    "action": "Ver Email",
                    "link": "/miembros"
                },
                {
                    "icon": "Phone",
                    "title": "Te contactaremos",
                    "description": "Un asesor especializado te llamará en las próximas 24 horas"
                },
                {
                    "icon": "Calendar",
                    "title": "Agenda tu cita",
                    "description": "Programa una visita al proyecto de tu interés",
                    "action": "Agendar Ahora",
                    "link": "/contacto"
                }
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
        "stats": {
            "title": "Nuestra Trayectoria",
            "subtitle": "En Números",
            "description": "Resultados que hablan por sí solos.",
            "stats": [
                { "value": 250, "suffix": "+", "label": "Proyectos", "icon": "Building2" },
                { "value": 2500, "suffix": "+", "label": "Clientes", "icon": "Users" },
                { "value": 10, "label": "Años", "icon": "Calendar" },
                { "value": 98, "suffix": "%", "label": "Satisfacción", "icon": "Award" }
            ],
            "accentColor": "#B10D24",
            "layout": "grid",
            "animated": true,
            "showIcons": true
        },
        "footer": {
            "description": "BLIS Corp - Tu socio inmobiliario de confianza.",
            "copyright": "© 2026 Blis Corp. Todos los derechos reservados."
        }
    }',
    ARRAY['thankYouHero', 'thankYouNextSteps', 'funnelCTA', 'stats', 'footer'],
    '{"thankYouHero": true, "thankYouNextSteps": true, "funnelCTA": true, "stats": true, "footer": true}',
    '¡Gracias! | BLIS Corp',
    'Tu operación ha sido procesada exitosamente. BLIS Corp - Inmobiliaria de confianza.'
) ON CONFLICT (empresa_id, slug) DO UPDATE SET
    secciones = EXCLUDED.secciones,
    "sectionOrder" = EXCLUDED."sectionOrder",
    "sectionVisibility" = EXCLUDED."sectionVisibility",
    estado = 'activo',
    es_principal = true,
    actualizado_en = NOW();

-- Actualizar template de CAPTURA con contenido completo y detallado
UPDATE templates SET
    secciones = '{
        "captureHero": {
            "title1": "Únete a la",
            "title2": "Élite Inmobiliaria",
            "subtitle": "Oportunidad Exclusiva de Inversión",
            "description": "Regístrate para recibir acceso anticipado a proyectos exclusivos, asesoría personalizada y oportunidades de inversión de alto rendimiento en los mejores terrenos de la región.",
            "accentColor": "#B10D24",
            "showStats": true,
            "stats": [
                { "value": "+250%", "label": "Plusvalía Promedio" },
                { "value": "2,500+", "label": "Clientes Satisfechos" },
                { "value": "10+", "label": "Años de Experiencia" }
            ],
            "benefits": [
                { "text": "Acceso anticipado a proyectos exclusivos antes del lanzamiento público" },
                { "text": "Asesoría personalizada con expertos en inversión inmobiliaria" },
                { "text": "Contenido premium del mercado inmobiliario y tendencias" },
                { "text": "Invitaciones a eventos exclusivos con networking de alto nivel" }
            ],
            "form": {
                "title": "Regístrate Ahora",
                "subtitle": "Completa el formulario para acceder",
                "fields": [
                    {
                        "name": "nombre",
                        "label": "Nombre Completo",
                        "type": "text",
                        "placeholder": "Tu nombre completo",
                        "required": true
                    },
                    {
                        "name": "email",
                        "label": "Correo Electrónico",
                        "type": "email",
                        "placeholder": "tu@email.com",
                        "required": true
                    },
                    {
                        "name": "telefono",
                        "label": "Teléfono / WhatsApp",
                        "type": "tel",
                        "placeholder": "+51 999 999 999",
                        "required": true
                    },
                    {
                        "name": "ciudad",
                        "label": "Ciudad de Interés",
                        "type": "select",
                        "placeholder": "Selecciona tu ciudad",
                        "options": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Cusco", "Otro"],
                        "required": false
                    },
                    {
                        "name": "presupuesto",
                        "label": "Presupuesto aprox.",
                        "type": "select",
                        "placeholder": "Rango de inversión",
                        "options": ["Hasta $10,000", "$10,000 - $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "Más de $100,000"],
                        "required": false
                    }
                ],
                "submitText": "Quiero Participar",
                "successTitle": "¡Registro Exitoso!",
                "successMessage": "Te contactaremos en las próximas 24 horas con información exclusiva.",
                "privacyText": "Al enviar aceptas nuestros términos y condiciones y política de privacidad.",
                "redirectUrl": "/gracias",
                "accentColor": "#B10D24"
            },
            "backgroundImage": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
        },
        "funnelVideo": {
            "title": "Descubre la Oportunidad",
            "subtitle": "Video Explicativo",
            "description": "Mira cómo miles de inversores han multiplicado su patrimonio con nosotros. Te mostramos los números reales, casos de éxito y la estrategia detrás de cada inversión.",
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "videoThumbnail": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
            "layout": "boxed",
            "showOverlay": true,
            "overlayText": "Duración: 8 minutos",
            "accentColor": "#B10D24"
        },
        "funnelBenefits": {
            "title": "¿Por qué invertir con BLIS Corp?",
            "subtitle": "Ventajas Exclusivas",
            "description": "Más de 10 años respaldando inversiones exitosas",
            "accentColor": "#B10D24",
            "benefits": [
                {
                    "icon": "TrendingUp",
                    "title": "Alta Plusvalía Garantizada",
                    "description": "Proyectos con incremento de valor del 200-400% en zonas de alta demanda y expansión urbana planificada."
                },
                {
                    "icon": "Shield",
                    "title": "Seguridad Legal 100%",
                    "description": "Documentación completa en regla, saneamiento físico-legal verificado y escritura pública garantizada."
                },
                {
                    "icon": "Users",
                    "title": "Comunidad de Inversores",
                    "description": "Acceso a una red exclusiva de más de 2,500 inversores y contactos estratégicos del sector inmobiliario."
                },
                {
                    "icon": "Clock",
                    "title": "Soporte Personalizado 24/7",
                    "description": "Atención dedicada en todo momento durante tu proceso de inversión y post-venta."
                },
                {
                    "icon": "Award",
                    "title": "Experiencia Comprobada",
                    "description": "Más de 10 años en el mercado entregando proyectos exitosos con rendimientos superiores al promedio."
                },
                {
                    "icon": "Zap",
                    "title": "Facilidad de Financiamiento",
                    "description": "Opciones de financiamiento directo sin bancos, cuotas flexibles y planes a tu medida."
                }
            ],
            "layout": "grid"
        },
        "stats": {
            "title": "Nuestra Trayectoria en Números",
            "subtitle": "Resultados que hablan por sí solos",
            "description": "Cada número representa una historia de éxito",
            "stats": [
                { "value": 250, "suffix": "+", "label": "Proyectos Entregados", "description": "Desarrollos completados exitosamente", "icon": "Building2" },
                { "value": 2500, "suffix": "+", "label": "Clientes Satisfechos", "description": "Inversores que confiaron en nosotros", "icon": "Users" },
                { "value": 10, "label": "Años de Experiencia", "description": "Conocimiento del mercado local", "icon": "Calendar" },
                { "value": 15, "prefix": "$", "suffix": "M+", "label": "En Ventas", "description": "Valor total de propiedades vendidas", "icon": "TrendingUp" }
            ],
            "accentColor": "#B10D24",
            "layout": "grid",
            "animated": true,
            "showIcons": true
        },
        "funnelTestimonials": {
            "title": "Historias de Éxito Reales",
            "subtitle": "Testimonios de Nuestros Clientes",
            "testimonials": [
                {
                    "quote": "Invertí en Montana hace 18 meses y mi terreno ya vale el triple. BLIS Corp cambió mi vida financiera para siempre.",
                    "author": "Rafael Sánchez",
                    "role": "Inversor Inmobiliario",
                    "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80",
                    "rating": 5
                },
                {
                    "quote": "La seguridad legal fue lo que más me convenció. Todo documentado y transparente desde el día uno. Sin sorpresas.",
                    "author": "María García",
                    "role": "Propietaria",
                    "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&q=80",
                    "rating": 5
                },
                {
                    "quote": "El equipo de asesoría me guió en todo el proceso. No tenía experiencia y ahora tengo 3 terrenos que generan plusvalía.",
                    "author": "Carlos Mendoza",
                    "role": "Primerizo en Inversiones",
                    "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&q=80",
                    "rating": 5
                }
            ],
            "accentColor": "#B10D24",
            "layout": "featured",
            "showRating": true
        },
        "footer": {
            "description": "BLIS Corp - Tu socio inmobiliario de confianza. Inversiones inteligentes, rendimientos garantizados.",
            "copyright": "© 2026 Blis Corp. Todos los derechos reservados."
        }
    }',
    "sectionOrder" = ARRAY['captureHero', 'funnelVideo', 'funnelBenefits', 'stats', 'funnelTestimonials', 'footer'],
    "sectionVisibility" = '{"captureHero": true, "funnelVideo": true, "funnelBenefits": true, "stats": true, "funnelTestimonials": true, "footer": true}',
    actualizado_en = NOW()
WHERE slug = 'registro-inversores' AND empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

-- Actualizar template de FUNNEL con contenido completo
UPDATE templates SET
    secciones = '{
        "funnelHero": {
            "title1": "Transforma tu",
            "title2": "Patrimonio",
            "subtitle": "La Oportunidad Inmobiliaria del Año",
            "description": "Descubre cómo multiplicar tu inversión con terrenos de alta plusvalía en las mejores zonas de expansión urbana. Inversión inteligente, rendimientos garantizados.",
            "backgroundImage": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
            "videoUrl": "",
            "primaryBtnText": "Quiero Participar",
            "primaryBtnLink": "#formulario",
            "urgencyText": "Solo 12 lugares disponibles",
            "urgencyCount": 12,
            "accentColor": "#B10D24",
            "showCountdown": false
        },
        "funnelCountdown": {
            "title": "Tiempo Restante para Invertir",
            "subtitle": "Oferta por Tiempo Limitado",
            "description": "Esta oportunidad exclusiva termina pronto. Los lugares se están agotando rápidamente.",
            "endDate": "2026-12-31T23:59:59",
            "endMessage": "¡La oferta ha terminado! Contáctanos para nuevas oportunidades.",
            "showDays": true,
            "showHours": true,
            "showMinutes": true,
            "showSeconds": true,
            "accentColor": "#B10D24",
            "urgentMessage": "¡Los lugares se están agotando!",
            "layout": "card"
        },
        "funnelVideo": {
            "title": "Conoce la Oportunidad en Detalle",
            "subtitle": "Video Explicativo Completo",
            "description": "Mira el video completo donde te explicamos la estrategia de inversión, los números reales y por qué este es el momento perfecto para invertir.",
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "videoThumbnail": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
            "layout": "split",
            "showOverlay": true,
            "overlayText": "Duración: 15 minutos",
            "accentColor": "#B10D24"
        },
        "funnelBenefits": {
            "title": "¿Por qué invertir con BLIS Corp?",
            "subtitle": "Ventajas que nos diferencian",
            "description": "Más de 10 años de experiencia respaldando inversiones exitosas",
            "accentColor": "#B10D24",
            "benefits": [
                {
                    "icon": "TrendingUp",
                    "title": "Plusvalía Garantizada del 200-400%",
                    "description": "Proyectos estratégicamente ubicados en zonas de expansión urbana planificada con crecimiento exponencial."
                },
                {
                    "icon": "Shield",
                    "title": "Seguridad Legal 100%",
                    "description": "Documentación impecable, saneamiento completo y escritura pública garantizada. Cero riesgos legales."
                },
                {
                    "icon": "Award",
                    "title": "10+ Años de Experiencia",
                    "description": "Más de 2,500 clientes satisfechos respaldan nuestra trayectoria en el mercado inmobiliario."
                },
                {
                    "icon": "Zap",
                    "title": "Financiamiento Directo sin Bancos",
                    "description": "Planes de pago flexibles adaptados a tu presupuesto. Cuotas mensuales accesibles."
                }
            ],
            "layout": "grid"
        },
        "stats": {
            "title": "Resultados que hablan",
            "subtitle": "Nuestra Trayectoria",
            "description": "Cada número representa años de trabajo y confianza de nuestros clientes.",
            "stats": [
                { "value": 250, "suffix": "+", "label": "Proyectos Entregados", "description": "Desarrollos completados con éxito", "icon": "Building2" },
                { "value": 2500, "suffix": "+", "label": "Clientes Felices", "description": "Familias que confiaron en nosotros", "icon": "Users" },
                { "value": 98, "suffix": "%", "label": "Satisfacción", "description": "Calificación promedio de nuestros clientes", "icon": "Award" },
                { "value": 15, "prefix": "$", "suffix": "M+", "label": "En Ventas", "description": "Valor total de propiedades vendidas", "icon": "TrendingUp" }
            ],
            "accentColor": "#B10D24",
            "layout": "grid",
            "animated": true,
            "showIcons": true
        },
        "funnelTestimonials": {
            "title": "Historias de Éxito Reales",
            "subtitle": "Lo que dicen nuestros clientes",
            "testimonials": [
                {
                    "quote": "Invertí hace 2 años y mi terreno ya vale el triple. Fue la mejor decisión financiera que he tomado. BLIS Corp me guió en todo el proceso.",
                    "author": "Rafael Sánchez",
                    "role": "Inversor Inmobiliario",
                    "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80",
                    "rating": 5
                },
                {
                    "quote": "La seguridad legal fue lo que más me convenció. Todo documentado y transparente desde el día uno. Sin letras chiquitas ni sorpresas.",
                    "author": "María García",
                    "role": "Propietaria",
                    "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&q=80",
                    "rating": 5
                },
                {
                    "quote": "No tenía experiencia en inversiones y el equipo de asesoría me guió paso a paso. Ahora tengo 3 terrenos y mi patrimonio sigue creciendo.",
                    "author": "Carlos Mendoza",
                    "role": "Inversor Primerizo",
                    "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&q=80",
                    "rating": 5
                }
            ],
            "accentColor": "#B10D24",
            "layout": "featured",
            "showRating": true
        },
        "funnelPricing": {
            "title": "Elige tu Plan de Inversión",
            "subtitle": "Opciones para Todos",
            "description": "Selecciona la opción que mejor se adapte a tus objetivos financieros y presupuesto.",
            "tiers": [
                {
                    "name": "Inicial",
                    "price": "$5,000",
                    "priceNote": "Inversión mínima",
                    "description": "Ideal para comenzar en el mundo inmobiliario",
                    "features": [
                        "Acceso a 1 proyecto seleccionado",
                        "Asesoría mensual por email",
                        "Documentación básica del terreno",
                        "Soporte por email",
                        "Actualizaciones del proyecto"
                    ],
                    "buttonText": "Comenzar Ahora",
                    "buttonLink": "/formulario/inicial"
                },
                {
                    "name": "Premium",
                    "price": "$25,000",
                    "priceNote": "Inversión recomendada",
                    "description": "Para inversores que buscan mayor rentabilidad y exclusividad",
                    "features": [
                        "Acceso a TODOS los proyectos",
                        "Asesoría semanal personalizada",
                        "Documentación completa y legal",
                        "Soporte prioritario 24/7",
                        "Acceso a eventos exclusivos",
                        "Networking con otros inversores",
                        "Visitas guiadas a proyectos"
                    ],
                    "highlighted": true,
                    "buttonText": "Elegir Premium",
                    "buttonLink": "/formulario/premium"
                },
                {
                    "name": "Élite",
                    "price": "$100,000+",
                    "priceNote": "Inversión exclusiva",
                    "description": "Para inversores institucionales y high-net-worth",
                    "features": [
                        "Proyectos exclusivos y privados",
                        "Asesoría dedicada 1 a 1",
                        "Rentabilidad garantizada por contrato",
                        "Soporte VIP personalizado",
                        "Eventos privados con fundadores",
                        "Networking exclusivo",
                        "Acceso anticipado a nuevas oportunidades"
                    ],
                    "buttonText": "Contactar Asesor",
                    "buttonLink": "/contacto"
                }
            ],
            "accentColor": "#B10D24",
            "layout": "cards",
            "showBadge": true
        },
        "funnelCTA": {
            "title": "¿Listo para multiplicar tu patrimonio?",
            "subtitle": "Acción Inmediata",
            "description": "Los lugares son limitados y la demanda es alta. No dejes pasar esta oportunidad única de transformar tu futuro financiero.",
            "primaryBtnText": "Inscribirme Ahora",
            "primaryBtnLink": "/formulario/registro-inversores",
            "secondaryBtnText": "Ver Proyectos Disponibles",
            "secondaryBtnLink": "/proyectos",
            "accentColor": "#B10D24",
            "showUrgency": true,
            "urgentMessage": "Solo quedan 12 lugares disponibles"
        },
        "footer": {
            "description": "BLIS Corp - Líderes en desarrollo inmobiliario de alta plusvalía. Tu patrimonio, nuestra prioridad.",
            "copyright": "© 2026 Blis Corp. Todos los derechos reservados."
        }
    }',
    "sectionOrder" = ARRAY['funnelHero', 'funnelCountdown', 'funnelVideo', 'funnelBenefits', 'stats', 'funnelTestimonials', 'funnelPricing', 'funnelCTA', 'footer'],
    "sectionVisibility" = '{"funnelHero": true, "funnelCountdown": true, "funnelVideo": true, "funnelBenefits": true, "stats": true, "funnelTestimonials": true, "funnelPricing": true, "funnelCTA": true, "footer": true}',
    actualizado_en = NOW()
WHERE slug = 'oportunidad-exclusiva' AND empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

-- Verificar los templates actualizados
SELECT 
    slug, 
    nombre, 
    tipo_contenido, 
    estado, 
    es_principal,
    jsonb_array_length(to_jsonb("sectionOrder")) as total_secciones
FROM templates 
WHERE empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae'
AND tipo_contenido IN ('thankyou', 'captura', 'funnel');