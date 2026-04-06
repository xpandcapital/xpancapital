/**
 * Parsea el campo "Forma de Pago" de Notion para extraer los pagos iniciales
 * Formatos comunes:
 * - "$150,00 USD el 9 de ABRIL de 2025" (inicial/reserva)
 * - "$10.617,45 USD 10 DE ABRIL de 2025" (inicial)
 * - "Cuotas mensuales de $500,00 los días 17 a partir de Mayo de 2025" (esto es CUOTA, no inicial)
 * - "Reserva $500 + Inicial 20% + 24 cuotas"
 */

// Verificar si un número parece ser un año (2020-2030)
function isYear(n: number): boolean {
  return n >= 2020 && n <= 2030;
}

// Parsear monto de string, manejando formatos latino y americano
function parseMonto(str: string): number | null {
  if (!str) return null;
  // Limpiar: quitar todo excepto números, puntos y comas
  const cleaned = str.replace(/[^0-9.,]/g, '');
  if (!cleaned) return null;
  
  // Detectar formato: si tiene punto y coma, asumimos formato latino (10.000,50)
  // Si solo tiene punto o solo coma, asumimos formato americano (10,000.50)
  let numStr: string;
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Formato latino: 10.000,50 -> 10000.50
    numStr = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Puede ser 10,000 (americano) o 10,50 (latino)
    // Si hay 3 dígitos después de la coma, es separador de miles
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 3) {
      // Es separador de miles: 10,000
      numStr = cleaned.replace(',', '');
    } else {
      // Es decimal: 10,50 -> 10.50
      numStr = cleaned.replace(',', '.');
    }
  } else {
    numStr = cleaned;
  }
  
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
}

export function parseFormaDePago(texto: string, precioTotal?: number): {
  iniciales: Array<{ descripcion: string; monto: number; fecha: string | null }>;
  cuotas: { cantidad: number; monto: number | null; fecha_inicio: string | null };
  textoOriginal: string;
} {
  console.log('[parseFormaDePago] Input:', texto);
  
  if (!texto) {
    return { iniciales: [], cuotas: { cantidad: 24, monto: null, fecha_inicio: null }, textoOriginal: '' };
  }

  const iniciales: Array<{ descripcion: string; monto: number; fecha: string | null }> = [];
  let cuotasCantidad = 24;
  let cuotasMonto: number | null = null;
  let cuotasFechaInicio: string | null = null;

  const textoOriginal = texto;
  const textoLower = texto.toLowerCase();

  // ── DETECTAR PATRÓN DE CUOTAS MENSUALES (esto NO es inicial) ───────────────────
  // Patrón: "Cuotas mensuales de $500" o "cuotas de $500"
  // Usamos \b para asegurar que es palabra completa
  const cuotasMensualesMatch = textoLower.match(/\bcuotas?\s+(?:mensuales?\s+)?(?:de\s+)?\$?\s*([\d.,]+)/i);
  if (cuotasMensualesMatch) {
    const monto = parseMonto(cuotasMensualesMatch[1]);
    if (monto && monto > 50 && !isYear(Math.floor(monto))) {
      cuotasMonto = monto;
      console.log('[parseFormaDePago] Cuota mensual detectada:', monto);
    }
  }

  // Patrón para "a partir de [mes] de [año]" o "desde [mes]"
  const fechaInicioMatch = textoLower.match(/(?:a partir de|desde)\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s*(?:de\s*)?(\d{4})?/i);
  if (fechaInicioMatch) {
    const mesNombre = fechaInicioMatch[1];
    const año = fechaInicioMatch[2] || new Date().getFullYear().toString();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mesNum = meses.indexOf(mesNombre.toLowerCase()) + 1;
    cuotasFechaInicio = `${año}-${mesNum.toString().padStart(2, '0')}`;
    console.log('[parseFormaDePago] Fecha inicio cuotas:', cuotasFechaInicio);
  }

  // Detectar número de cuotas: "24 cuotas", "48 meses", etc.
  // Excluir años (2020-2030)
  const cuotasMatch = textoLower.match(/(\d+)\s*(?:cuotas?|meses?|pagos?)/i);
  if (cuotasMatch) {
    const num = parseInt(cuotasMatch[1], 10);
    if (num > 0 && num < 100 && !isYear(num)) {
      cuotasCantidad = num;
      console.log('[parseFormaDePago] Cantidad cuotas:', cuotasCantidad);
    }
  }

  // ── EXTRAER INICIALES ──────────────────────────────────────────────────────────
  // Dividir por líneas nuevas o comas - procesar en orden
  const lineas = texto.split(/\r?\n|,/);
  console.log('[parseFormaDePago] Líneas encontradas:', lineas.length);

  // Primero, identificar líneas que contienen montos con $
  // Cualquier monto con $ que NO esté en una línea de cuotas es un inicial
  lineas.forEach((linea, idx) => {
    const lineaTrim = linea.trim();
    const lineaLower = lineaTrim.toLowerCase();
    
    if (!lineaTrim) return;
    console.log(`[parseFormaDePago] Procesando línea ${idx}: "${lineaTrim}"`);
    
    // Si la línea menciona "cuota" o "mensual", es cuota - NO es inicial
    if (lineaLower.includes('cuota') || lineaLower.includes('mensual')) {
      console.log('[parseFormaDePago]   -> Saltando (es cuota)');
      return;
    }

    // Buscar patrón: "$10.617,45 el 10 de abril" o "$150 el 9 de abril"
    // El monto DEBE empezar con $ seguido de números
    const montoConFecha = lineaTrim.match(/\$\s*([\d.,]+)\s*(?:usd)?\s*(?:el\s*)?(\d{1,2})\s*(?:de\s*)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+de\s+(\d{4}))?/i);
    
    if (montoConFecha) {
      const monto = parseMonto(montoConFecha[1]);
      const dia = montoConFecha[2];
      const mes = montoConFecha[3].toLowerCase();
      const año = montoConFecha[4] || new Date().getFullYear().toString();
      
      console.log(`[parseFormaDePago]   -> Patrón monto+fecha: monto=${monto}, dia=${dia}, mes=${mes}, año=${año}`);
      
      if (monto && !isNaN(monto) && !isYear(Math.floor(monto))) {
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const mesNum = meses.indexOf(mes) + 1;
        const fecha = `${año}-${mesNum.toString().padStart(2, '0')}-${dia.padStart(2, '0')}`;
        
        // Determinar descripción basada en el monto
        // Montos pequeños (< 1000) probablemente son reservas
        const esReserva = monto < 1000 || lineaLower.includes('reserva') || lineaLower.includes('separación');
        const descripcion = esReserva ? 'Reserva' : `Inicial ${iniciales.length + 1}`;
        
        iniciales.push({
          descripcion: descripcion,
          monto: monto,
          fecha: fecha
        });
        console.log(`[parseFormaDePago]   -> Agregado ${descripcion}: ${monto} en ${fecha}`);
        return;
      }
    }

    // Buscar patrón alternativo: "$10.617,45 USD 10 de abril" (sin "el")
    const montoConFecha2 = lineaTrim.match(/\$\s*([\d.,]+)\s*(?:usd)?\s+(\d{1,2})\s*(?:de\s*)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+de\s+(\d{4}))?/i);
    
    if (montoConFecha2 && !montoConFecha) { // Solo si no capturó el primero
      const monto = parseMonto(montoConFecha2[1]);
      const dia = montoConFecha2[2];
      const mes = montoConFecha2[3].toLowerCase();
      const año = montoConFecha2[4] || new Date().getFullYear().toString();
      
      console.log(`[parseFormaDePago]   -> Patrón monto+fecha (v2): monto=${monto}, dia=${dia}, mes=${mes}, año=${año}`);
      
      if (monto && !isNaN(monto) && !isYear(Math.floor(monto))) {
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const mesNum = meses.indexOf(mes) + 1;
        const fecha = `${año}-${mesNum.toString().padStart(2, '0')}-${dia.padStart(2, '0')}`;
        
        const esReserva = monto < 1000 || lineaLower.includes('reserva') || lineaLower.includes('separación');
        const descripcion = esReserva ? 'Reserva' : `Inicial ${iniciales.length + 1}`;
        
        iniciales.push({
          descripcion: descripcion,
          monto: monto,
          fecha: fecha
        });
        console.log(`[parseFormaDePago]   -> Agregado ${descripcion}: ${monto} en ${fecha}`);
        return;
      }
    }

    // Buscar montos con $ pero sin fecha explícita de día
    // Ej: "$150,00 USD" o "$10.617,45"
    const montoSimple = lineaTrim.match(/\$\s*([\d.,]+)(?:\s*(?:usd|dólares?))?/i);
    if (montoSimple) {
      const monto = parseMonto(montoSimple[1]);
      console.log(`[parseFormaDePago]   -> Patrón simple $: monto=${monto}`);
      
      // Cualquier monto con $ es potencialmente un inicial, excepto si es año
      if (monto && !isNaN(monto) && !isYear(Math.floor(monto))) {
        const esReserva = monto < 1000 || lineaLower.includes('reserva') || lineaLower.includes('separación');
        const descripcion = esReserva ? 'Reserva' : `Inicial ${iniciales.length + 1}`;
        
        iniciales.push({
          descripcion: descripcion,
          monto: monto,
          fecha: null
        });
        console.log(`[parseFormaDePago]   -> Agregado ${descripcion} sin fecha: ${monto}`);
        return;
      }
    }
  });

  // ── Si no se encontró nada con los patrones anteriores, intentar keywords ────────
  if (iniciales.length === 0) {
    const keywords = ['reserva', 'entrada', 'inicial', 'abono', 'separación', 'promesa', 'separacion'];
    keywords.forEach(kw => {
      const pattern = new RegExp(`${kw}\\s*(?:de\\s*)?\\$?\\s*([\\d.,]+)`, 'i');
      const match = texto.match(pattern);
      if (match) {
        const monto = parseMonto(match[1]);
        if (monto && !isNaN(monto) && !isYear(Math.floor(monto))) {
          iniciales.push({
            descripcion: kw.charAt(0).toUpperCase() + kw.slice(1),
            monto: monto,
            fecha: null
          });
          console.log(`[parseFormaDePago] -> Agregado por keyword "${kw}": ${monto}`);
        }
      }
    });
  }

  // ── Buscar porcentaje de inicial ──────────────────────────────────────────────
  const porcentajeMatch = textoLower.match(/(\d+)%\s*(?:inicial|entrada|enganche)/i);
  if (porcentajeMatch && iniciales.length === 0) {
    const porcentaje = parseInt(porcentajeMatch[1], 10);
    if (porcentaje > 0 && porcentaje < 100 && precioTotal) {
      iniciales.push({
        descripcion: `Inicial ${porcentaje}%`,
        monto: (precioTotal * porcentaje) / 100,
        fecha: null
      });
      console.log(`[parseFormaDePago] -> Agregado por porcentaje: ${porcentaje}% = ${(precioTotal * porcentaje) / 100}`);
    }
  }

  // ── Fallback: si no hay nada, crear vacío ──────────────────────────────────────
  if (iniciales.length === 0) {
    iniciales.push({
      descripcion: 'Entrada Inicial',
      monto: 0,
      fecha: null
    });
  }

  const resultado = {
    iniciales,
    cuotas: { cantidad: cuotasCantidad, monto: cuotasMonto, fecha_inicio: cuotasFechaInicio },
    textoOriginal
  };
  
  console.log('[parseFormaDePago] Resultado:', JSON.stringify(resultado, null, 2));
  return resultado;
}

/**
 * Valida si un recibo coincide con el pago esperado
 */
export function validarPagoRecibo(
  esperado: number,
  recibido: number
): { 
  estado: 'ok' | 'faltante' | 'sobrepago' | 'pendiente' | 'futuro';
  diferencia: number;
  porcentaje: number;
  mensaje: string;
} {
  if (esperado === 0 && recibido === 0) {
    return { estado: 'pendiente', diferencia: 0, porcentaje: 0, mensaje: 'Sin pagar' };
  }
  
  if (esperado === 0 && recibido > 0) {
    return { 
      estado: 'sobrepago', 
      diferencia: recibido, 
      porcentaje: 100, 
      mensaje: `Pagó ${formatCurrency(recibido)} (sin esperado)` 
    };
  }
  
  if (recibido === 0) {
    return { 
      estado: 'pendiente', 
      diferencia: -esperado, 
      porcentaje: 0, 
      mensaje: `Pendiente ${formatCurrency(esperado)}` 
    };
  }
  
  const diferencia = recibido - esperado;
  const porcentaje = (recibido / esperado) * 100;
  
  if (recibido >= esperado) {
    const extra = diferencia > 0 ? ` (+${formatCurrency(diferencia)})` : '';
    return { 
      estado: 'ok', 
      diferencia, 
      porcentaje,
      mensaje: `${formatCurrency(recibido)} de ${formatCurrency(esperado)}${extra}`
    };
  } else {
    const faltante = esperado - recibido;
    return { 
      estado: 'faltante', 
      diferencia, 
      porcentaje,
      mensaje: `${formatCurrency(recibido)} de ${formatCurrency(esperado)} (falta ${formatCurrency(faltante)})` 
    };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount);
}

/**
 * Genera colores de estado para los pagos
 */
export function getEstadoColor(estado: 'ok' | 'faltante' | 'sobrepago' | 'pendiente' | 'futuro'): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (estado) {
    case 'ok':
      return { 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500'
      };
    case 'faltante':
      return { 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-400', 
        border: 'border-amber-500/30',
        dot: 'bg-amber-500'
      };
    case 'sobrepago':
      return { 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500'
      };
    case 'futuro':
      return { 
        bg: 'bg-zinc-500/5', 
        text: 'text-zinc-500', 
        border: 'border-zinc-500/20',
        dot: 'bg-zinc-500'
      };
    case 'pendiente':
    default:
      return { 
        bg: 'bg-zinc-500/10', 
        text: 'text-zinc-400', 
        border: 'border-zinc-500/30',
        dot: 'bg-zinc-500'
      };
  }
}
