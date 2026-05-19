"use client";

import { useState, useMemo } from 'react';
import { Search, Shield, X, Plus, Check, Globe, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import Flag from 'react-world-flags';
import type { GeobloqueoConfig } from '../_types';
import { defaultGeobloqueoConfig } from '../_types';

const PAISES: Record<string, string> = {
  AF: "Afganistán", AL: "Albania", DE: "Alemania", AD: "Andorra", AO: "Angola",
  AG: "Antigua y Barbuda", SA: "Arabia Saudita", DZ: "Argelia", AR: "Argentina",
  AM: "Armenia", AU: "Australia", AT: "Austria", AZ: "Azerbaiyán",
  BS: "Bahamas", BD: "Bangladesh", BB: "Barbados", BH: "Baréin", BE: "Bélgica",
  BZ: "Belice", BJ: "Benín", BY: "Bielorrusia", BO: "Bolivia", BA: "Bosnia y Herzegovina",
  BW: "Botsuana", BR: "Brasil", BN: "Brunéi", BG: "Bulgaria", BF: "Burkina Faso",
  BI: "Burundi", BT: "Bután", CV: "Cabo Verde", KH: "Camboya", CM: "Camerún",
  CA: "Canadá", QA: "Qatar", TD: "Chad", CL: "Chile", CN: "China", CY: "Chipre",
  CO: "Colombia", KM: "Comoras", CG: "Congo", CD: "Congo (RDC)", KP: "Corea del Norte",
  KR: "Corea del Sur", CI: "Costa de Marfil", CR: "Costa Rica", HR: "Croacia",
  CU: "Cuba", DK: "Dinamarca", DM: "Dominica", EC: "Ecuador", EG: "Egipto",
  SV: "El Salvador", AE: "Emiratos Árabes", ER: "Eritrea", SK: "Eslovaquia",
  SI: "Eslovenia", ES: "España", US: "Estados Unidos", EE: "Estonia", ET: "Etiopía",
  PH: "Filipinas", FI: "Finlandia", FJ: "Fiyi", FR: "Francia", GA: "Gabón",
  GM: "Gambia", GE: "Georgia", GH: "Ghana", GD: "Granada", GR: "Grecia",
  GT: "Guatemala", GN: "Guinea", GQ: "Guinea Ecuatorial", GW: "Guinea-Bisáu",
  GY: "Guyana", HT: "Haití", HN: "Honduras", HK: "Hong Kong", HU: "Hungría",
  IN: "India", ID: "Indonesia", IQ: "Irak", IR: "Irán", IE: "Irlanda",
  IS: "Islandia", IL: "Israel", IT: "Italia", JM: "Jamaica", JP: "Japón",
  JO: "Jordania", KZ: "Kazajistán", KE: "Kenia", KG: "Kirguistán", KI: "Kiribati",
  KW: "Kuwait", LA: "Laos", LS: "Lesoto", LV: "Letonia", LB: "Líbano",
  LR: "Liberia", LY: "Libia", LI: "Liechtenstein", LT: "Lituania", LU: "Luxemburgo",
  MO: "Macao", MK: "Macedonia Norte", MG: "Madagascar", MY: "Malasia", MW: "Malaui",
  MV: "Maldivas", ML: "Malí", MT: "Malta", MA: "Marruecos", MU: "Mauricio",
  MR: "Mauritania", MX: "México", FM: "Micronesia", MD: "Moldavia", MC: "Mónaco",
  MN: "Mongolia", ME: "Montenegro", MZ: "Mozambique", MM: "Myanmar", NA: "Namibia",
  NR: "Nauru", NP: "Nepal", NI: "Nicaragua", NE: "Níger", NG: "Nigeria",
  NO: "Noruega", NZ: "Nueva Zelanda", OM: "Omán", NL: "Países Bajos", PK: "Pakistán",
  PW: "Palaos", PA: "Panamá", PG: "Papúa Nueva Guinea", PY: "Paraguay", PE: "Perú",
  PL: "Polonia", PT: "Portugal", PR: "Puerto Rico", GB: "Reino Unido", CZ: "República Checa",
  DO: "Rep. Dominicana", RW: "Ruanda", RO: "Rumanía", RU: "Rusia", WS: "Samoa",
  SM: "San Marino", LC: "Santa Lucía", ST: "Santo Tomé", SN: "Senegal", RS: "Serbia",
  SC: "Seychelles", SL: "Sierra Leona", SG: "Singapur", SY: "Siria", SO: "Somalia",
  LK: "Sri Lanka", ZA: "Sudáfrica", SD: "Sudán", SS: "Sudán del Sur", SE: "Suecia",
  CH: "Suiza", SR: "Surinam", TH: "Tailandia", TW: "Taiwán", TZ: "Tanzania",
  TJ: "Tayikistán", TL: "Timor Oriental", TG: "Togo", TO: "Tonga", TT: "Trinidad y Tobago",
  TN: "Túnez", TM: "Turkmenistán", TR: "Turquía", TV: "Tuvalu", UA: "Ucrania",
  UG: "Uganda", UY: "Uruguay", UZ: "Uzbekistán", VU: "Vanuatu", VA: "Vaticano",
  VE: "Venezuela", VN: "Vietnam", YE: "Yemen", ZM: "Zambia", ZW: "Zimbabue",
};

interface Props {
  config?: GeobloqueoConfig;
  saving?: boolean;
  onSave?: () => void;
  onUpdateGeobloqueo?: (updates: Partial<GeobloqueoConfig>) => void;
}

export function GeobloqueoTool({ config, saving, onSave, onUpdateGeobloqueo }: Props) {
  const geo = config || defaultGeobloqueoConfig;
  const [search, setSearch] = useState('');
  const [showAddBlocked, setShowAddBlocked] = useState(false);
  const [showAddAllowed, setShowAddAllowed] = useState(false);
  const [addSearch, setAddSearch] = useState('');

  const bloquear_lista = geo.modo === 'bloquear_lista';
  const paisesActivos = bloquear_lista ? geo.paises_bloqueados : geo.paises_permitidos;

  const togglePais = (code: string) => {
    if (!onUpdateGeobloqueo) return;
    if (bloquear_lista) {
      const blocked = geo.paises_bloqueados.includes(code)
        ? geo.paises_bloqueados.filter(c => c !== code)
        : [...geo.paises_bloqueados, code];
      onUpdateGeobloqueo({ paises_bloqueados: blocked });
    } else {
      const allowed = geo.paises_permitidos.includes(code)
        ? geo.paises_permitidos.filter(c => c !== code)
        : [...geo.paises_permitidos, code];
      onUpdateGeobloqueo({ paises_permitidos: allowed });
    }
  };

  const addPais = (code: string) => {
    if (!onUpdateGeobloqueo) return;
    if (bloquear_lista) {
      if (!geo.paises_bloqueados.includes(code)) {
        onUpdateGeobloqueo({ paises_bloqueados: [...geo.paises_bloqueados, code] });
      }
    } else {
      if (!geo.paises_permitidos.includes(code)) {
        onUpdateGeobloqueo({ paises_permitidos: [...geo.paises_permitidos, code] });
      }
    }
    setAddSearch('');
    setShowAddBlocked(false);
    setShowAddAllowed(false);
  };

  const filteredPaises = useMemo(() => {
    const lista = bloquear_lista ? geo.paises_bloqueados : geo.paises_permitidos;
    if (!search) return lista;
    const q = search.toLowerCase();
    return lista.filter(code =>
      PAISES[code]?.toLowerCase().includes(q) || code.toLowerCase().includes(q)
    );
  }, [search, geo.paises_bloqueados, geo.paises_permitidos, bloquear_lista]);

  const addFiltered = useMemo(() => {
    if (!addSearch) return [];
    const q = addSearch.toLowerCase();
    const yaEnLista = bloquear_lista
      ? new Set(geo.paises_bloqueados)
      : new Set(geo.paises_permitidos);
    return Object.entries(PAISES)
      .filter(([code, name]) =>
        !yaEnLista.has(code) &&
        (name.toLowerCase().includes(q) || code.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [addSearch, geo.paises_bloqueados, geo.paises_permitidos, bloquear_lista]);

  const totalPaises = bloquear_lista
    ? geo.paises_bloqueados.length
    : geo.paises_permitidos.length;

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blis-red/10 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-blis-red" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Geobloqueo</h2>
            <p className="text-xs text-gray-500">Control de acceso por país vía Vercel Edge</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs ${geo.habilitado ? 'text-green-400' : 'text-gray-500'}`}>
              {geo.habilitado ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={() => onUpdateGeobloqueo?.({ habilitado: !geo.habilitado })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                geo.habilitado ? 'bg-green-500' : 'bg-zinc-700'
              }`}
            >
              <motion.div
                animate={{ x: geo.habilitado ? 20 : 2 }}
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md"
              />
            </button>
          </div>
        </div>

        {/* Modo selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Modo:</span>
          <div className="flex bg-zinc-900 rounded-lg p-0.5">
            <button
              onClick={() => onUpdateGeobloqueo?.({ modo: 'bloquear_lista' })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                bloquear_lista ? 'bg-blis-red text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" />
              Bloquear lista
            </button>
            <button
              onClick={() => onUpdateGeobloqueo?.({ modo: 'permitir_lista' })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                !bloquear_lista ? 'bg-blis-red text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Unlock className="w-3 h-3" />
              Solo permitir lista
            </button>
          </div>
          <span className="text-[10px] text-gray-600 ml-2">
            {bloquear_lista
              ? 'Bloquea países específicos, permite el resto'
              : 'Solo permite países específicos, bloquea el resto'}
          </span>
        </div>
      </div>

      {/* Content */}
      {geo.habilitado && (
        <div className="p-6 space-y-5">
          {/* Stats y búsqueda */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-1.5">
              {bloquear_lista ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Check className="w-3.5 h-3.5 text-green-400" />
              )}
              <span className="text-xs text-gray-300">
                {bloquear_lista ? `${totalPaises} países bloqueados` : `${totalPaises} países permitidos`}
              </span>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none border border-white/5 focus:border-blis-red/30"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Grid de países */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredPaises.map(code => (
              <div
                key={code}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                  paisesActivos.includes(code)
                    ? 'bg-blis-red/5 border-blis-red/20 text-white'
                    : 'bg-zinc-900 border-white/5 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-5 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800/50">
                    <Flag code={code} height="20" />
                  </div>
                  <span className="text-xs truncate">{PAISES[code] || code}</span>
                  <span className="text-[10px] text-gray-500 shrink-0 ml-auto">{code}</span>
                </div>
                <button
                  onClick={() => togglePais(code)}
                  className={`w-8 h-5 rounded-full transition-colors relative shrink-0 ${
                    paisesActivos.includes(code) ? 'bg-blis-red' : 'bg-zinc-700'
                  }`}
                >
                  <motion.div
                    animate={{ x: paisesActivos.includes(code) ? 14 : 2 }}
                    className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-md"
                  />
                </button>
              </div>
            ))}
          </div>

          {filteredPaises.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs">
              No se encontraron países con &quot;{search}&quot;
            </div>
          )}

          {/* Agregar país */}
          {bloquear_lista && (
            <div className="border-t border-white/5 pt-4">
              {!showAddBlocked ? (
                <button
                  onClick={() => setShowAddBlocked(true)}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar país a la lista de bloqueo
                </button>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-300">Agregar país a bloqueados</span>
                    <button
                      onClick={() => { setShowAddBlocked(false); setAddSearch(''); }}
                      className="ml-auto text-gray-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Escribe el nombre del país..."
                      value={addSearch}
                      onChange={(e) => setAddSearch(e.target.value)}
                      className="w-full bg-zinc-900 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none border border-white/5 focus:border-blis-red/30"
                      autoFocus
                    />
                  </div>
                  {addFiltered.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {addFiltered.map(([code, name]) => (
                        <button
                          key={code}
                          onClick={() => addPais(code)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-blis-red/10 hover:text-white transition-colors text-left"
                        >
                          <div className="w-7 h-5 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800/50">
                            <Flag code={code} height="20" />
                          </div>
                          <span>{name}</span>
                          <span className="text-[10px] text-gray-600 ml-auto">{code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mensaje de bloqueo */}
          <div className="border-t border-white/5 pt-4">
            <label className="block text-xs text-gray-400 mb-2">
              Mensaje mostrado al usuario bloqueado:
            </label>
            <input
              type="text"
              value={geo.mensaje_bloqueo}
              onChange={(e) => onUpdateGeobloqueo?.({ mensaje_bloqueo: e.target.value })}
              className="w-full bg-zinc-900 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none border border-white/5 focus:border-blis-red/30"
              placeholder="Lo sentimos, este contenido no está disponible..."
            />
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2 border-t border-white/5">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

