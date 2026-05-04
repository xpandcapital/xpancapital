export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  if (typeof html !== 'string') return String(html)
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}
