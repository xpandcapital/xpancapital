"use client";

import { ToolDef } from './types';
import {
    Coins,
    Percent,
    Target,
    BarChart3,
    Scale,
    Zap,
    Layers,
    Boxes,
    BarChart,
    Truck,
    User,
    Key,
    PenTool,
    Smile,
    Calendar,
    Scissors,
    FileText,
    Search,
    Sparkles,
    ShieldCheck,
    Bot,
    LayoutList,
    History,
    Wand2,
    Lightbulb,
    Lock,
    Clock,
    Timer,
    MessageSquare,
    Divide,
    Globe,
    ArrowRightLeft,
    Hash,
    Trash2,
    Video,
    Download,
    Cpu,
    RefreshCcw,
} from 'lucide-react';

const TOOL_INDEX: ToolDef[] = [
    {
        id: 'loan', name: 'Préstamos IA', description: 'Cálculo de cuotas con análisis de riesgo', cat: 'Finanzas', icon: Coins, isIA: true,
        help: "Calcula cuotas y evalúa la viabilidad crediticia basándote en ingresos y gastos.",
        examples: {
            simple: "Préstamo de 5000 soles a 12 meses con 15% interés anual.",
            advanced: "Evalúa si puedo prestar 50k soles a alguien que gana 3k, gasta 1.5k y quiere pagarlo en 4 años. Dame la cuota y riesgo."
        }
    },
    {
        id: 'margin', name: 'Margen vs Markup', description: 'Optimización de precios de venta', cat: 'Finanzas', icon: Percent, isIA: true,
        help: "Diferencia entre margen de ganancia y markup sobre costo para fijar precios competitivos.",
        examples: {
            simple: "Compré a 100 y quiero ganar 30% de margen. ¿A cuánto vendo?",
            advanced: "Mi costo es 85, quiero un markup del 45% pero debo considerar un IGV del 18%. Calcula precio final y utilidad neta."
        }
    },
    {
        id: 'breakeven', name: 'Punto de Equilibrio', description: 'Proyección de ventas mínimas', cat: 'Finanzas', icon: Target, isIA: true,
        help: "Identifica cuántas unidades necesitas vender para cubrir tus costos fijos y variables.",
        examples: {
            simple: "Costos fijos 2000, precio venta 50, costo variable 30. ¿Punto de equilibrio?",
            advanced: "Tengo un alquiler de 1500, luz 200, 2 empleados de 1025 c/u. Vendo hamburguesas a 25 soles y el insumo me cuesta 12. ¿Cuántas debo vender para empezar a ganar?"
        }
    },
    {
        id: 'roi', name: 'Calculadora ROI AI', description: 'Retorno de inversión con atribución', cat: 'Finanzas', icon: BarChart3, isIA: true,
        help: "Mide la rentabilidad de una inversión comparando el beneficio obtenido frente al costo.",
        examples: {
            simple: "Invertí 1000 en Facebook Ads y vendí 3500. ¿Cuál es mi ROI?",
            advanced: "Campaña de 5000 USD, trajo 200 leads, cerramos 10 ventas de 1200 USD cada una. Calcula ROI y costo por adquisición."
        }
    },
    {
        id: 'tax', name: 'Bruto a Neto', description: 'Asistente de optimización fiscal', cat: 'Finanzas', icon: Scale, isIA: true,
        help: "Desglosa salarios o facturas retirando impuestos y aportes legales.",
        examples: {
            simple: "Sueldo bruto de 3000 soles en planilla (AFP). ¿Cuánto recibo neto?",
            advanced: "Factura de 10,000 soles por servicios profesionales (Recibo por Honorarios). Calcula retención de 4ta categoría y neto a pagar."
        }
    },
    {
        id: 'interest', name: 'Interés Compuesto', description: 'Simulación de escenarios económicos', cat: 'Finanzas', icon: Coins, isIA: true,
        help: "Calcula el crecimiento de un capital donde los intereses se reinvierten periódicamente.",
        examples: {
            simple: "Ahorro 1000 soles con 5% anual por 10 años.",
            advanced: "Invierto 500 soles mensuales en un fondo con 8% de retorno anual compuesto mensualmente. ¿Cuánto tendré en 25 años?"
        }
    },
    {
        id: 'unitprice', name: 'Comparador Precios', description: 'Cálculo de ahorro real por unidad', cat: 'Finanzas', icon: Layers, isIA: true,
        help: "Determina qué presentación de producto es más económica calculando el precio por kg/litro/unidad.",
        examples: {
            simple: "Arroz 750g a 4.50 vs Arroz 1kg a 5.80. ¿Cuál conviene?",
            advanced: "Pack de 24 gaseosas de 350ml a 45 soles vs 6 botellas de 2L a 38 soles. Calcula precio por litro y dime el ahorro porcentual."
        }
    },
    {
        id: 'commission', name: 'Calculadora Comisiones', description: 'Modelado de incentivos por ventas', cat: 'Finanzas', icon: Coins, isIA: true,
        help: "Calcula pagos a vendedores basados en escalas, cuotas y porcentajes variables.",
        examples: {
            simple: "Comisión del 3% sobre ventas de 15,000 soles.",
            advanced: "Vendedor hizo 45k. Paga 2% hasta los 20k, 5% entre 20k y 40k, y 8% por lo que sobrepase los 40k. ¿Cuánto gano de comisión?"
        }
    },
    {
        id: 'tiered_discount', name: 'Descuento Escalonado', description: 'Cálculo de tasa real acumulada', cat: 'Finanzas', icon: Percent, isIA: true,
        help: "Calcula el descuento final cuando se aplican varios de forma sucesiva (ej: 20% + 10%).",
        examples: {
            simple: "Precio 200 con 20% + 10% adicional.",
            advanced: "Prendas de liquidación: 50% de descuento base, 20% por cierre de temporada y 5% por pago con tarjeta. ¿Cuál es el descuento real acumulado?"
        }
    },
    {
        id: 'volume_discount', name: 'Descuento Volumen', description: 'Análisis de liquidez proactiva', cat: 'Finanzas', icon: Boxes, isIA: true,
        help: "Calcula precios diferenciados según la cantidad comprada para incentivar ventas mayoristas.",
        examples: {
            simple: "1 unidad 10 soles, de 12 a más baja a 8 soles. Compro 15.",
            advanced: "Escala: 1-10 und (full price), 11-50 (10% off), 51+ (25% off). Un cliente pide 35 unidades de un producto de 150 soles. Calcula total y ahorro."
        }
    },
    {
        id: 'sku_profit', name: 'Rentabilidad SKU', description: 'Diagnóstico de fuga de dinero por SKU', cat: 'Finanzas', icon: BarChart, isIA: true,
        help: "Analiza el margen bruto de cada producto individual para identificar 'productos estrella' y 'productos muertos'.",
        examples: {
            simple: "SKU-001 vende 100 und, costo 5, precio 12. SKU-002 vende 20 und, costo 50, precio 65. ¿Cuál es más rentable?",
            advanced: "Analiza 3 productos: A (500 ventas, 15% margen), B (50 ventas, 60% margen), C (200 ventas, 5% margen). ¿Cuál debería priorizar o eliminar?"
        }
    },

    // Logística & Operaciones
    {
        id: 'measurements', name: 'Conversor de Medidas', description: 'Identificador de contexto automático', cat: 'Logística', icon: Scale, isIA: true,
        help: "Convierte entre sistemas métricos e imperiales reconociendo el contexto de carga.",
        examples: {
            simple: "Convierte 150 libras a kilos.",
            advanced: "Tengo un contenedor de 20 pies con 15 toneladas de carga. ¿Cuántas libras es eso y cuántas toneladas cortas?"
        }
    },
    {
        id: 'fuel', name: 'Consumo de Combustible', description: 'Rutas inteligentes y costos realistas', cat: 'Logística', icon: Zap, isIA: true,
        help: "Estimación de gasto en combustible basado en distancia y rendimiento del vehículo.",
        examples: {
            simple: "Viaje de 300km, el auto rinde 45km/galón, el galón cuesta 18.50.",
            advanced: "Ruta Lima-Trujillo (560km). Camión rinde 12km/galón cargado y el diésel está 16.90. Agrega 200 soles de peajes y dime el costo total operativo del viaje."
        }
    },
    {
        id: 'zip', name: 'Validador ZIP AI', description: 'Corrección proactiva de envíos', cat: 'Logística', icon: Globe, isIA: true,
        help: "Verifica códigos postales y sugiere rutas de entrega optimizadas por zona.",
        examples: {
            simple: "¿Cuál es el código postal de Miraflores, Lima?",
            advanced: "Valida este destino: Av. Larco 123, CP 15074. Dime a qué distrito pertenece y si es zona metropolitana o periférica para costo de envío."
        }
    },
    {
        id: 'waste', name: 'Control de Merma AI', description: 'Plan de mitigación de residuos', cat: 'Logística', icon: Trash2, isIA: true,
        help: "Calcula el porcentaje de pérdida física de inventario y su impacto financiero.",
        examples: {
            simple: "Recibí 100kg de tomate, vendí 85kg, boté 15kg. % de merma.",
            advanced: "Inventario inicial 5000 unidades. Compras 2000. Ventas 6800. Faltan 200. El costo unitario es 4.50. Calcula merma oculta y costo de la pérdida."
        }
    },

    // Productividad & Tiempo
    {
        id: 'tips', name: 'Divisor de Cuentas', description: 'Escaneo OCR para división de tickets', cat: 'Oficina', icon: Divide, isIA: true,
        help: "Reparte el gasto de una cuenta entre varias personas considerando propinas e impuestos.",
        examples: {
            simple: "Cuenta de 450 entre 5 personas.",
            advanced: "Consumo total 1200. Éramos 6. Agrega 10% de propina, 18% IGV si no estaba incluido, y dime cuánto paga cada uno redondeando a favor del comercio."
        }
    },
    {
        id: 'date_diff', name: 'Diferencia Fechas', description: 'Intérprete de lenguaje natural', cat: 'Oficina', icon: Calendar, isIA: true,
        help: "Calcula el tiempo transcurrido entre dos momentos en días, horas, meses o años comerciales.",
        examples: {
            simple: "Días entre el 15 de marzo y el 24 de diciembre.",
            advanced: "Nací el 24 de agosto de 1992. ¿Cuántos días, semanas y meses exactos tengo de vida hasta hoy?"
        }
    },
    {
        id: 'age_calc', name: 'Calculadora Edad', description: 'Segmentación de marketing por edad', cat: 'Oficina', icon: User, isIA: true,
        help: "Determina la edad exacta y categoriza al usuario por generación (Z, Millennial, etc.).",
        examples: {
            simple: "Edad de alguien nacido en el 2005.",
            advanced: "Cliente nació el 12/05/1988. Dime su edad, signo zodiacal y a qué generación pertenece para enviarle una campaña de marketing."
        }
    },
    {
        id: 'hour_counter', name: 'Contador de Horas', description: 'Predictor de agotamiento de personal', cat: 'Oficina', icon: Clock, isIA: true,
        help: "Suma horas y minutos de trabajo para el cálculo de planillas o sobretiempos.",
        examples: {
            simple: "Entró 8:00am, salió 5:30pm con 1h de refrigerio.",
            advanced: "Luis trabajó: Lunes (8h 20m), Martes (9h), Miércoles (7h 45m). Si la hora cuesta 25 soles, ¿cuánto le corresponde cobrar?"
        }
    },
    {
        id: 'pitch_timer', name: 'Cronómetro Pitch', description: 'Coach de oratoria en tiempo real', cat: 'Oficina', icon: Timer, isIA: true,
        help: "Te ayuda a cronometrar presentaciones indicando el ritmo ideal de palabras por minuto.",
        examples: {
            simple: "Mi presentación debe durar 3 minutos. ¿A qué velocidad debo hablar?",
            advanced: "Tengo un discurso de 1500 palabras. Necesito que dure exactamente 10 minutos. Dame una pauta de tiempo por sección y velocidad recomendada."
        }
    },
    {
        id: 'calendar_link', name: 'Enlaces Calendario', description: 'Previsor de tasa de respuesta', cat: 'Oficina', icon: Calendar, isIA: true,
        help: "Genera enlaces directos para Google Calendar, Outlook o iCal con recordatorios inteligentes.",
        examples: {
            simple: "Link para reunión mañana a las 4pm sobre auditoría.",
            advanced: "Crea un evento: Lanzamiento oficial BlisCorp, 20 de mayo, de 9am a 1pm en el Hotel Westin. Incluye descripción persuasiva para los invitados."
        }
    },

    // Marketing & Ventas
    {
        id: 'qr_gen', name: 'Generador QR AI', description: 'QR dinámico con tracking inteligente', cat: 'Marketing', icon: Layers, isIA: true,
        help: "Crea códigos QR optimizados para menús, pagos o enlaces de redes sociales.",
        examples: {
            simple: "QR para mi web: blis.la.",
            advanced: "QR para conectarse al Wi-Fi: Nombre 'Oficina_Central', Clave 'Pass1234', tipo WPA. Dame el formato para generarlo."
        }
    },
    {
        id: 'emoji_search', name: 'Copiloto de Emojis', description: 'Análisis de sentimiento para redes', cat: 'Marketing', icon: Smile, isIA: true,
        help: "Sugiere los mejores emojis según el tono y contenido de tu mensaje para aumentar el engagement.",
        examples: {
            simple: "Emojis para una oferta de zapatillas.",
            advanced: "Tengo un texto sobre 'lanzamiento de una nueva plataforma de IA para finanzas'. Sugiere 5 emojis que proyecten profesionalismo e innovación tecnológica."
        }
    },
    {
        id: 'wa_link', name: 'WhatsApp Link Pro', description: 'Redacción persuasiva de mensajes', cat: 'Marketing', icon: MessageSquare, isIA: true,
        help: "Crea enlaces de WhatsApp con mensajes personalizados y potentes para cerrar ventas.",
        examples: {
            simple: "Link para mi número 999888777 que diga 'Hola, quiero info'.",
            advanced: "Crea un link de venta para el producto 'Curso Master IA'. El mensaje debe ser: 'Hola Equipo Blis, vengo de la web y quiero el 20% de descuento prometido'. Mi celular es 912345678."
        }
    },
    {
        id: 'label_mockup', name: 'Diseñador de Etiquetas', description: 'Generador de diseños 3D con IA', cat: 'Marketing', icon: PenTool, isIA: true,
        help: "Te ayuda a conceptualizar el diseño de etiquetas para envases y productos físicos.",
        examples: {
            simple: "Ideas para etiqueta de frasco de miel orgánica.",
            advanced: "Diseña la estructura de una etiqueta para vino premium. Debe incluir: Espacio para el logo, área de valores nutricionales, código de barras y un breve texto emocional sobre la vendimia."
        }
    },

    // Seguridad & Datos
    {
        id: 'check_digit', name: 'Validador Dígito', description: 'Detección de fraude estructural', cat: 'Técnico', icon: Lock, isIA: true,
        help: "Verifica la validez de documentos (RUC, DNI, Tarjetas) calculando su dígito de control.",
        examples: {
            simple: "¿Es válido el RUC 20601234567?",
            advanced: "Valida este número de tarjeta VISA: 4111 2222 3333 4444. Dime si el dígito de control cumple con el algoritmo de Luhn."
        }
    },
    {
        id: 'pass_gen', name: 'Generador Passwords', description: 'Verificador de fugas en tiempo real', cat: 'Técnico', icon: Key, isIA: true,
        help: "Genera contraseñas robustas y analiza su nivel de seguridad frente a ataques de fuerza bruta.",
        examples: {
            simple: "Clave fuerte de 12 caracteres.",
            advanced: "Genera una contraseña de alta seguridad de 24 caracteres que incluya símbolos complejos y números, pero que no sea fácil de adivinar con diccionarios de hacking comunes."
        }
    },
    {
        id: 'shuffle', name: 'Mezclador de Listas', description: 'Certificado de imparcialidad IA', cat: 'Técnico', icon: RefreshCcw, isIA: true,
        help: "Desordena elementos de una lista de forma aleatoria transparente para sorteos o asignaciones.",
        examples: {
            simple: "Mezcla estos nombres: Juan, Maria, Pedro, Luis.",
            advanced: "Tengo 50 participantes para un sorteo. Mezcla la lista y dime por qué el algoritmo de mezcla es justo e imparcial."
        }
    },
    {
        id: 'num_to_letters', name: 'Números a Letras', description: 'Gramática legal automatizada', cat: 'Técnico', icon: FileText, isIA: true,
        help: "Convierte cifras numéricas a su expresión literal correcta para documentos legales y cheques.",
        examples: {
            simple: "Escribe en letras: 4,560.50.",
            advanced: "Convierte a texto legal: 1,250,300.75 Soles. Asegúrate de usar la terminología 'Y 75/100 SOLES' al final."
        }
    },
    {
        id: 'winner_gen', name: 'Ganador Aleatorio', description: 'Certificado de imparcialidad IA', cat: 'Técnico', icon: Bot, isIA: true,
        help: "Elige uno o más ganadores de una lista asegurando total aleatoriedad.",
        examples: {
            simple: "Elige un ganador entre 10 personas.",
            advanced: "De una lista de 500 clientes, selecciona 3 ganadores distintos y justifica la aleatoriedad del proceso."
        }
    },
    {
        id: 'diff', name: 'Comparador Textos', description: 'Resumen semántico de cambios', cat: 'Técnico', icon: ArrowRightLeft, isIA: true,
        help: "Compara dos versiones de un texto resaltando borrados, adiciones y cambios de significado.",
        examples: {
            simple: "Busca diferencias entre 'Hola mundo' y 'Hola Mundos'.",
            advanced: "Compara estas dos cláusulas de contrato: 'El pago se hará en 30 días' vs 'El pago se efectuará en un plazo máximo de 30 días calendario'. ¿Cambia el sentido legal?"
        }
    },
    {
        id: 'read_time', name: 'Tiempo Lectura', description: 'Generador de resúmenes automáticos', cat: 'Técnico', icon: Clock, isIA: true,
        help: "Analiza la longitud de un texto y estima cuánto tiempo tomaría leerlo en silencio o voz alta.",
        examples: {
            simple: "¿Cuánto demora leer 500 palabras?",
            advanced: "Tengo un artículo de 3500 palabras. Dame el tiempo estimado de lectura rápida, normal y profunda, además de un resumen de 3 líneas del potencial impacto."
        }
    },
    {
        id: 'char_map', name: 'Mapa Caracteres', description: 'Predictor de símbolos frecuentes', cat: 'Técnico', icon: Hash, isIA: true,
        help: "Identifica códigos ASCII o Unicode de símbolos especiales y caracteres extraños.",
        examples: {
            simple: "¿Cuál es el código del símbolo @?",
            advanced: "Encuentra el código hexadecimal para el símbolo de copyright y dime cómo puedo escribirlo usando solo el teclado (Alt codes)."
        }
    },
    {
        id: 'user_gen', name: 'Nombres Usuario', description: 'Generador de identidad de marca', cat: 'Técnico', icon: User, isIA: true,
        help: "Crea nombres de usuario únicos y profesionales basados en tu identidad o marca.",
        examples: {
            simple: "Usuario para Kevin Rojas.",
            advanced: "Genera 10 nombres de usuario creativos para una empresa de consultoría en IA llamada 'Blis Intelligence'. Deben sonar modernos y premium."
        }
    },
    {
        id: 'video_converter', name: 'Video Converter Pro', description: 'Conversor y compresor de video profesional', cat: 'Multimedia', icon: Video, isIA: false,
        help: "Convierte videos entre formatos, extrae audio, comprime archivos y ajusta calidad. Soporta MP4, WebM, MOV, AVI y más.",
        examples: {
            simple: "Sube un video y selecciona el formato de salida.",
            advanced: "Convierte un video 4K a 1080p WebM, o extrae el audio en MP3 de alta calidad."
        }
    },
    {
        id: 'youtube_batch', name: 'YouTube Batch DL', description: 'Descarga masiva de videos de YouTube en máxima calidad', cat: 'Multimedia', icon: Download, isIA: false,
        help: "Agrega enlaces de YouTube uno por uno y descárgalos en máxima calidad (video+audio). Máximo 4 descargas simultáneas con cola automática.",
        examples: {
            simple: "Pega un enlace de YouTube y presiona Enter para agregar.",
            advanced: "Agrega múltiples enlaces, selecciona calidad máxima y descarga todos en lote."
        }
    },
    {
        id: 'pdf_converter', name: 'PDF & Document Converter', description: 'Comprime, une, divide PDFs y convierte Office a PDF. Soporta archivos de hasta 2GB vía iLovePDF.', cat: 'Multimedia', icon: FileText, isIA: false,
        help: "Procesa documentos PDF y Office: comprime archivos pesados, une múltiples PDFs, divide por páginas, convierte Word/Excel/PowerPoint a PDF, extrae imágenes de PDFs y crea PDFs desde imágenes.",
        examples: {
            simple: "Sube un PDF y comprímelo al máximo para enviar por email.",
            advanced: "Convierte un catálogo de 500 páginas en DOCX a PDF, o une 20 facturas en un solo archivo PDF."
        }
    },
    {
        id: 'bordado', name: 'Bordado IA', description: 'Convierte imágenes a SVG multicapa para Wilcom con render 3D de hilo', cat: 'Multimedia', icon: Scissors, isIA: true,
        help: "Sube una imagen JPG/PNG. La IA separa capas con SAM 2, vectoriza con Potrace y genera un SVG listo para importar en Wilcom EmbroideryStudio.",
        examples: {
            simple: "Sube un logo simple para vectorizarlo como bordado de 2-3 capas.",
            advanced: "Procesa una ilustración compleja con múltiples colores. SAM 2 separa hasta 8 capas y Potrace genera curvas SVG limpias para cada una."
        }
    }
];

export { TOOL_INDEX };