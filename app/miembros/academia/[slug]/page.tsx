import { redirect } from 'next/navigation'

export default async function AcademiaCursoPage({ params }: { params: { slug: string } }) {
  redirect(`/miembros/academia?curso=${params.slug}`)
}
