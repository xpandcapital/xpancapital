const ALLOWED_TAGS = [
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'b', 'bdi', 'bdo',
  'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
  'data', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em',
  'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'mark',
  'nav', 'ol', 'p', 'pre', 'q', 'rp', 'rt', 'ruby', 's', 'samp',
  'section', 'small', 'span', 'strong', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
  'var', 'wbr',
]

const ALLOWED_ATTRS = [
  'abbr', 'align', 'alt', 'bgcolor', 'border', 'cellpadding', 'cellspacing',
  'class', 'color', 'cols', 'colspan', 'coords', 'data-*', 'datetime',
  'dir', 'download', 'face', 'headers', 'height', 'href', 'hreflang',
  'id', 'lang', 'name', 'rel', 'rev', 'rows', 'rowspan', 'scope',
  'shape', 'size', 'span', 'src', 'srcset', 'start', 'style',
  'summary', 'target', 'title', 'type', 'valign', 'value', 'width',
]

export function sanitizeHtml(html: string): string {
  if (!html) return ''

  let result = html

  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  result = result.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  result = result.replace(/on\w+\s*=\s*[^\s>]+/gi, '')
  result = result.replace(/javascript\s*:/gi, '')
  result = result.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '<p>[Contenido embebido bloqueado]</p>')
  result = result.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '<p>[Objeto bloqueado]</p>')
  result = result.replace(/<embed\b[^>]*>/gi, '<p>[Contenido bloqueado]</p>')
  result = result.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '<p>[Applet bloqueado]</p>')

  const styleBlockRegex = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi
  result = result.replace(styleBlockRegex, '')

  const urlRegex = /url\s*\(\s*['"]?\s*(?:javascript|data)\s*:/gi
  result = result.replace(urlRegex, 'url(blocked:')

  const expressionRegex = /expression\s*\(/gi
  result = result.replace(expressionRegex, 'blocked(')

  return result
}

export function sanitizeText(text: string): string {
  if (!text) return ''
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
