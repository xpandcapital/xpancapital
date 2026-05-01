"use client"

import { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GestionDeLotesApp from '../../GestionDeLotes'
import { useGestionLotes } from './_hooks'
import { LoadingSpinner, ProjectNotFound, ProjectSelector, SuspenseFallback } from './_components'

function GestionLotesContent() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const {
    isLoading,
    projects,
    activeProjectId,
    activeProjectName,
    activeProjectLogo,
    projectNotFound,
    handleProjectChange,
  } = useGestionLotes(slug)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (projectNotFound) {
    return (
      <ProjectNotFound
        slug={slug}
        onNavigate={() => router.push('/superadmin/gestion-lotes/_none_')}
      />
    )
  }

  if (!activeProjectId) {
    return (
      <ProjectSelector
        projects={projects}
        onSelectProject={handleProjectChange}
        onNavigateToProjects={() => router.push('/superadmin/proyectos')}
      />
    )
  }

  return (
    <GestionDeLotesApp
      initialProjectId={activeProjectId}
      initialProjectName={activeProjectName}
      initialProjectLogo={activeProjectLogo}
    />
  )
}

export default function GestionLotesPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <GestionLotesContent />
    </Suspense>
  )
}