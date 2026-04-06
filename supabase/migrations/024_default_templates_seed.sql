-- ═══════════════════════════════════════════════════════════════════════════════
-- BLIS CORP - TEMPLATES POR DEFECTO (THANK YOU, CAPTURA, FUNNEL)
-- ═══════════════════════════════════════════════════════════════════════════════

-- TEMPLATE DE THANK YOU (PÁGINA DE AGRADECIMIENTO)
INSERT INTO templates (
    empresa_id,
    nombre,
    slug,
    tipo_contenido,
    estado,
    es_principal,
    mostrar_en_menu,
    mostrar_en_footer,
    secciones,
    meta_titulo,
    meta_descripcion,
    descripcion
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
                    "description": "Te enviamos un correo con todos los detalles de tu operación"
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
        "cta": {
            "title": "¿Listo para el siguiente paso?",
            "description": "Explora nuestros proyectos y encuentra la oportunidad perfecta para ti.",
            "primaryBtnText": "Ver Proyectos",
            "primaryBtnLink": "/proyectos",
            "secondaryBtnText": "Ir al Dashboard",
            "secondaryBtnLink": "/miembros",
            "accentColor": "#B10D24"
        },
        "footer": {
            "description": "BLIS Corp - Tu socio inmobiliario de confianza.",
            "copyright": "© 2026 Blis Corp. Todos los derechos reservados."
        }
    }',
    '¡Gracias! | BLIS Corp',
    'Tu operación ha sido procesada exitosamente. BLIS Corp - Inmobiliaria de confianza.',
    'Página de agradecimiento principal para post-venta y post-registro'
) ON CONFLICT (empresa_id, slug) DO NOTHING;

-- TEMPLATE DE CAPTURA (FORMULARIO DE LEADS)
INSERT INTO templates (
    empresa_id,
    nombre,
    slug,
    tipo_contenido,
    estado,
    es_principal,
    mostrar_en_menu,
    mostrar_en_footer,
    secciones,
    meta_titulo,
    meta_descripcion,
    descripcion
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
        "benefits": {
            "title": "¿Por qué invertir con nosotros?",
            "subtitle": "Beneficios Exclusivos",
            "accentColor": "#B10D24",
            "benefits": [
                { "icon": "TrendingUp", "title": "Alta Plusvalía", "description": "Proyectos con incremento de valor garantizado en zonas de alta demanda" },
                { "icon": "Shield", "title": "Seguridad Legal", "description": "100% documentos en regla y saneamiento físico-legal completo" },
                { "icon": "Users", "title": "Comunidad Exclusiva", "description": "Acceso a una red de inversores de alto nivel y contacts del sector" },
                { "icon": "Clock", "title": "Soporte 24/7", "description": "Atención personalizada en todo momento durante tu proceso de inversión" }
            ],
            "layout": "grid"
        },
        "footer": {
            "description": "BLIS Corp - Tu socio inmobiliario de confianza.",
            "copyright": "© 2026 Blis Corp. Todos los derechos reservados."
        }
    }',
    'Registro de Inversores | BLIS Corp',
    'Únete a la élite inmobiliaria y accede a proyectos exclusivos de alta plusvalía.',
    'Formulario de captura principal para leads de inversión'
) ON CONFLICT (empresa_id, slug) DO NOTHING;

-- TEMPLATE DE FUNNEL (EMBUDO DE VENTA)
INSERT INTO templates (
    empresa_id,
    nombre,
    slug,
    tipo_contenido,
    estado,
    es_principal,
    mostrar_en_menu,
    mostrar_en_footer,
    secciones,
    meta_titulo,
    meta_descripcion,
    descripcion
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
            "primaryBtnText": "Quiero Participar",
            "primaryBtnLink": "#formulario",
            "urgencyText": "Cupos Limitados",
            "urgencyCount": 12,
            "accentColor": "#B10D24",
            "showCountdown": true
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
        "testimonials": {
            "title": "Historias de Éxito",
            "subtitle": "Testimonios Reales",
            "items": [
                {
                    "quote": "Invertí en Montana y en 18 meses mi terreno vale el triple. BLIS Corp cambió mi vida financiera.",
                    "author": "Rafael S.",
                    "role": "Inversor",
                    "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80"
                },
                {
                    "quote": "La seguridad legal fue lo que más me convenció. Todo documentado y transparente desde el día uno.",
                    "author": "María G.",
                    "role": "Propietaria",
                    "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&q=80"
                },
                {
                    "quote": "El equipo de asesoría me guió en todo el proceso. No tenía experiencia y ahora tengo 3 terrenos.",
                    "author": "Carlos M.",
                    "role": "Primerizo en Inversiones",
                    "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&q=80"
                }
            ]
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
    'Invierte en terrenos de alta plusvalía. Plusvalía garantizada del 200-400% en 3-5 años.',
    'Embudo de venta principal para conversión de leads'
) ON CONFLICT (empresa_id, slug) DO NOTHING;