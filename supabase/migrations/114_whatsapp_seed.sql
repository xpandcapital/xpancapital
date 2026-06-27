-- Migración: 114_whatsapp_seed.sql
-- Plantillas de variables y mensajes por categoría para WhatsApp Marketing

DO $$
DECLARE
  empresa_id UUID := '6186f014-c8c7-4027-9f08-8acf2bae3eae';
  user_id UUID := (SELECT id FROM profiles WHERE empresa_id = empresa_id LIMIT 1);
BEGIN

-- ═══════════════════════════════════════════════════════════
-- MONTERELLO — Variables
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'apertura_montebello', '{"apertura_montebello":["{nombre}, vi que te interesa invertir y tengo algo que te va a gustar","{nombre}, te escribo porque sé que estás buscando dónde hacer crecer tu dinero","{nombre}, creo que encontré justo lo que estabas esperando","{nombre}, lo que voy a mostrarte probablemente sea la mejor decisión financiera que tomes este año","{nombre}, tengo una oportunidad que no quería que te perdieras","{nombre}, ¿qué pensarías si te digo que puedes ser dueño de un departamento en la mejor zona desde $62k?","{nombre}, te tengo algo que sé que te va a encantar — dame 1 minuto","{nombre}, no suelo hacer esto pero esto es demasiado bueno para no compartirlo"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'impacto_montebello', '{"impacto_montebello":["Montebello no es un proyecto más — es EL proyecto que todos están viendo ahora mismo 👀","La plusvalía de la zona ya subió 40% y ni siquiera terminamos de construir 📈","Los que compraron en etapa 1 ya duplicaron su inversión sin mover un dedo 💰","Cada mes que esperas, el m² sube. Literalmente te cuesta más NO comprar","Los inversionistas grandes ya separaron sus unidades — el que llega tarde paga más","Esto no es un gasto — es comprar un activo que se paga solo mientras duermes"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'beneficio_principal_montebello', '{"beneficio_principal_montebello":["{ubicacion_montebello}. {amenidades_montebello}. Y TODO por {precio_montebello}.","Departamento de 2 dormitorios con {amenidades_montebello} a solo {precio_montebello} — dime si no es un regalo","{ubicacion_montebello} + {amenidades_montebello} = la combinación perfecta para vivir o alquilar","Esto es lo que incluye: {amenidades_montebello}. ¿Cuánto crees que vale? {precio_montebello}. Exacto.","Mira la lista: {amenidades_montebello}. Todo eso incluido. Precio: {precio_montebello}."]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'ubicacion_montebello', '{"ubicacion_montebello":["en el corazón financiero de la ciudad — a 5 min a pie de TODO 🏙️","frente al nuevo centro empresarial — tus clientes caminan a tu oficina 💼","a 3 cuadras del metro y del mall más grande de la zona — no necesitas auto 🚇","en la avenida principal con acceso directo a la vía expresa — llegas en 15 min 🚗","a 5 min del centro financiero, 3 min del parque, 1 min del supermercado — LOCACIÓN PERFECTA 📍","rodeado de restaurantes, bancos, gimnasios, farmacias — todo lo que necesitas a la puerta","la zona con mayor plusvalía de toda la ciudad — los números no mienten 📊"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'amenidades_montebello', '{"amenidades_montebello":["piscina infinity en rooftop, gimnasio 24/7, co-working y BBQ para recibir a tus amigos 🌴","piscina con vista panorámica, gym completo, sala de reuniones y terraza con bar 🍸","áreas verdes de más de 1000m², piscina, sauna y pet park para tu mascota 🐕","rooftop con piscina climatizada, gimnasio equipado, sala de cine y jardín zen 🧘","piscina infinity, gimnasio, co-working, rooftop con BBQ, pet park, sala de cine — SÍ, TODO ESO","gimnasio 24/7, piscina climatizada, sauna, jardín zen, pet park, business center, sala de juegos","áreas verdes, piscina, BBQ, gimnasio, co-working, seguridad 24/7 — calidad de vida de hotel 5 estrellas"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'precio_montebello', '{"precio_montebello":["desde $62,000 USD con solo $1,000 de separación 💰","$62,000 USD — menos de lo que pagarías de alquiler en 5 años 🏠","desde $62k — el m² más bajo de toda la zona con acabados de lujo 💎","$62,000 USD con financiamiento directo sin banco — tú escoges tus cuotas 📋","$62k con cocina equipada y closets incluidos — no gastas un sol más en acabados","desde $62,000 USD — un departamento así en esta zona normalmente cuesta $85k o más","$62,000 con opción de financiamiento a 24 meses sin intereses — dime si no es un regalo","$62k — págalo en cuotas mensuales que son más baratas que lo que pagas de alquiler ahora"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'entrega_montebello', '{"entrega_montebello":["entrega inmediata — te mudas este mismo mes y estrenas depa 🏠","ya está listo — puedes ver tu unidad terminada mañana mismo si quieres 👀","entrega en Diciembre 2026 con bono de acabados incluido 🎁","últimas 3 unidades con entrega inmediata y cocina equipada de regalo 🎁","entrega YA — no esperas 2 años como en otros proyectos","puedes mudarte en 30 días si cierras esta semana — así de rápido"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'inversion_montebello', '{"inversion_montebello":["la plusvalía de la zona subió 40% en 2 años — esto se paga solo 📊","el m² aquí cuesta menos que en zonas aledañas — es el momento justo ⏱️","tu cuota mensual es más baja que lo que pagas de alquiler ahora mismo 💸","los que compraron en etapa preventa ya ganaron $15,000 de valorización 🚀","en 3 años esto vale el doble — los números no mienten, la ubicación lo garantiza","alquilas este departamento en $500/mes y se paga solo en 10 años — después es 100% ganancia","cada mes que esperas, el precio sube $1,500. Literalmente pierdes dinero pensando"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'visita_montebello', '{"visita_montebello":["La única forma de saber si es para ti es verlo. ¿Mañana a las 11am o el jueves a las 4pm?","Tengo las llaves del departamento modelo. ¿Vamos mañana o prefieres el sábado?","Te paso a recoger y en 15 minutos estás viendo tu futuro departamento. ¿Martes o miércoles?","Ven a verlo con tus propios ojos. ¿El jueves después del trabajo o el sábado en la mañana?","Agéndame 20 minutos y te muestro por qué todos están comprando aquí. ¿Mañana o el viernes?","La visita no te compromete a nada — solo vienes, ves y decides. ¿Te parece mañana a las 3pm?","Tráete a tu familia. Que ellos también vean dónde van a vivir. ¿Sábado 10am o domingo 11am?"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'urgencia_unidad_montebello', '{"urgencia_unidad_montebello":["La unidad con {amenidades_montebello} tiene a otras 2 personas preguntando — si esperas, se va","Mira, el que separó primero ya aseguró su precio. ¿Quieres ser el segundo o el tercero?","De las 3 que quedan con {entrega_montebello}, 2 ya están habladas. Solo hay 1 real disponible","Acabo de recibir una llamada de otro interesado por la misma unidad — te aviso para que no te la ganen","El precio de preventa vence este viernes. Después sube automático. No es presión — es un hecho","Hay 2 personas que ya pidieron cotización para la misma unidad. El primero que separe se la lleva","Esta unidad es la última con vista panorámica. Después de esta, solo quedan internos"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'cierre_visita_montebello', '{"cierre_visita_montebello":["{nombre}, ya lo viste, ya sabes que {inversion_montebello}. ¿Separamos con $1,000 hoy y dejas de buscar?","Si esto no es para ti, te devuelvo la separación sin preguntas. Pero dime que NO quieres ganar dinero con esto","Piénsalo: en 2 años esto vale $15,000 más. El que no compra hoy, mañana paga más. ¿Vamos?","{nombre}, la gente que visitó y no compró me llama arrepentida cada semana. No seas el siguiente","Mira, si yo estuviera en tu lugar, ya habría separado. La oportunidad es demasiado clara","Ya viste el departamento. Ya sabes el precio. Ya sabes que {inversion_montebello}. ¿Qué te detiene?","Solo necesito tu SÍ y en 5 minutos está separado. Mañana podría ser demasiado tarde","No me digas que NO — dime qué necesitas para decir que SÍ. Lo resolvemos juntos"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Montebello', 'objecion_montebello', '{"objecion_montebello":["Si el dinero es el tema, tengo 3 opciones de financiamiento — no necesitas el 100% ahora. ¿Las vemos?","¿Sabes cuánto cuesta NO comprar? $500 al mes de alquiler que nunca vuelven. Esto es tuyo para siempre","Entiendo que quieras pensarlo. Mientras piensas, el precio sube. Todos los que ''lo pensaron'' hoy pagan más","Si tu preocupación es la cuota, hay un plan de pagos que no vas a creer — te lo cuento en 2 minutos","El que espera el momento perfecto nunca compra. Y después se arrepiente. ¿Vamos o qué?","Hablemos claro: ¿qué es lo peor que puede pasar? Separas, lo ves, no te gusta, te devuelvo todo. No pierdes nada","No me digas que lo vas a pensar. Eso ya lo escuché 100 veces. Dime qué necesitas saber YA para decidir"]}', user_id)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- VILLA VICTORIA — Variables
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'apertura_villavictoria', '{"apertura_villavictoria":["{nombre}, lo que voy a mostrarte es probablemente la mejor oportunidad de inversión del año","{nombre}, encontré un terreno que vale la pena ver — no es para todos, pero creo que para ti sí","{nombre}, ¿qué pensarías si te digo que puedes ser dueño de un terreno desde $45k?","{nombre}, quiero que seas de los que dentro de 5 años digan ''yo compré cuando nadie miraba''","{nombre}, el aeropuerto nuevo está a 10 min de aquí — ¿sabes lo que eso va a hacer con el precio del suelo?","{nombre}, los terrenos en esta zona se están acabando. Y los que quedan, cada día más caros"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'impacto_villavictoria', '{"impacto_villavictoria":["Villa Victoria está en la zona que más crece de la ciudad — el aeropuerto nuevo está a 10 minutos ✈️","Cada mes que pasa, el lote aquí vale más. Literalmente el tiempo está de tu lado si compras ahora 📈","La municipalidad está invirtiendo millones en calles, parques y servicios aquí — ¿crees que el precio se va a quedar igual?","El que compró aquí hace 1 año ya ganó $8,000 de plusvalía sin hacer nada. Solo compró y esperó","En 3 años esto es una zona consolidada con todo — el que compra HOY compra barato"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'ubicacion_villavictoria', '{"ubicacion_villavictoria":["en la zona de mayor crecimiento de toda la ciudad — plusvalía asegurada 📈","a 10 min del nuevo aeropuerto — valorización garantizada los próximos 5 años ✈️","rodeado de colegios, clínicas y supermercados — lo tienes todo a la mano 🏫","en el distrito que más está invirtiendo la municipalidad — calles, parques, todo nuevo 🏗️","a 5 min de la nueva carretera — cuando la terminen, esto se dispara","la zona que todos están mirando pero pocos se atreven a comprar — sé el primero"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'amenidades_villavictoria', '{"amenidades_villavictoria":["parque privado de 3000m² con juegos para niños, cancha de fútbol y piscina familiar 🌳","seguridad 24/7 con caseta de control, cerco eléctrico y cámaras en todo el perímetro 🛡️","salón de usos múltiples, gimnasio al aire libre, zona de parrillas y estacionamiento 🏋️","áreas verdes con jardines, piscina para niños y adultos, y boulevard peatonal 🌺","parque de 3000m², piscina, gimnasio, seguridad 24/7 — como un club privado","jardines, piscina familiar, cancha deportiva, sala de eventos, seguridad total"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'precio_villavictoria', '{"precio_villavictoria":["desde $45,000 USD — el lote con mejor precio de todo el distrito 🏷️","$45k con financiamiento directo de 24 meses sin cuota inicial 💰","$45,000 USD — paga $1,875 al mes y en 2 años es tuyo 📊","desde $45k con bono de escritura gratis si separas esta semana 🎁","$45,000 — menos de lo que vale un auto nuevo. Pero esto no se deprecia, se valoriza","$45k con opción de construir cuando quieras — sin presión, sin prisas","desde $45,000 USD con cuotas que empiezan en $375 mensuales — menos que un alquiler"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'entrega_villavictoria', '{"entrega_villavictoria":["entrega Marzo 2027 — solo quedan 5 lotes en esta etapa 📅","separación con $500 y el resto en cuotas hasta la entrega — sin intereses 💳","próxima entrega en 6 meses — ya están levantando muros, ve a verlo 🏗️","etapa actual 80% vendida — entrega programada con todos los servicios listos ✅","entrega en 2027 con opción de construir desde el día 1 — no necesitas esperar la entrega para empezar","separación mínima y el resto contra entrega — el plan más flexible del mercado"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'beneficio_villavictoria', '{"beneficio_villavictoria":["{ubicacion_villavictoria}. {amenidades_villavictoria}. {precio_villavictoria}. Dime si no es la mejor inversión del año","Un terreno propio desde {precio_villavictoria} en {ubicacion_villavictoria} con {amenidades_villavictoria}","{precio_villavictoria} con {entrega_villavictoria} — esto es inversión, no gasto"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'visita_villavictoria', '{"visita_villavictoria":["Ven a verlo. Trae a tu familia. El sábado hago recorridos cada hora — ¿te apunto a las 10am o a las 2pm?","Ya están levantando muros. Esto no es un render — es real. ¿Te paso a recoger el domingo?","Tengo 3 lotes disponibles ahora mismo. Cuando los veas en persona, vas a querer los 3. ¿Vamos mañana?","Tienes que pisar el terreno para entenderlo. ¿El viernes en la tarde o el sábado temprano?","La visita no cuesta nada y te puede cambiar la vida. ¿Cuándo nos vemos?","Te apunto para el recorrido del sábado — salimos a las 10am. ¿Te paso la ubicación?"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'cierre_visita_villavictoria', '{"cierre_visita_villavictoria":["{nombre}, ya pisaste el terreno. Ya viste {amenidades_villavictoria}. ¿Cuál de los lotes quieres?","La gente que visitó el mes pasado y no compró hoy está llamando arrepentida. ¿Vas a ser el siguiente?","Tu lote se separa con $500. Eso es menos de lo que gastas en un fin de semana. ¿Lo hago ya?","Los que separaron el mes pasado ya ganaron $3,000 de plusvalía sin construir nada. ¿Entramos?","{nombre}, dime qué lote quieres y en 5 minutos está a tu nombre. Sin vueltas","No necesitas el 100% ahora. Solo $500 y el resto en cuotas. No hay excusa","El terreno no te va a esperar. Cada semana hay alguien nuevo preguntando por el mismo lote"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Villa Victoria', 'objecion_precio_villavictoria', '{"objecion_precio_villavictoria":["El que compró aquí hace un año ya duplicó su inversión. ¿Cuánto más necesitas que suba para decidirte?","$45k hoy. En 2 años vale $70k mínimo. ¿Prefieres pagar $45k o $70k?","Mira, si no tienes todo ahora, finánciamelo en 24 meses sin intereses. No hay excusa","El dinero en el banco se devalúa. El terreno se valoriza. Tú decides qué hacer con tus ahorros","¿Sabes cuánto pagas de alquiler al año? Eso mismo metido a un terreno te da tu casa propia","No necesitas construir ya — solo necesitas ser dueño del terreno. El resto viene después"]}', user_id)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- CURSO INMOBILIARIO — Variables
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'apertura_curso', '{"apertura_curso":["{nombre}, la mayoría de agentes está perdiendo ventas por no saber esto","{nombre}, ¿quieres saber cómo cerrar 3 propiedades al mes sin experiencia previa?","{nombre}, lo que te voy a compartir cambió mi carrera — y puede cambiar la tuya","{nombre}, en 30 días puedes estar ganando el doble de comisiones. ¿Te interesa saber cómo?","{nombre}, descubrí un sistema para vender propiedades que funciona aunque nunca hayas vendido nada","{nombre}, si pudieras facturar $5,000+ este mes en comisiones, ¿me prestarías 2 minutos?"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'beneficio_curso', '{"beneficio_curso":["acceso de por vida + material descargable + actualizaciones gratis para siempre ♾️","aprendes a tu ritmo, sin horarios, desde tu celular o computadora — tú mandas 📱","incluye certificado avalado, mentoría grupal semanal y biblioteca de recursos 📜","te llevas scripts de ventas probados, plantillas de WhatsApp listas para copiar y pegar 📋","más de 40 lecciones en video, ejercicios prácticos y casos reales de cierre 🎥","tienes acceso a un grupo privado donde compartimos leads y nos ayudamos entre todos 👥"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'resultado_curso', '{"resultado_curso":["los que ya lo tomaron cierran mínimo 3 propiedades al mes — sin experiencia previa 📈","en 30 días dominas objeciones, negociación y cierres — garantizado o te devuelvo todo 🛡️","alumnos que empezaron de cero hoy están facturando $5,000+ mensuales en comisiones 💸","la semana 1 ya tienes tu primer lead trabajado con nuestro sistema de captación 🎯","en 60 días pasas de 0 a tener un pipeline de clientes reales — sin pagar publicidad","tengo alumnos que ya están viviendo solo de sus comisiones. Algunos empezaron sin saber qué era un lead"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'precio_curso', '{"precio_curso":["$97 USD — menos de lo que gastas en gasolina buscando clientes sin método ⛽","$97 USD (precio real $297) — 67% OFF solo por lanzamiento 🏷️","$97 USD con acceso DE POR VIDA — se paga solo con tu primera comisión 💰","$97 USD — si no vendes al menos 1 propiedad en 60 días, te devuelvo todo 🛡️","$97 — una cena con amigos te cuesta más que esto. Y esto te puede cambiar la vida","$97 USD — es literalmente lo que ganas en comisión de UN SOLO cierre. El resto es ganancia"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'cierre_curso', '{"cierre_curso":["{beneficio_curso}. {resultado_curso}. {precio_curso}. No es un gasto — es lo que te va a hacer vender más. ¿Te inscribo ya?","Mira, si en 60 días no cierras al menos 1 propiedad más, te devuelvo todo. Así de seguro estoy. ¿Entramos?","No necesitas más experiencia. Solo necesitas esto. {precio_curso}. ¿Te apunto o qué?","Vas a recuperar esta inversión en tu primer cierre — y de ahí todo es ganancia. ¿Empezamos hoy?","Solo quedan 3 cupos con este precio. Después sube a $297. ¿Aprovechas ahora?","Tienes 2 opciones: seguir como estás o invertir $97 en cambiar tu carrera. ¿Cuál eliges?","Piénsalo: ¿cuánto te cuesta NO tener este sistema? Los deals que pierdes valen mucho más que $97"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'objecion_curso', '{"objecion_curso":["''No tengo tiempo'' — el curso es a tu ritmo. Lo ves cuando quieras, donde quieras","''No tengo experiencia'' — por eso existe este curso. Empiezas de cero y avanzas paso a paso","''No tengo el dinero'' — $97 es lo que ganas en 1 cierre. El curso se paga solo","''Ya he tomado cursos antes'' — este no es teoría, es un sistema probado. Si no te sirve, te devuelvo todo","''Lo voy a pensar'' — el precio sube en 48 horas. Piénsalo con el descuento aplicado, no después"]}', user_id)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- ASESORÍA — Variables
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Asesoría', 'apertura_asesoria', '{"apertura_asesoria":["{nombre}, analicé tu situación y sé exactamente qué te está frenando","{nombre}, puedo ayudarte a facturar el doble este mes si me dejas mostrarte cómo","{nombre}, tienes todo para vender más — solo te falta la estrategia correcta. Yo te la doy","{nombre}, no estás vendiendo al nivel que deberías. Y no es tu culpa — es tu método","{nombre}, ¿qué pensarías si te digo que en 4 sesiones puedes transformar completamente tus resultados?"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Asesoría', 'beneficio_asesoria', '{"beneficio_asesoria":["revisamos tu portafolio completo y te digo exactamente qué propiedades mover primero 🎯","te enseño mi sistema de captación de leads — los clientes llegan solos 📲","diseñamos juntos tu estrategia de ventas personalizada en la primera sesión 📋","te conecto directamente con compradores calificados de mi base de datos 🤝","trabajamos tus objeciones, tu speech de ventas y tu presencia online","te ayudo a crear un sistema que genera leads mientras duermes — sin depender de referrals"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Asesoría', 'sesiones_asesoria', '{"sesiones_asesoria":["4 sesiones 1-a-1 de 1 hora — 100% enfocadas en hacerte vender más 🎯","8 sesiones con acceso a mi WhatsApp 24/7 para cualquier duda urgente 📲","12 sesiones con plan de acción semanal, revisión de avances y ajustes 📊","1 sesión intensiva de 3 horas — salimos con tu plan listo para ejecutar HOY ⚡","4 sesiones + acceso a mi grupo VIP de inversionistas y compradores calificados","8 sesiones con seguimiento diario y ajustes en vivo según resultados"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Asesoría', 'precio_asesoria', '{"precio_asesoria":["$197 USD por sesión — se paga solo con tu primer cierre 💰","$497 USD el paquete de 4 sesiones — menos de lo que pierdes en comisiones no cerradas","$997 USD el programa completo — incluye acceso a mi red de compradores VIP","$147 USD sesión de diagnóstico — te digo exactamente qué hacer y si no te sirve, no me pagas","$197 USD — literalmente lo recuperas en tu primer deal cerrado con mi estrategia"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'Asesoría', 'cierre_asesoria', '{"cierre_asesoria":["{beneficio_asesoria}. {sesiones_asesoria}. {precio_asesoria}. Si no ves resultados en 2 semanas, no me pagas. ¿Empezamos?","No es un gasto — es la inversión que te va a multiplicar tus cierres. Y si no funciona, no pagas. ¿Trato?","Mira, lo peor que puede pasar es que aprendas algo nuevo. Lo mejor: que dupliques tus ingresos. ¿Vale la pena intentarlo?","Déjame demostrarte en 1 sesión que esto funciona. Si no te convence, no sigues. ¿Cuándo empezamos?","Los que ya trabajan conmigo cerraron deals en la primera semana. ¿Quieres ser el siguiente?","Una sola sesión puede cambiar tu forma de vender para siempre. ¿Le damos?"]}', user_id)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- GENÉRICAS — Variables compartidas
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'General', 'saludo', '{"saludo":["Hola, ¿qué tal? 👋","¡Hey! ¿Cómo te va? 😊","Buen día ☀️","Buenas tardes 🌤️","Buenas noches 🌙","¡Qué gusto saludarte! 🤝","Espero que estés teniendo un excelente día ✨","¿Cómo estás? Tanto tiempo 🙌","¡Hola! Justo pensaba en ti 💭","Feliz día — te tengo una sorpresa 🎁"]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'General', 'nombre', '{"nombre":["{nombre}","","{nombre},",""]}', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_variable_templates (empresa_id, categoria, nombre, variables, created_by)
VALUES (empresa_id, 'General', 'recordatorio', '{"recordatorio":["No quiero que después te arrepientas de no haber entrado cuando pudiste ⏰","Esto se mueve rápido — la unidad que te gustó ya tiene otros 2 interesados 👀","El precio de preventa vence este viernes — después sube automático 📅","Te lo digo como amigo: el que piensa mucho, pierde la oportunidad 🤝","No me gusta insistir, pero esto es demasiado bueno para dejarlo pasar","Cada día que pasa sin decidirte, es un día que pierdes de ganar dinero"]}', user_id)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- MONTERELLO — Mensajes
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Montebello', 'Presentación Montebello v1', '[{"texts":["{saludo} {nombre}\n\n{impacto_montebello}\n\n{beneficio_principal_montebello}\n\n{visita_montebello}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Montebello', 'Presentación Montebello v2', '[{"texts":["{saludo} {nombre}\n\nTe escribo porque sé que {ubicacion_montebello} te interesa. Montebello tiene {amenidades_montebello} y está a {precio_montebello}.\n\n{inversion_montebello}\n\n{visita_montebello}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Montebello', 'Calificar visita Montebello', '[{"texts":["{saludo} {nombre}\n\nQuería saber qué te pareció la info que te mandé de Montebello.\n\n{urgencia_unidad_montebello}\n\n{visita_montebello}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Montebello', 'Post-visita cierre Montebello', '[{"texts":["{nombre}, ya lo viste con tus propios ojos. Sabes que {inversion_montebello}.\n\n{urgencia_unidad_montebello}\n\n{cierre_visita_montebello}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Montebello', 'Seguimiento 3 días Montebello', '[{"texts":["{saludo} {nombre}\n\nHace unos días hablamos de Montebello. La unidad con {amenidades_montebello} sigue disponible pero ya hay otros interesados.\n\n{urgencia_unidad_montebello}\n\n{cierre_visita_montebello}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Montebello', 'Objeción precio Montebello', '[{"texts":["{nombre}, entiendo tu punto, pero mira:\n\n{objecion_montebello}\n\n{cierre_visita_montebello}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- VILLA VICTORIA — Mensajes
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Villa Victoria', 'Presentación Villa Victoria v1', '[{"texts":["{saludo} {nombre}\n\n{apertura_villavictoria}\n\n{impacto_villavictoria}\n\n{beneficio_villavictoria}\n\n{visita_villavictoria}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Villa Victoria', 'Presentación Villa Victoria v2', '[{"texts":["{saludo} {nombre}\n\nVilla Victoria es el proyecto que más está creciendo. {ubicacion_villavictoria}.\n\n{amenidades_villavictoria}\n\nPrecio: {precio_villavictoria} con {entrega_villavictoria}\n\n{visita_villavictoria}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Villa Victoria', 'Post-visita Villa Victoria', '[{"texts":["{nombre}, ya pisaste el terreno. Viste {amenidades_villavictoria} con tus propios ojos.\n\n{visita_villavictoria}\n\n{cierre_visita_villavictoria}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Villa Victoria', 'Seguimiento Villa Victoria', '[{"texts":["{saludo} {nombre}\n\n¿Pudiste revisar lo de Villa Victoria?\n\n{objecion_precio_villavictoria}\n\n{cierre_visita_villavictoria}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- CURSO — Mensajes
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'Presentación Curso v1', '[{"texts":["{saludo} {nombre}\n\n{apertura_curso}\n\n{beneficio_curso}\n\n{resultado_curso}\n\n{cierre_curso}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'Lanzamiento Curso', '[{"texts":["{saludo} {nombre}\n\nAcabo de lanzar mi nuevo curso para agentes inmobiliarios.\n\n{beneficio_curso}\n\n{resultado_curso}\n\n{precio_curso}\n\nPero solo por lanzamiento. Después sube.\n\n{cierre_curso}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Curso Inmobiliario', 'Recordatorio Curso', '[{"texts":["{saludo} {nombre}\n\nNo quiero que te lo pierdas. El precio de lanzamiento del curso vence en 24 horas.\n\n{beneficio_curso}\n\n{precio_curso}\n\n{cierre_curso}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- ASESORÍA — Mensajes
-- ═══════════════════════════════════════════════════════════

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Asesoría', 'Presentación Asesoría v1', '[{"texts":["{saludo} {nombre}\n\n{apertura_asesoria}\n\n{beneficio_asesoria}\n\n{sesiones_asesoria}\n\n{cierre_asesoria}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_message_templates (empresa_id, categoria, nombre, message_groups, created_by)
VALUES (empresa_id, 'Asesoría', 'Seguimiento Asesoría', '[{"texts":["{saludo} {nombre}\n\n¿Pudiste revisar lo que te propuse de la asesoría?\n\n{beneficio_asesoria}\n\n{cierre_asesoria}"],"media_url":null,"filename":null}]', user_id)
ON CONFLICT DO NOTHING;

END $$;
