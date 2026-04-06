"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Key, Database, Search, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { searchNotionDatabases } from "@/lib/integrations/notion";

export default function IntegracionesPage() {
  const { showToast } = useToast();
  
  const [notionApiKey, setNotionApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [databases, setDatabases] = useState<any[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSearchDatabases = async () => {
    if (!notionApiKey.trim()) {
      showToast("Ingresa tu API Key de Notion", "error");
      return;
    }

    setTesting(true);
    setConnectionStatus("idle");

    try {
      const result = await searchNotionDatabases(notionApiKey);
      
      if (result.success && result.databases) {
        setDatabases(result.databases);
        setConnectionStatus("success");
        showToast(`Se encontraron ${result.databases.length} bases de datos`, "success");
      } else {
        setConnectionStatus("error");
        showToast(result.error || "Error al buscar bases de datos", "error");
      }
    } catch {
      setConnectionStatus("error");
      showToast("Error al conectar con Notion", "error");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveIntegration = async () => {
    if (!notionApiKey.trim() || !selectedDatabase) {
      showToast("Completa todos los campos", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/integraciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "notion",
          nombre: "Notion - Leads",
          config: {
            api_key: notionApiKey,
            database_id: selectedDatabase
          },
          activa: true
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast("Integración guardada correctamente", "success");
      } else {
        showToast(data.error || "Error al guardar", "error");
      }
    } catch {
      showToast("Error al guardar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black">Integraciones</h1>
          <p className="text-gray-400 text-sm mt-1">
            Conecta con herramientas externas para sincronizar tus leads
          </p>
        </div>

        {/* Notion Integration */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-8 h-8">
                <path 
                  d="M6.02 19.23l36.18-3.64v35.09H6.02zm36.18 32.03v35.65l-36.18-3.62V48.26zm4.41-35.96l48.14-5.28v42.7H50.61zm48.14 36.17v42.21l-48.14-4.26V51.44z" 
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Notion</h2>
              <p className="text-sm text-gray-400">
                Sincroniza los leads automáticamente con una base de datos de Notion
              </p>
            </div>
            {connectionStatus === "success" && (
              <span className="flex items-center gap-1 text-sm text-emerald-400">
                <Check className="w-4 h-4" />
                Conectado
              </span>
            )}
            {connectionStatus === "error" && (
              <span className="flex items-center gap-1 text-sm text-red-400">
                <X className="w-4 h-4" />
                Error
              </span>
            )}
          </div>

          {/* Paso 1: Obtener API Key */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blis-red/20 text-blis-red text-xs flex items-center justify-center font-bold">1</span>
              <h3 className="font-bold">Obtener API Key</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Ve a <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blis-red hover:underline flex items-center gap-1 inline">notion.so/my-integraciones <ExternalLink className="w-3 h-3" /></a> y crea una nueva integración. Luego copia el "Internal Integration Token".
            </p>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="secret_xxxxxxxxxxxxx"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blis-red outline-none"
                />
              </div>
              <button
                onClick={handleSearchDatabases}
                disabled={testing || !notionApiKey.trim()}
                className="px-4 py-3 bg-blis-red text-white rounded-xl font-bold hover:bg-blis-red/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar DBs
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Paso 2: Seleccionar Base de Datos */}
          {databases.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blis-red/20 text-blis-red text-xs flex items-center justify-center font-bold">2</span>
                <h3 className="font-bold">Seleccionar Base de Datos</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Importante: Comparte tu base de datos con la integración en Notion (botón "Share" en la esquina superior derecha).
              </p>
              
              <div className="space-y-2">
                {databases.map((db: any) => (
                  <button
                    key={db.id}
                    onClick={() => setSelectedDatabase(db.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      selectedDatabase === db.id
                        ? "border-blis-red bg-blis-red/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <Database className="w-5 h-5 text-gray-400" />
                    <div className="text-left flex-1">
                      <p className="font-medium text-white">
                        {db.title?.[0]?.plain_text || "Sin título"}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {db.id}
                      </p>
                    </div>
                    {selectedDatabase === db.id && (
                      <Check className="w-5 h-5 text-blis-red" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 3: Guardar */}
          {selectedDatabase && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blis-red/20 text-blis-red text-xs flex items-center justify-center font-bold">3</span>
                <h3 className="font-bold">Guardar Integración</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Guarda la configuración para empezar a sincronizar los leads con Notion.
              </p>
              
              <button
                onClick={handleSaveIntegration}
                disabled={loading}
                className="px-6 py-3 bg-blis-red text-white rounded-xl font-bold hover:bg-blis-red/80 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Guardar Integración
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* WhatsApp Integration */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 opacity-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-500" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.299-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.435-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">WhatsApp</h2>
              <p className="text-sm text-gray-400">
                Recibe notificaciones en WhatsApp cuando llegue un nuevo lead
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
              Próximamente
            </span>
          </div>
        </div>

        {/* Email Integration */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mt-6 opacity-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Email (Resend)</h2>
              <p className="text-sm text-gray-400">
                Envía emails automáticos cuando se registre un nuevo lead
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}