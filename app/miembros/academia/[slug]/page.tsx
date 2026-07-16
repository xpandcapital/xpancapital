import { redirect } from 'next/navigation'

export default async function AcademiaCursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/miembros/academia?curso=${slug}`)
}
