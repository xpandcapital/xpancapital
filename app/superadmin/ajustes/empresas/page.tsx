"use client"

import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useEmpresas } from './_hooks'
import { EmpresaCard, CreateEmpresaModal, UsersModal, ConfigModal } from './_components'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export default function EmpresasPage() {
  const { showToast } = useToast()
  const {
    empresas, loading, showCreate, showUsers, showConfig,
    configData, users, searchResults, loadingUsers,
    newEmpresa, newUser, saving, deleting, selectedEmpresa,
    setNewEmpresa, setNewUser, setShowCreate, setShowUsers, setShowConfig,
    handleCreate, handleDelete, handleCreateUser, handleAssignUser,
    handleUnassignUser, handleSaveConfig, searchUsers, generateSlug,
    openUsers, openConfig,
  } = useEmpresas()

  const onCreate = async () => {
    const result = await handleCreate()
    if (result === true) {
      showToast('Empresa creada exitosamente', 'success')
    } else {
      showToast(typeof result === 'string' ? result : 'Error al crear', 'error')
    }
  }

  const onDelete = async (id: string) => {
    const result = await handleDelete(id)
    if (typeof result === 'string') {
      showToast(result, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Empresas</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Gestiona las empresas del sistema. Cada empresa tiene sus propias API keys, usuarios y configuración.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full sm:w-auto bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Plus className="w-4 h-4" />Nueva Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empresas.map(empresa => (
          <EmpresaCard
            key={empresa.id}
            empresa={empresa}
            onDelete={onDelete}
            onViewUsers={openUsers}
            onConfig={openConfig}
            deleting={deleting}
            mainEmpresaId={DEFAULT_EMPRESA_ID}
          />
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateEmpresaModal
            newEmpresa={newEmpresa}
            setNewEmpresa={setNewEmpresa}
            onSave={onCreate}
            saving={saving}
            onClose={() => setShowCreate(false)}
            generateSlug={generateSlug}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUsers && selectedEmpresa && (
          <UsersModal
            empresa={selectedEmpresa}
            users={users}
            loadingUsers={loadingUsers}
            searchResults={searchResults}
            newUser={newUser}
            saving={saving}
            setNewUser={setNewUser}
            onCreateUser={handleCreateUser}
            onAssignUser={handleAssignUser}
            onUnassignUser={handleUnassignUser}
            onSearch={searchUsers}
            onClose={() => setShowUsers(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfig && selectedEmpresa && (
          <ConfigModal
            empresa={selectedEmpresa}
            config={configData}
            saving={saving}
            onSave={handleSaveConfig}
            onClose={() => setShowConfig(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}